# -*- coding: utf-8 -*-
"""
Google Colab - Clasificador de Trámites Municipales - dataset_tramites_municipales_500_unicos
"""
!pip install flask-cors
!pip install pyngrok
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok

# ==========================================
# Paso 2: Montar Google Drive y Cargar Dataset
# ==========================================
from google.colab import drive
drive.mount('/content/drive')

# 👇 Ruta del dataset de 500 registros únicos en tu Google Drive
dataset_path = '/content/drive/MyDrive/Colab Notebooks/senati/dataset_tramites_municipales_500_unicos.csv'

df = pd.read_csv(dataset_path)
df['texto'] = df['texto'].fillna('')

print("📊 Columnas detectadas:", df.columns.tolist())
print("📦 Total de ejemplos:", len(df))
print()
print("📈 Distribución por prioridad:")
print(df['prioridad'].value_counts())
print()
print("🏢 Distribución por área destino:")
print(df['area_destino'].value_counts())

# ==========================================
# Paso 3: Entrenamiento de los Modelos (SVM Calibrados)
# ==========================================

def crear_pipeline():
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),   # unigramas y bigramas
            sublinear_tf=True,    # normaliza frecuencias altas
            min_df=1
        )),
        ('clf', CalibratedClassifierCV(
            LinearSVC(
                C=1.0,
                class_weight='balanced',
                max_iter=2000
            ),
            cv=5
        ))
    ])

# --- Modelo 1: Predicción de Prioridad ---
pipeline_prioridad = crear_pipeline()
pipeline_prioridad.fit(df['texto'], df['prioridad'])
print("✅ Modelo de PRIORIDAD entrenado.")

# --- Modelo 2: Predicción de Área Destino ---
pipeline_area = crear_pipeline()
pipeline_area.fit(df['texto'], df['area_destino'])
print("✅ Modelo de ÁREA DESTINO entrenado.")

# ==========================================
# Paso 4: Acción Sugerida (Reglas de Negocio Adaptadas)
# ==========================================
def obtener_accion_sugerida(texto, prioridad, area):
    t = texto.lower()

    # Mapeo según los nombres de área exactos en el dataset 500 (sin tildes)
    reglas = {
        'Registro Civil': [
            (['nacimiento', 'inscripcion', 'recien nacido', 'bebe'], 'Registro Civil → Inscripción de Nacimiento'),
            (['matrimonio', 'casarme', 'boda', 'contrayente'],       'Registro Civil → Matrimonio Civil'),
            (['divorcio'],                                            'Registro Civil → Divorcio Rápido'),
            (['defuncion', 'fallecido'],                             'Registro Civil → Acta de Defunción'),
        ],
        'Rentas y Comercializacion': [
            (['fraccionamiento', 'cobranza coactiva', 'embargo'],    'Rentas → Fraccionamiento de Deuda'),
            (['licencia', 'funcionamiento', 'bodega', 'negocio'],    'Rentas → Licencia de Funcionamiento'),
            (['predial', 'autoavaluo', 'alcabala'],                  'Rentas → Impuesto Predial / Autoavalúo'),
            (['arbitrio'],                                           'Rentas → Pago de Arbitrios'),
            (['anuncio', 'letrero', 'panel'],                        'Rentas → Autorización de Anuncio'),
        ],
        'Desarrollo Urbano y Obras': [
            (['rotura', 'romper via', 'romper pista'],               'Obras → Autorización de Rotura de Vía'),
            (['posesion', 'servicios basicos'],                      'Obras → Constancia de Posesión'),
            (['parametros', 'urbanistico'],                          'Obras → Certificado de Parámetros'),
            (['licencia', 'edificacion', 'construir', 'planos'],     'Obras → Licencia de Edificación'),
        ],
        'Gestion de Riesgos': [
            (['detalle', 'hospital', 'colegio', 'inflamable', 'itse'], 'Defensa Civil → Inspección Técnica de Seguridad (ITSE)'),
        ],
        'Secretaria General': [
            (['apelacion', 'clausura', 'sancion'],                   'Secretaría → Recurso de Apelación'),
            (['reconsideracion', 'cobro indebido'],                  'Secretaría → Recurso de Reconsideración'),
        ],
    }

    # Buscar coincidencia de palabras clave dentro del área clasificada
    for palabras, accion in reglas.get(area, []):
        if any(p in t for p in palabras):
            return f'Derivar a {accion}'

    # Fallback por prioridad si no hay palabra clave específica
    defaults = {
        'Alta':  'Atención urgente → Derivar al jefe de área',
        'Media': 'Derivar al área administrativa correspondiente',
        'Baja':  'Derivar a Mesa de Partes',
    }
    return defaults.get(prioridad, 'Derivar a Mesa de Partes')

# ==========================================
# Paso 5: Creación de la API Flask
# ==========================================
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/clasificar', methods=['POST'])
def clasificar_tramite():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos JSON"}), 400

        asunto      = data.get('asunto', '')
        descripcion = data.get('descripcion', '')

        # ✅ El texto se une con el mismo formato consistente que envía el backend
        texto_recibido = f"Asunto: {asunto}\nDescripción: {descripcion}".strip()

        # --- Predicción de Prioridad ---
        prioridad_predicha   = pipeline_prioridad.predict([texto_recibido])[0]
        probs_prioridad      = pipeline_prioridad.predict_proba([texto_recibido])[0]
        clases_prioridad     = pipeline_prioridad.classes_
        idx                  = np.where(clases_prioridad == prioridad_predicha)[0][0]
        certeza              = probs_prioridad[idx] * 100

        prioridad_formateada = prioridad_predicha.strip().capitalize()
        if prioridad_formateada not in ['Alta', 'Media', 'Baja']:
            prioridad_formateada = 'Media'

        # --- Predicción de Área Destino ---
        area_predicha        = pipeline_area.predict([texto_recibido])[0]
        probs_area           = pipeline_area.predict_proba([texto_recibido])[0]
        certeza_area         = max(probs_area) * 100

        # --- Acción Sugerida (utiliza área predicha y prioridad) ---
        accion_sugerida = obtener_accion_sugerida(
            texto_recibido,
            prioridad_formateada,
            area_predicha
        )

        response_data = {
            "prioridad"      : prioridad_formateada,
            "confianza"      : round(float(certeza), 2),
            "area_destino"   : area_predicha,
            "confianza_area" : round(float(certeza_area), 2),
            "accion_sugerida": accion_sugerida
        }

        print(
            f"📥 [{prioridad_formateada} {certeza:.1f}%] "
            f"[{area_predicha} {certeza_area:.1f}%] "
            f"→ {accion_sugerida}"
        )
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# Paso 6: Lanzamiento con ngrok
# ==========================================
NGROK_TOKEN = "348V59LZI7sPCVBvJ9qray6xq8E_qQB2s7giK7mU7f6ZyPrM"

if NGROK_TOKEN != "TU_TOKEN_DE_NGROK_AQUI":
    ngrok.set_auth_token(NGROK_TOKEN)
else:
    print("⚠️  Recuerda configurar tu token de ngrok.")

public_url = ngrok.connect(5000)
print("\n" + "="*55)
print("🔗 Copia esta URL en tu archivo .env del Backend:")
print(f"👉   {public_url.public_url}/clasificar   👈")
print("="*55 + "\n")

if __name__ == '__main__':
    app.run(port=5000)
