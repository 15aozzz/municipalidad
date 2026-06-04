export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCertainty = (certainty) => {
  if (certainty === null || certainty === undefined) return 'N/A';
  return `${Number(certainty).toFixed(1)}%`;
};
