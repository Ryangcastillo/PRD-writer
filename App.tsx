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
import XIcon from './components/icons/XIcon';
import ThemeToggle from './components/ThemeToggle';
import Stepper from './components/Stepper';
import AgentSelector from './components/AgentSelector';
import SparklesIcon from './components/icons/SparklesIcon';

type FormErrors = Partial<Record<keyof FormData, string>>;
type Theme = 'light' | 'dark';

const STEPS = ["Project Discovery", "Architecture", "AI Team Assembly", "Orchestration"];

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

  // Initialize all agents as selected by default
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
    
    // Check if form is dirty (has non-empty values)
    const isDirty = Object.values(formData).some(val => 
      Array.isArray(val) ? val.length > 0 : val !== ""
    );

    if (isDirty) {
      const confirmChange = window.confirm("Loading a new template will overwrite your current progress. Are you sure you want to continue?");
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

      // Using gemini-3-pro-preview for complex reasoning and agent orchestration simulation
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }
  
  const handleDownload = () => {
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
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Project Architect AI
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Orchestrate a team of specialized AI agents to build your Master Blueprint.
            </p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>

        <Stepper steps={STEPS} currentStep={currentStep} onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step);
        }} />
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Step 1: Project Discovery */}
            {currentStep === 0 && (
              <div className="space-y-8 animate-fadeIn">
                 <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <Select
                    label="Load a Starter Template (Optional)"
                    id="template-loader"
                    onChange={handleTemplateChange}
                    value=""
                  >
                    <option value="">Select a template to populate fields...</option>
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
                    placeholder="e.g., SaaS Analytics Platform"
                  />
                  <Textarea
                    label="Project Vision"
                    id="projectVision"
                    value={formData.projectVision}
                    onChange={(e) => handleChange('projectVision', e.target.value)}
                    rows={4}
                    error={errors.projectVision}
                    required
                    placeholder="Describe the high-level goal, target audience, and core problem this project solves."
                  />
                </FormFieldset>
              </div>
            )}

            {/* Step 2: Architecture */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <FormFieldset title="Business Requirements">
                  <Textarea
                    label="User Stories & Key Features"
                    id="userStories"
                    value={formData.userStories}
                    onChange={(e) => handleChange('userStories', e.target.value)}
                    placeholder="As a [user type], I want to [action], so that I can [benefit]."
                    rows={6}
                    error={errors.userStories}
                    required
                  />
                </FormFieldset>

                <FormFieldset title="Technical Stack & Architecture">
                  <MultiSelect
                    label="Tech Stack Preference"
                    options={techStackOptions}
                    selectedOptions={formData.techStack}
                    onChange={(selected) => handleChange('techStack', selected)}
                  />
                  <MultiSelect
                    label="Integrations"
                    options={integrationOptions}
                    selectedOptions={formData.integrations}
                    onChange={(selected) => handleChange('integrations', selected)}
                  />
                   <Select
                    label="Folder Structure"
                    id="folderStructure"
                    value={formData.folderStructure}
                    onChange={(e) => handleChange('folderStructure', e.target.value)}
                    error={errors.folderStructure}
                    required
                  >
                    <option value="">Select a structure</option>
                    {folderStructureOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                   <MultiSelect
                    label="Reusable Components"
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
                        <option value="">Select a template</option>
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
                        <option value="">Select a template</option>
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
                        <option value="">Select a guide</option>
                        {contributingGuideOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </Select>
                    </div>
                  </FormFieldset>
              </div>
            )}

            {/* Step 3: AI Team Assembly */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                 <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800 text-sm text-sky-800 dark:text-sky-300 mb-6">
                    <p className="font-semibold mb-1">Orchestrator Mode Active</p>
                    <p>Select the AI Agents you want to consult for this project. Each agent has specific expertise and strict guardrails to ensure high-quality output. You can provide specific context to guide each agent.</p>
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
              <div className="space-y-8 animate-fadeIn text-center py-10">
                <div className="max-w-xl mx-auto space-y-6">
                   <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full inline-block">
                      <SparklesIcon className="w-16 h-16 text-sky-500" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Orchestrate</h2>
                   <p className="text-slate-600 dark:text-slate-400">
                     We have gathered your requirements and assembled your AI team. 
                     The Orchestrator will now activate the selected agents to generate your Master Blueprint.
                     <br/><br/>
                     <span className="font-semibold">Selected Team Size:</span> {Object.values(agentSelection).filter(a => (a as AgentSelection[string]).selected).length} Agents
                   </p>
                   
                   <Button onClick={handleSubmit} className="w-full py-4 text-lg shadow-sky-500/20 shadow-lg">
                      Start Orchestration Sequence
                   </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 sm:px-8 flex justify-between items-center">
             <Button 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Back
             </Button>
             
             {currentStep < STEPS.length - 1 && (
               <Button onClick={handleNext}>
                  Next Step
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
}