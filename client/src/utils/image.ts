const MAX_DIMENSION = 800; // max width/height after resize
const JPEG_QUALITY = 0.5;  // aggressive compression for WebSocket transport

/**
 * Compress image using Canvas — returns a much smaller base64 string
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(base64);
    };
    img.onerror = () => reject(new Error('Failed to process image'));
    img.src = URL.createObjectURL(file);
  });
}
