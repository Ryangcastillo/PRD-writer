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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
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
  };
  
  const handleRemove = (option: string) => {
    onChange(selectedOptions.filter((item) => item !== option));
  };
  
  const filteredOptions = useMemo(() => 
    options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const errorClasses = "border-red-500 ring-red-500";
  const defaultClasses = "border-slate-300 dark:border-slate-700 focus-within:ring-sky-500 focus-within:border-sky-500";

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center justify-between w-full bg-white dark:bg-slate-900 border rounded-md shadow-sm p-2 text-left focus:outline-none focus:ring-2 min-h-[42px] ${error ? errorClasses : defaultClasses}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex flex-wrap gap-1.5">
            {selectedOptions.length > 0 ? (
                selectedOptions.map(option => (
                    <span key={option} className="flex items-center gap-1.5 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        {option}
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(option);}} className="text-sky-100 hover:text-white">
                           <XIcon className="w-3 h-3"/>
                        </button>
                    </span>
                ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500 px-1">Select options...</span>
            )}
          </span>
          <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-lg rounded-md">
            <div className="p-2">
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <ul className="py-1 max-h-52 overflow-y-auto">
              {filteredOptions.length > 0 ? filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    readOnly
                    className="h-4 w-4 rounded border-slate-400 dark:border-slate-600 bg-slate-200 dark:bg-slate-900 text-sky-600 focus:ring-sky-500 mr-3 pointer-events-none"
                  />
                  {option}
                </li>
              )) : (
                <li className="px-3 py-2 text-sm text-slate-500 text-center">No options found.</li>
              )}
            </ul>
          </div>
        )}
      </div>
       {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;