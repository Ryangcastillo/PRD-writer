import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, error, ...props }) => {
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const defaultClasses = "border-slate-300 dark:border-slate-700 focus:ring-sky-500 focus:border-sky-500";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {props.required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <select
        id={id}
        {...props}
        className={`block w-full bg-white dark:bg-slate-900 border rounded-md shadow-sm py-2 pl-3 pr-10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 sm:text-sm ${error ? errorClasses : defaultClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {children}
      </select>
       {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;