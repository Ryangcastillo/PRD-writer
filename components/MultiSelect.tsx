import React, { useState, useRef, useEffect, useMemo } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';
import XIcon from './icons/XIcon';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedOptions, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
     if(isOpen && inputRef.current) {
        inputRef.current.focus();
     }
  }, [isOpen]);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if(isOpen) {
      setSearchTerm("");
    }
  }

  const handleSelect = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
    // Keep open for multiple selection
  };
  
  const handleRemove = (option: string) => {
    onChange(selectedOptions.filter((item) => item !== option));
  };
  
  const filteredOptions = useMemo(() => 
    options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const errorClasses = "border-red-500 ring-red-500";
  const defaultClasses = "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500";

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <div
          onClick={handleToggle}
          className={`flex items-center justify-between w-full bg-white dark:bg-slate-950 border rounded-lg shadow-sm p-2 text-left focus:outline-none min-h-[46px] cursor-pointer transition-all duration-200 ${error ? errorClasses : defaultClasses}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex flex-wrap gap-2">
            {selectedOptions.length > 0 ? (
                selectedOptions.map(option => (
                    <span key={option} className="flex items-center gap-1.5 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800 animate-scale-in">
                        {option}
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(option);}} className="text-sky-400 hover:text-sky-700 dark:hover:text-white transition-colors rounded-full p-0.5 hover:bg-sky-200 dark:hover:bg-sky-800">
                           <XIcon className="w-3 h-3"/>
                        </button>
                    </span>
                ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500 px-2 text-sm">Select options...</span>
            )}
          </span>
          <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 mr-1 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg overflow-hidden animate-fade-in-up origin-top">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <input 
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin">
              {filteredOptions.length > 0 ? filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center transition-colors"
                >
                  <div className={`flex items-center justify-center h-4 w-4 rounded border mr-3 transition-colors ${selectedOptions.includes(option) ? 'bg-sky-500 border-sky-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                      {selectedOptions.includes(option) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  {option}
                </li>
              )) : (
                <li className="px-4 py-8 text-sm text-slate-500 text-center flex flex-col items-center">
                    <span className="text-xl mb-1">🔍</span>
                    No options found.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
       {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;