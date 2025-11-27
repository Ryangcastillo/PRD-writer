import React from 'react';

interface FormFieldsetProps {
  title: string;
  children: React.ReactNode;
}

const FormFieldset: React.FC<FormFieldsetProps> = ({ title, children }) => {
  return (
    <fieldset className="border border-slate-200 dark:border-slate-700/80 rounded-lg p-6 bg-slate-50 dark:bg-slate-800/50 shadow-md">
      <legend className="text-lg font-semibold text-slate-800 dark:text-white px-2 -ml-2">{title}</legend>
      <div className="space-y-6">
        {children}
      </div>
    </fieldset>
  );
};

export default FormFieldset;