import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full mb-10 px-2">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-5 w-full h-1 bg-slate-200 dark:bg-slate-700/60 rounded-full -z-10" />
        
        {/* Active Progress Line */}
        <div 
            className="absolute left-0 top-5 h-1 bg-sky-500 rounded-full -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center group">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 z-10 relative 
                  ${
                  isCompleted 
                    ? 'bg-sky-500 border-sky-500 text-white cursor-pointer hover:bg-sky-600 hover:scale-110 shadow-md shadow-sky-500/20' 
                    : isCurrent 
                      ? 'bg-white dark:bg-slate-800 border-sky-500 text-sky-500 cursor-default ring-4 ring-sky-500/20 scale-110 shadow-lg' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isCompleted ? (
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span className={`mt-3 text-xs font-semibold tracking-wide transition-colors duration-300 absolute top-10 w-32 text-center
                ${isCurrent ? 'text-sky-600 dark:text-sky-400 opacity-100 transform translate-y-0' : 'text-slate-500 dark:text-slate-500 opacity-60'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer for the absolute positioned text */}
      <div className="h-8"></div> 
    </div>
  );
};

export default Stepper;