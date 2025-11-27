
import type { FormData, AgentSelection } from '../types';
import { agents, universalGuardrails } from '../data/agents';

export const buildMasterPrompt = (formData: FormData, agentSelection: AgentSelection): string => {
  const currentDate = new Date().toLocaleDateString();
  
  // Filter selected agents
  const selectedAgents = agents.filter(a => agentSelection[a.id]?.selected);
  
  // Build Team Roster String
  const teamRoster = selectedAgents.map(agent => {
    const context = agentSelection[agent.id]?.context;
    return `
### ${agent.name} (${agent.role})
*   **Role Description:** ${agent.description}
*   **Specific Instructions:** ${agent.prompt}
*   **Guardrails:**
    ${agent.guardrails.map(g => `- ${g}`).join('\n    ')}
    ${context ? `*   **User Context Override:** ${context}` : ''}
`;
  }).join('\n');

  return `
You are the **Orchestrator** of a world-class, AI-powered software development team. Your mission is to manage the seamless collaboration of specialized AI agents to build a SaaS application based on the Business Owner's vision.

**Date:** ${currentDate}

**Project Specifications (from Business Owner):**
- **Project Name:** ${formData.projectName}
- **Vision:** ${formData.projectVision}
- **Key User Stories:** ${formData.userStories}
- **Tech Stack Preference:** ${formData.techStack.join(", ")}
- **Integrations:** ${formData.integrations.join(", ")}
- **Folder Structure:** ${formData.folderStructure}
- **Core Components:** ${formData.components.join(", ")}
- **Standards:** ${formData.pullRequestTemplate}, ${formData.issueTemplate}, ${formData.contributingGuide}

---

## **The AI Agent Team Roster & Core Responsibilities**

This project will be executed by the following dedicated team of AI agents. You must simulate the output of each agent, ensuring they strictly adhere to their specific guardrails and roles.

**Universal Guardrails (Applies to ALL Agents):**
${universalGuardrails.map(g => `- ${g}`).join('\n')}

${teamRoster}

---

## **Orchestration Instructions**

You will guide the team through a comprehensive planning phase. Generate a **Master Project Blueprint (PRD)** in Markdown that consolidates the work of all selected agents.

**Structure of the Blueprint:**

# [Project Name] - Master Project Blueprint

## 1. Executive Summary (Business Analyst)
- Project Vision & Scope (Refined)
- Success Metrics (KPIs)
- **Guardrail Check:** Confirm requirements meet acceptance criteria standards.

## 2. Market Strategy (Market Strategist & Product Marketing)
- Target Audience & Personas
- Competitive Positioning & UVP
- Go-to-Market Strategy Overview

## 3. Technical Architecture (Strategic Architect)
- Technology Decision Matrix (Why this stack? Pros/Cons)
- High-Level System Architecture Diagram (Mermaid or Text description)
- Data Flow Overview
- **Guardrail Check:** Justify tech choices and confirm security review.

## 4. Functional Specifications (Business Analyst)
- Detailed User Stories Breakdown (MoSCoW prioritized)
- Core Functional Requirements

## 5. Design & User Experience (Design Lead)
- Design System Guidelines (Typography, Colors, Spacing)
- Key User Flows (Step-by-step)
- **Guardrail Check:** Accessibility (WCAG) compliance confirmation.

## 6. Implementation Plan (Backend, Frontend, & DBA)
- Database Schema Design (Entities & Relationships)
- API Endpoint Structure (REST/GraphQL)
- Frontend Component Hierarchy & State Management
- **Guardrail Check:** Input validation and security protocols.

## 7. Quality, Security & Operations (QA, Security, DevOps, SRE)
- Security Protocols (Auth, Data Protection)
- CI/CD Pipeline Strategy
- Testing Strategy (Unit, Integration, E2E)
- Production Monitoring Plan

## 8. Analytics & Growth (BI Analyst & Growth Engineer)
- Data Strategy & Key Metrics
- Future Roadmap Recommendations

## 9. Compliance & Guardrail Report
- Explicitly list how the team adhered to the Universal and Agent-Specific Guardrails during this planning session. Mention any potential risks identified.

**Tone:** Professional, authoritative, actionable, and collaborative. 
**Format:** Clean Markdown. Use bolding for emphasis, lists for readability, and code blocks for technical details.
`;
};
