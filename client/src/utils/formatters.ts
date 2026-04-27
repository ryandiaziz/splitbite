/**
 * Currency formatters
 */
export const formatIDR = (val: string | number) => {
  if (!val && val !== 0) return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  if (num === '') return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(num));
};

export const parseIDR = (val: string) => {
  return val.replace(/\./g, '');
};

/**
 * Timer formatter: returns "HH:MM:SS" or "MM:SS"
 */
export const formatTimeLeft = (millis: number) => {
  if (millis <= 0) return '00:00';
  const seconds = Math.floor((millis / 1000) % 60);
  const minutes = Math.floor((millis / (1000 * 60)) % 60);
  const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};
