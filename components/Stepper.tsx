
import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10 rounded-full" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${
                  isCompleted 
                    ? 'bg-sky-500 border-sky-500 text-white cursor-pointer hover:bg-sky-600' 
                    : isCurrent 
                      ? 'bg-white dark:bg-slate-800 border-sky-500 text-sky-500 cursor-default shadow-lg scale-110' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isCompleted ? (
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                   </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span className={`mt-2 text-xs font-semibold uppercase tracking-wider hidden sm:block ${
                isCurrent ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
       <div className="sm:hidden text-center mt-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
             Step {currentStep + 1}: <span className="text-sky-600 dark:text-sky-400">{steps[currentStep]}</span>
          </p>
       </div>
    </div>
  );
};

export default Stepper;
