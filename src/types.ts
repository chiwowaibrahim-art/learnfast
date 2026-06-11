export type AgentId = 'tutor' | 'homework' | 'parent';

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  promptGuideline: string;
}

export type ClassLevel = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export interface UserProfile {
  name: string;
  phone: string;
  pin: string;
  grade: ClassLevel;
  school: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  // For homework helper, we can track micro-steps or progress feedback
  homeworkStep?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  subject: string;
  topic: string;
  agentId: AgentId;
  question: string;
  responsePreview: string;
  // Metric to highlight understanding level
  status: 'Needs Help' | 'Making Progress' | 'Understood';
}

export interface SubjectModule {
  id: string;
  name: string;
  category: 'Sciences' | 'Humanities' | 'Languages' | 'Vocational';
  topics: {
    title: string;
    description: string;
    gradeLevel: 'JCE' | 'MSCE'; // JCE matches Form 1 & 2, MSCE matches Form 3 & 4
  }[];
}
