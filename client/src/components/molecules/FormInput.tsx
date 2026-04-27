import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="space-y-2 w-full text-left">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-[var(--brand-primary)]">
            {icon}
          </div>
        )}
        <input 
          {...props}
          className={`w-full p-3 ${icon ? 'pl-11' : 'px-4'} border-2 rounded-xl focus:ring-4 outline-none transition-all ${
            error 
              ? 'border-rose-200 focus:ring-rose-100 focus:border-rose-500' 
              : 'border-[var(--brand-primary)]/20 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)]'
          } ${className}`}
        />
      </div>
      {error && (
        <p className="text-[10px] text-rose-500 font-bold mt-1.5 uppercase tracking-wider animate-pulse ml-1">{error}</p>
      )}
    </div>
  );
};
