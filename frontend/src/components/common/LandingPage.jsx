import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  TrendingUp,
  FileCheck,
  Activity
} from 'lucide-react';
import { getPublicTramite } from '../../services/tramiteService';
import { AuthContext } from '../../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tramiteId, setTramiteId] = useState('');
  const [dni, setDni] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!tramiteId || !dni) {
      setSearchError('Por favor, ingrese el ID del trámite y el DNI del solicitante.');
      return;
    }

    setIsLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const response = await getPublicTramite(tramiteId, dni);
      if (response.success && response.data) {
        setSearchResult(response.data);
      } else {
        setSearchError('No se encontró el trámite con los datos ingresados.');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al conectar con el servidor. Verifique sus datos.';
      setSearchError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <span className="badge badge-warning" style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Pendiente</span>;
      case 'en_proceso':
        return <span className="badge badge-primary" style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)' }}>En Proceso</span>;
      case 'atendido':
        return <span className="badge badge-success" style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>Atendido</span>;
      case 'rechazado':
        return <span className="badge badge-danger" style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>Rechazado</span>;
      default:
        return <span>{estado}</span>;
    }
  };

  const faqs = [
    {
      q: '¿Cómo funciona la clasificación inteligente por IA?',
      a: 'Cuando registra un trámite, nuestro sistema analiza semánticamente el asunto y la descripción utilizando un modelo de Inteligencia Artificial alojado en la nube. La IA clasifica automáticamente la prioridad (Alta, Media, Baja) y sugiere la oficina correspondiente para agilizar el proceso.'
    },
    {
      q: '¿Qué es el número de expediente / trámite?',
      a: 'Es un identificador único numérico que se le otorga al finalizar la creación del trámite. Con este número y su DNI, cualquier persona puede consultar el estado público del trámite desde la página de inicio sin necesidad de registrarse.'
    },
    {
      q: '¿Qué requisitos necesito para registrarme?',
      a: 'Solo necesita su DNI (documento nacional de identidad de 8 dígitos) y un correo electrónico válido. El registro es gratuito e inmediato.'
    },
    {
      q: '¿Cuáles son los tiempos de respuesta estimados?',
      a: 'Los trámites clasificados como de Prioridad Alta son derivados con urgencia y atendidos en un plazo menor a 24 horas hábiles. La prioridad Media y Baja se procesa regularmente según orden de llegada y área correspondiente.'
    }
  ];

  const handleStartTramite = () => {
    if (user) {
      if (user.rol === 'staff' || user.rol === 'admin') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '1rem' }}>
      
      {/* SECTION 1: HERO */}
      <section style={{ 
        background: 'linear-gradient(135deg, rgba(19, 81, 165, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.15 }}>
          <Activity size={180} color="var(--primary-color)" />
        </div>
        
        <span className="badge-ml" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
          Tecnología de Vanguardia e IA
        </span>
        
        <h2 style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
          Mesa de Partes Virtual e Inteligente
        </h2>
        
        <p style={{ maxWidth: '800px', margin: '0 auto 2.5rem auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Bienvenido al portal digital de la <strong>Municipalidad Provincial de Yau</strong>.
          Presente sus trámites y solicitudes las 24 horas del día. Nuestro motor de Inteligencia Artificial indexará, clasificará y derivará sus documentos en tiempo real para agilizar su respuesta.
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleStartTramite} 
            className="btn-submit" 
            style={{ width: 'auto', padding: '1rem 2rem', margin: 0 }}
          >
            {user ? 'Ir a mi Panel / Nuevo Trámite' : 'Iniciar Nuevo Trámite'} <ArrowRight size={18} />
          </button>
          
          {!user && (
            <button 
              onClick={() => navigate('/register')} 
              style={{ 
                width: 'auto', 
                padding: '1rem 2rem', 
                margin: 0,
                background: 'transparent',
                border: '1.5px solid var(--primary-color)',
                color: 'var(--primary-color)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-glow)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Registrarse en la Plataforma
            </button>
          )}
        </div>
      </section>

      {/* SECTION 2: POPULAR PROCEDURES */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Servicios y Trámites Frecuentes
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Realice sus gestiones desde la comodidad de su hogar con derivación instantánea.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          
          <div className="card-glass" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', width: '45px', height: '45px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
              <FileCheck size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Licencia de Funcionamiento</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Solicite o renueve la licencia comercial para su establecimiento o negocio local con análisis de planos por catastro.
            </p>
          </div>

          <div className="card-glass" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', width: '45px', height: '45px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              <Zap size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Obras y Urbanismo</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Presente solicitudes de construcción, demolición, subdivisiones de predios y consultas de zonificación urbana.
            </p>
          </div>

          <div className="card-glass" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: '45px', height: '45px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <TrendingUp size={24} />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Tributos y Rentas</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Consulte su estado de cuenta del Impuesto Predial y arbitrios municipales, y presente reclamaciones tributarias.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 3: PUBLIC QUERY WIDGET (BUSCADOR PÚBLICO) */}
      <section style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
        <div className="card-glass" style={{ boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--border-color)' }}>
          <div className="card-header" style={{ justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-tertiary)' }}>
            <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              <Search size={22} /> Consulta Rápida de Trámite
            </h3>
          </div>
          <div className="card-body" style={{ padding: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
              ¿Ya ingresó una solicitud? Verifique el estado actual del trámite al instante ingresando el identificador del trámite y su DNI.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                <label htmlFor="pub-tramite-id">N° de Trámite / Expediente</label>
                <div className="input-wrapper">
                  <FileText size={15} />
                  <input 
                    type="number" 
                    id="pub-tramite-id" 
                    className="form-control" 
                    placeholder="Ej. 12"
                    value={tramiteId}
                    onChange={(e) => setTramiteId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                <label htmlFor="pub-dni">DNI del Solicitante</label>
                <div className="input-wrapper">
                  <ShieldCheck size={15} />
                  <input 
                    type="text" 
                    id="pub-dni" 
                    maxLength={8}
                    className="form-control" 
                    placeholder="8 dígitos"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isLoading} 
                style={{ gridColumn: 'span 2', marginTop: '0.5rem', padding: '0.8rem' }}
              >
                {isLoading ? 'Buscando Expediente...' : 'Buscar Trámite'}
              </button>
            </form>

            {searchError && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '0.75rem', 
                borderRadius: '6px', 
                backgroundColor: 'var(--color-danger-bg)', 
                color: 'var(--color-danger)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {searchError}
              </div>
            )}

            {searchResult && (
              <div style={{ 
                marginTop: '2rem', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '1.5rem', 
                textAlign: 'left' 
              }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Expediente N° {searchResult.id}</span>
                  {getStatusBadge(searchResult.estado)}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.82rem', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Ciudadano Solicitante</span>
                    <strong>{searchResult.solicitante}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Asunto del Trámite</span>
                    <strong>{searchResult.asunto}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Fecha de Presentación</span>
                    <strong>{new Date(searchResult.fecha_creacion).toLocaleDateString('es-PE')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Área Asignada</span>
                    <strong>{searchResult.asignado_nombre}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Prioridad Asignada por IA</span>
                    <strong style={{ 
                      color: searchResult.prioridad === 'Alta' ? 'var(--color-danger)' : 
                             searchResult.prioridad === 'Media' ? 'var(--color-warning)' : 'var(--color-success)' 
                    }}>
                      {searchResult.prioridad}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ SECTION */}
      <section style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Preguntas Frecuentes
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Resuelva sus dudas rápidas sobre el uso del canal virtual de la municipalidad.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="card-glass" 
              style={{ 
                padding: '1.25rem', 
                textAlign: 'left', 
                cursor: 'pointer',
                border: activeFaq === index ? '1px solid var(--primary-color)' : '1px solid var(--border-color)'
              }}
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <h4 style={{ 
                fontSize: '0.95rem', 
                fontWeight: 'bold', 
                color: activeFaq === index ? 'var(--primary-color)' : 'var(--text-primary)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                {faq.q}
                <HelpCircle size={16} style={{ color: activeFaq === index ? 'var(--primary-color)' : 'var(--text-muted)' }} />
              </h4>
              {activeFaq === index && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
