import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-2 w-full text-left">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <input 
        {...props}
        className={`w-full p-3 border-2 rounded-xl focus:ring-4 outline-none transition-all ${
          error 
            ? 'border-rose-200 focus:ring-rose-100 focus:border-rose-500' 
            : 'border-[var(--brand-primary)]/20 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)]'
        } ${className}`}
      />
      {error && (
        <p className="text-xs text-rose-500 font-bold mt-2 animate-pulse">{error}</p>
      )}
    </div>
  );
};
