import React from 'react';

interface FormFieldsetProps {
  title: string;
  children: React.ReactNode;
}

const FormFieldset: React.FC<FormFieldsetProps> = ({ title, children }) => {
  return (
    <fieldset className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <legend className="text-lg font-bold text-slate-800 dark:text-slate-100 px-3 bg-white dark:bg-slate-900 rounded-lg">{title}</legend>
      <div className="space-y-6 pt-2">
        {children}
      </div>
    </fieldset>
  );
};

export default FormFieldset;