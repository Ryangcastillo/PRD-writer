
import React, { useState } from 'react';
import type { Agent, AgentSelection } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';

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

  // Group agents by category
  const categories = Array.from(new Set(agents.map(a => a.category)));

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            {category} Team
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {agents.filter(a => a.category === category).map(agent => {
              const isSelected = selection[agent.id]?.selected;
              const isExpanded = expandedAgent === agent.id;

              return (
                <div 
                  key={agent.id} 
                  className={`border rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? 'bg-white dark:bg-slate-800 border-sky-500 ring-1 ring-sky-500 shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-80'
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(agent.id)}
                        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <div className="cursor-pointer flex-1" onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}>
                        <h4 className={`font-semibold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {agent.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{agent.role}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                      <div className="pt-3 space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                          "{agent.description}"
                        </p>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-100 dark:border-amber-800/30">
                          <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-1">Guardrails</h5>
                          <ul className="list-disc list-inside text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            {agent.guardrails.map((g, idx) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>

                        {isSelected && (
                           <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Custom Context / Instructions
                            </label>
                            <textarea
                              value={selection[agent.id]?.context || ''}
                              onChange={(e) => updateContext(agent.id, e.target.value)}
                              placeholder={`Provide specific goals for the ${agent.role}...`}
                              className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
