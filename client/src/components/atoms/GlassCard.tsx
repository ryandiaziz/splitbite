import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', intensity = 'medium' }) => {
  const intensities = {
    light: 'bg-white/40 border-white/50',
    medium: 'bg-white/60 border-white/60',
    heavy: 'bg-white/80 border-white/80'
  };

  return (
    <div className={`backdrop-blur-xl border ${intensities[intensity]} shadow-2xl rounded-3xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
