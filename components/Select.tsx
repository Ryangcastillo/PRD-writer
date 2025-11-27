import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, error, ...props }) => {
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const defaultClasses = "border-slate-300 dark:border-slate-700 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-400 dark:hover:border-slate-600";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
        {label} {props.required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
            id={id}
            {...props}
            className={`block w-full bg-white dark:bg-slate-950 border rounded-lg shadow-sm py-2.5 pl-3.5 pr-10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 sm:text-sm appearance-none transition-all duration-200 ${error ? errorClasses : defaultClasses}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
       {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;