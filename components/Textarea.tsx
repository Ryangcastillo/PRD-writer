import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, ...props }) => {
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const defaultClasses = "border-slate-300 dark:border-slate-700 focus:ring-sky-500 focus:border-sky-500 hover:border-slate-400 dark:hover:border-slate-600";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
        {label} {props.required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <textarea
        id={id}
        {...props}
        className={`block w-full bg-white dark:bg-slate-950 border rounded-lg shadow-sm py-2.5 px-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 sm:text-sm resize-vertical transition-all duration-200 ${error ? errorClasses : defaultClasses}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
       {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;