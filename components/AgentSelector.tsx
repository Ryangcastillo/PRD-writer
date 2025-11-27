
import React, { useState } from 'react';
import type { Agent, AgentSelection } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import SparklesIcon from './icons/SparklesIcon';
import InfoIcon from './icons/InfoIcon';
import Tooltip from './Tooltip';

interface AgentSelectorProps {
  agents: Agent[];
  selection: AgentSelection;
  onChange: (selection: AgentSelection) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selection, onChange }) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleSelection = (agentId: string) => {
    onChange({
      ...selection,
      [agentId]: {
        ...selection[agentId],
        selected: !selection[agentId]?.selected
      }
    });
  };

  const updateContext = (agentId: string, context: string) => {
    onChange({
      ...selection,
      [agentId]: {
        ...selection[agentId],
        context
      }
    });
  };

  const categories = Array.from(new Set(agents.map(a => a.category)));

  return (
    <div className="space-y-10">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-sky-500 rounded-full"></span>
            {category} Team
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {agents.filter(a => a.category === category).map(agent => {
              const isSelected = selection[agent.id]?.selected;
              const isExpanded = expandedAgent === agent.id;

              return (
                <div 
                  key={agent.id} 
                  className={`border rounded-xl transition-all duration-300 overflow-hidden group ${
                    isSelected 
                      ? 'bg-white dark:bg-slate-800 border-sky-500 ring-1 ring-sky-500/50 shadow-lg shadow-sky-500/5' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(agent.id)}
                          className="peer h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-semibold transition-colors duration-200 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {agent.name}
                            </h4>
                            <Tooltip content={agent.roleDescription}>
                              <div className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                                <InfoIcon className="w-4 h-4" />
                              </div>
                            </Tooltip>
                            {isSelected && <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse ml-auto sm:ml-0"></span>}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center gap-1">
                          {agent.role} 
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className={`p-2 rounded-full text-slate-400 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 ${isExpanded ? 'bg-slate-100 dark:bg-slate-700 rotate-180 text-sky-600 dark:text-sky-400' : ''}`}
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="pt-4 space-y-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {agent.description}
                          </p>
                        </div>
                        
                        <div className="bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                          <h5 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <span className="text-amber-500">⚠</span> Operational Guardrails
                              <Tooltip content="Strict rules and boundaries this agent must follow to ensure safety, quality, and compliance.">
                                <div className="text-amber-400 dark:text-amber-600/70 hover:text-amber-600 dark:hover:text-amber-400 cursor-help">
                                  <InfoIcon className="w-3.5 h-3.5" />
                                </div>
                              </Tooltip>
                          </h5>
                          <ul className="list-disc list-inside text-xs text-amber-900 dark:text-amber-200/80 space-y-1.5 ml-1">
                            {agent.guardrails.map((g, idx) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>

                        {isSelected && (
                           <div className="animate-fade-in-up">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                              <SparklesIcon className="w-3.5 h-3.5 text-sky-500" />
                              Orchestration Context
                            </label>
                            <textarea
                              value={selection[agent.id]?.context || ''}
                              onChange={(e) => updateContext(agent.id, e.target.value)}
                              placeholder={`E.g., Focus on low-cost solutions, or prioritize high-scalability...`}
                              className="w-full text-sm p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all focus:border-transparent placeholder-slate-400"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentSelector;
