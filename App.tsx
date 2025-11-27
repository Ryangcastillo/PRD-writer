import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { FormData, AgentSelection } from './types';
import { agents } from './data/agents';
import { techStackOptions, integrationOptions, folderStructureOptions, componentOptions, prTemplateOptions, issueTemplateOptions, contributingGuideOptions } from './constants';
import { templates } from './templates';
import { buildMasterPrompt } from './utils/promptBuilder';
import FormFieldset from './components/FormFieldset';
import Input from './components/Input';
import Textarea from './components/Textarea';
import Select from './components/Select';
import MultiSelect from './components/MultiSelect';
import Button from './components/Button';
import PreviewModal from './components/PreviewModal';
import ThemeToggle from './components/ThemeToggle';
import Stepper from './components/Stepper';
import AgentSelector from './components/AgentSelector';
import SparklesIcon from './components/icons/SparklesIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';

type FormErrors = Partial<Record<keyof FormData, string>>;
type Theme = 'light' | 'dark';

const STEPS = ["Discovery", "Architecture", "AI Team", "Orchestration"];

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    projectVision: "",
    userStories: "",
    techStack: [],
    integrations: [],
    folderStructure: "",
    components: [],
    pullRequestTemplate: "",
    issueTemplate: "",
    contributingGuide: "",
  });

  const [agentSelection, setAgentSelection] = useState<AgentSelection>(
    agents.reduce((acc, agent) => ({
      ...acc,
      [agent.id]: { selected: true, context: "" }
    }), {})
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [generatedJson, setGeneratedJson] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'dark';
    }
    return 'dark';
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    const selectedTemplate = templates.find(t => t.name === templateName);
    
    const isDirty = Object.values(formData).some(val => 
      Array.isArray(val) ? val.length > 0 : val !== ""
    );

    if (isDirty && templateName !== "") {
      const confirmChange = window.confirm("Loading a new template will overwrite your current progress. Continue?");
      if (!confirmChange) {
        e.target.value = ""; 
        return;
      }
    }

    if (selectedTemplate) {
      setFormData(selectedTemplate.data);
      setErrors({});
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.projectName) { newErrors.projectName = "Project Name is required."; isValid = false; }
      if (!formData.projectVision) { newErrors.projectVision = "Project Vision is required."; isValid = false; }
    }
    
    if (step === 1) {
      if (!formData.userStories) { newErrors.userStories = "User Stories are required."; isValid = false; }
      if (!formData.folderStructure) { newErrors.folderStructure = "Folder Structure is required."; isValid = false; }
      if (!formData.pullRequestTemplate) { newErrors.pullRequestTemplate = "Required."; isValid = false; }
      if (!formData.issueTemplate) { newErrors.issueTemplate = "Required."; isValid = false; }
      if (!formData.contributingGuide) { newErrors.contributingGuide = "Required."; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateFilesContent = async () => {
    const projectInit = {
      metadata: {
        projectName: formData.projectName,
        generatedAt: new Date().toISOString(),
        generatorVersion: "3.0.0-agent-orchestrated",
      },
      setup: {
        techStack: formData.techStack,
        integrations: formData.integrations,
        folderStructure: formData.folderStructure,
        components: formData.components,
      },
      agents: Object.entries(agentSelection)
        .filter(([_, val]) => (val as AgentSelection[string]).selected)
        .map(([key, val]) => ({ id: key, context: (val as AgentSelection[string]).context })),
    };
    setGeneratedJson(JSON.stringify(projectInit, null, 2));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = buildMasterPrompt(formData, agentSelection);

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setGeneratedMarkdown(response.text || "# Error generating PRD content.");

    } catch (error) {
      console.error("Gemini generation failed:", error);
      setGeneratedMarkdown(`# Error\n\nFailed to contact AI Orchestrator. Please try again.\n\nDetails: ${(error as Error).message}`);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsGenerating(true);
    setIsModalOpen(true);
    await generateFilesContent();
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-purple-100/40 to-sky-100/40 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-slate-950/80 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 tracking-tight drop-shadow-sm">
              Project Architect AI
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Orchestrate a team of specialized AI agents to build your Master Blueprint.
            </p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>

        <Stepper steps={STEPS} currentStep={currentStep} onStepClick={(step) => {
           if (step < currentStep) setCurrentStep(step);
        }} />
        
        <div className="glass-panel rounded-2xl shadow-xl border border-white/50 dark:border-slate-800 backdrop-blur-md overflow-hidden transition-all duration-300">
          <div className="p-6 sm:p-8 lg:p-10 min-h-[400px]">
            {/* Step 1: Project Discovery */}
            {currentStep === 0 && (
              <div key="step0" className="space-y-8 animate-fade-in-up">
                 <div className="mb-8 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm">
                  <Select
                    label="🚀 Load a Starter Template (Optional)"
                    id="template-loader"
                    onChange={handleTemplateChange}
                    value=""
                  >
                    <option value="">Choose a starting point...</option>
                    {templates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </Select>
                </div>

                <FormFieldset title="Project Strategy">
                  <Input
                    label="Project Name"
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    error={errors.projectName}
                    required
                    placeholder="e.g., OmniTask SaaS Platform"
                  />
                  <Textarea
                    label="Project Vision"
                    id="projectVision"
                    value={formData.projectVision}
                    onChange={(e) => handleChange('projectVision', e.target.value)}
                    rows={5}
                    error={errors.projectVision}
                    required
                    placeholder="Describe the high-level goal, target audience, key problems solved, and expected business impact."
                  />
                </FormFieldset>
              </div>
            )}

            {/* Step 2: Architecture */}
            {currentStep === 1 && (
              <div key="step1" className="space-y-8 animate-fade-in-up">
                <FormFieldset title="Requirements & Features">
                  <Textarea
                    label="User Stories & Key Features"
                    id="userStories"
                    value={formData.userStories}
                    onChange={(e) => handleChange('userStories', e.target.value)}
                    placeholder="As a [User Role], I want to [Action], so that I can [Benefit]..."
                    rows={8}
                    error={errors.userStories}
                    required
                  />
                </FormFieldset>

                <FormFieldset title="Technical Architecture">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelect
                      label="Tech Stack Preference"
                      options={techStackOptions}
                      selectedOptions={formData.techStack}
                      onChange={(selected) => handleChange('techStack', selected)}
                    />
                    <MultiSelect
                      label="Third-Party Integrations"
                      options={integrationOptions}
                      selectedOptions={formData.integrations}
                      onChange={(selected) => handleChange('integrations', selected)}
                    />
                  </div>
                   <Select
                    label="Folder Structure Pattern"
                    id="folderStructure"
                    value={formData.folderStructure}
                    onChange={(e) => handleChange('folderStructure', e.target.value)}
                    error={errors.folderStructure}
                    required
                  >
                    <option value="">Select an architecture pattern</option>
                    {folderStructureOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                   <MultiSelect
                    label="Core System Components"
                    options={componentOptions}
                    selectedOptions={formData.components}
                    onChange={(selected) => handleChange('components', selected)}
                  />
                </FormFieldset>
                
                 <FormFieldset title="DevOps Standards">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Select
                        label="Pull Request Template"
                        id="pullRequestTemplate"
                        value={formData.pullRequestTemplate}
                        onChange={(e) => handleChange('pullRequestTemplate', e.target.value)}
                        error={errors.pullRequestTemplate}
                        required
                      >
                        <option value="">Select style</option>
                        {prTemplateOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                      <Select
                        label="Issue Template"
                        id="issueTemplate"
                        value={formData.issueTemplate}
                        onChange={(e) => handleChange('issueTemplate', e.target.value)}
                        error={errors.issueTemplate}
                        required
                      >
                        <option value="">Select style</option>
                        {issueTemplateOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                      <Select
                        label="Contributing Guide"
                        id="contributingGuide"
                        value={formData.contributingGuide}
                        onChange={(e) => handleChange('contributingGuide', e.target.value)}
                        error={errors.contributingGuide}
                        required
                      >
                        <option value="">Select style</option>
                        {contributingGuideOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </div>
                  </FormFieldset>
              </div>
            )}

            {/* Step 3: AI Team Assembly */}
            {currentStep === 2 && (
              <div key="step2" className="space-y-6 animate-fade-in-up">
                 <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-sky-100 dark:border-sky-800/50 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-sky-100 dark:bg-sky-800 rounded-lg text-sky-600 dark:text-sky-200">
                             <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sky-900 dark:text-sky-100 mb-1">AI Orchestration Mode</h3>
                            <p className="text-sm text-sky-800/80 dark:text-sky-300 leading-relaxed">
                                Customize your expert AI team. Each agent brings specific domain knowledge and strictly follows defined guardrails. 
                                Toggle agents on/off and provide specific context to guide their contribution.
                            </p>
                        </div>
                    </div>
                 </div>
                 
                <AgentSelector 
                  agents={agents} 
                  selection={agentSelection} 
                  onChange={setAgentSelection} 
                />
              </div>
            )}

             {/* Step 4: Orchestration */}
             {currentStep === 3 && (
              <div key="step3" className="space-y-8 animate-fade-in-up text-center py-12">
                <div className="max-w-xl mx-auto space-y-8">
                   <div className="relative inline-block group">
                       <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                       <div className="relative bg-white dark:bg-slate-800 p-8 rounded-full shadow-2xl border-4 border-slate-50 dark:border-slate-700">
                          <SparklesIcon className="w-20 h-20 text-sky-500 animate-pulse-slow" />
                       </div>
                   </div>
                   
                   <div>
                       <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Ready to Orchestrate</h2>
                       <p className="text-slate-600 dark:text-slate-400 text-lg">
                         Your requirements are set. Your <span className="font-semibold text-sky-600 dark:text-sky-400">{Object.values(agentSelection).filter(a => (a as AgentSelection[string]).selected).length} AI Agents</span> are standing by.
                         <br/>The Orchestrator will now synthesize a Master Blueprint.
                       </p>
                   </div>
                   
                   <Button onClick={handleSubmit} className="w-full py-4 text-lg font-bold shadow-sky-500/30 shadow-xl hover:shadow-2xl hover:shadow-sky-500/40 transform hover:-translate-y-1 transition-all duration-300">
                      Generate Master Blueprint
                   </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Navigation */}
          <div className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center backdrop-blur-sm">
             <Button 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm`}
              >
                <ChevronLeftIcon className="w-4 h-4" /> Back
             </Button>
             
             {currentStep < STEPS.length - 1 && (
               <Button onClick={handleNext} className="flex items-center gap-2 px-8 shadow-lg shadow-sky-500/20">
                  Next Step <ChevronRightIcon className="w-4 h-4" />
               </Button>
             )}
          </div>
        </div>

        <PreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          loading={isGenerating}
          markdownContent={generatedMarkdown}
          jsonContent={generatedJson}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
  
  function handleCloseModal() {
    setIsModalOpen(false);
  }
  
  function handleDownload() {
    const downloadLink = document.createElement("a");
    const blobMd = new Blob([generatedMarkdown], { type: "text/markdown" });
    downloadLink.href = URL.createObjectURL(blobMd);
    downloadLink.download = `${formData.projectName.replace(/\s+/g, '-').toLowerCase()}-prd.md`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const blobJson = new Blob([generatedJson], { type: "application/json" });
    const downloadLinkJson = document.createElement("a");
    downloadLinkJson.href = URL.createObjectURL(blobJson);
    downloadLinkJson.download = "project-init.json";
    document.body.appendChild(downloadLinkJson);
    downloadLinkJson.click();
    document.body.removeChild(downloadLinkJson);
  }
}