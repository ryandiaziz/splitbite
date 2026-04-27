import React from 'react';

interface LightboxProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  alt: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  show,
  onClose,
  title,
  subtitle,
  imageUrl,
  alt,
}) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all active:scale-90"
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="max-w-4xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt={alt} 
          className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain animate-scale-in"
        />
        {(title || subtitle) && (
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white text-center">
            {title && <p className="font-bold">{title}</p>}
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
