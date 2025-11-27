
export interface FormData {
  projectName: string;
  projectVision: string;
  userStories: string;
  techStack: string[];
  integrations: string[];
  folderStructure: string;
  components: string[];
  pullRequestTemplate: string;
  issueTemplate: string;
  contributingGuide: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
  guardrails: string[];
  category: 'Strategy' | 'Design' | 'Engineering' | 'Quality & Ops' | 'Growth';
}

export interface AgentSelection {
  [agentId: string]: {
    selected: boolean;
    context: string;
  };
}
