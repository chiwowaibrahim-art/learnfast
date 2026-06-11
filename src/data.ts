import { SubjectModule, Agent } from "./types";

export const AGENTS: Agent[] = [
  {
    id: 'tutor',
    name: 'Curriculum Tutor',
    role: 'Primary Subject Teacher',
    description: 'Explains complex topics in Mathematics, Sciences, and Humanities with direct Malawian curriculum alignment and clear examples.',
    promptGuideline: 'Ask me to explain any topic from physical science, biology, math, geography, or history, and I will teach it to you with localized examples!'
  },
  {
    id: 'homework',
    name: 'Socratic Coach',
    role: 'Homework and Problem Solver',
    description: 'Guides you through tough homework questions step-by-step. Does not give answers away—instead guides you to solve it yourself.',
    promptGuideline: 'Share a mathematics, science, or calculation problem, and let us solve it together step-by-step!'
  },
  {
    id: 'parent',
    name: 'Parent Report Sync',
    role: 'Evaluator and Partner',
    description: 'Generate structured academic progress notes for your parents that summarize your study log, highlight strengths, and suggest home learning ideas.',
    promptGuideline: 'Generate my learning activity report to show how much progress I have made!'
  }
];

export const MALAWI_SUBJECTS: SubjectModule[] = [
  {
    id: 'math',
    name: 'Mathematics',
    category: 'Sciences',
    topics: [
      {
        title: 'Indices and Logarithms',
        description: 'Laws of indices, solving exponential equations, and evaluation of JCE algebraic indices.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Quadratic Equations',
        description: 'Solving using factorization, completing the square, and MSCE quadratic formula applications.',
        gradeLevel: 'MSCE'
      },
      {
        title: 'Matrices and Determinants',
        description: 'Operations, determinant calculations, and using inversion matrices to solve simultaneous equations.',
        gradeLevel: 'MSCE'
      },
      {
        title: 'Commercial Arithmetic',
        description: 'Solving compound interest, depreciation, compound tax, and exchange rates in Malawi Kwacha.',
        gradeLevel: 'JCE'
      }
    ]
  },
  {
    id: 'physci',
    name: 'Physical Science',
    category: 'Sciences',
    topics: [
      {
        title: 'Atomic Structure & Periodic Table',
        description: 'Understanding electrons, protons, neutrons, groups, periods, and JCE chemical symbolisms.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Organic Chemistry',
        description: 'Alkanes, Alkenes, Alcohols, and industrial properties aligned with Malawian manufacturing concerns.',
        gradeLevel: 'MSCE'
      },
      {
        title: 'Newtonian Mechanics',
        description: 'Equations of motion, force, mass, acceleration, and momentum with agricultural machinery examples.',
        gradeLevel: 'MSCE'
      },
      {
        title: 'Electricity & Resistance',
        description: 'Ohm’s law, series and parallel circuits, heating effects, and electrical power grids in Malawi.',
        gradeLevel: 'MSCE'
      }
    ]
  },
  {
    id: 'bio',
    name: 'Biology',
    category: 'Sciences',
    topics: [
      {
        title: 'Photosynthesis & Soil Nutrition',
        description: 'The light and dark reactions, limiting factors, and magnesium/nitrogen role in Malawian soils.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Human Transport System',
        description: 'Composition of blood, double circulation system, structure of the heart and common vascular disorders.',
        gradeLevel: 'MSCE'
      },
      {
        title: 'Ecosystems & Energy Flow',
        description: 'Food chains, trophic levels, and conservation ecology of Malawian national flora and fauna.',
        gradeLevel: 'JCE'
      }
    ]
  },
  {
    id: 'agri',
    name: 'Agriculture',
    category: 'Vocational',
    topics: [
      {
        title: 'Soil Fertility & Management',
        description: 'Soil structure, organic fertilizers, crop rotation layouts, and soil erosion controls in Malawi.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Crop Production & Breeding',
        description: 'Maize and tobacco cultivation procedures, pests control, and modern hybrid yield optimization.',
        gradeLevel: 'MSCE'
      }
    ]
  },
  {
    id: 'geog',
    name: 'Geography',
    category: 'Humanities',
    topics: [
      {
        title: 'Map Reading & Interpretation',
        description: 'Calculating distances, identifying relief features, contours, and reading Malawian topography charts.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Malawian Climate & Weather Patterns',
        description: 'Atmospheric circulation, local rainfall variations, the Shire valley humidity, and dry season patterns.',
        gradeLevel: 'MSCE'
      }
    ]
  },
  {
    id: 'hist',
    name: 'History',
    category: 'Humanities',
    topics: [
      {
        title: 'Pre-Colonial Malawi',
        description: 'Migration patterns of Chewa, Tumbuka, Ngoni, and Yao tribes, agricultural systems, and trade networks.',
        gradeLevel: 'JCE'
      },
      {
        title: 'Sovereignty and Democratic Malawi',
        description: 'The transition from protectorate status to independence in 1964 and the arrival of plural democracy.',
        gradeLevel: 'MSCE'
      }
    ]
  }
];
