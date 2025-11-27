
import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl opacity-0 transform translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-50">
        {content}
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
      </div>
    </div>
  );
};

export default Tooltip;
