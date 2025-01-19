// app/api/next-question/route.ts

import { NextResponse } from 'next/server';

// Clinical mappings for professional assessment
const clinicalMappings = {
  depression: {
    icd10: 'F32',
    icd11: '6A70',
    nimhansScale: 'HDRS',
    criteria: ['mood', 'energy', 'sleep', 'concentration']
  },
  anxiety: {
    icd10: 'F41',
    icd11: '6B00',
    nimhansScale: 'HAM-A',
    criteria: ['anxiety', 'avoidance', 'concentration']
  },
  stress: {
    icd10: 'F43',
    icd11: '6B40',
    nimhansScale: 'PSS',
    criteria: ['mood', 'sleep', 'concentration', 'energy']
  }
};

// Question bank with clinical references
const questions = [
  {
    id: '1',
    text: 'Over the last 2 weeks, how would you rate your mood?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'mood',
    clinicalRelevance: ['depression'],
    nimhansRef: 'HDRS-Item1'
  },
  {
    id: '2',
    text: 'Have you experienced difficulty concentrating or making decisions?',
    type: 'yesNo',
    category: 'cognitive',
    subCategory: 'concentration',
    clinicalRelevance: ['depression', 'anxiety'],
    nimhansRef: 'HDRS-Item7'
  },
  {
    id: '3',
    text: 'How would you rate your anxiety level in social situations?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'anxiety',
    clinicalRelevance: ['anxiety'],
    nimhansRef: 'HAM-A-Item9'
  },
  {
    id: '4',
    text: 'How often do you experience physical symptoms of stress (e.g., rapid heartbeat, sweating)?',
    type: 'scale',
    category: 'behavioral',
    subCategory: 'physicalSymptoms',
    clinicalRelevance: ['anxiety', 'stress'],
    nimhansRef: 'HAM-A-Item13'
  },
  {
    id: '5',
    text: 'Rate your ability to enjoy activities you usually find pleasant',
    type: 'scale',
    category: 'emotional',
    subCategory: 'anhedonia',
    clinicalRelevance: ['depression'],
    nimhansRef: 'HDRS-Item7'
  },
  {
    id: '6',
    text: 'How would you rate your sleep quality over the past week?',
    type: 'singleSelect',
    category: 'behavioral',
    options: ['Very poor', 'Poor', 'Fair', 'Good', 'Very good'],
    clinicalRelevance: ['depression', 'anxiety'],
    nimhansRef: 'HDRS-Item4-6'
  },
  {
    id: '7',
    text: 'Select any changes you\'ve noticed in your daily routine:',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Changes in appetite',
      'Sleep disturbances',
      'Reduced social activities',
      'Difficulty with daily tasks',
      'Changes in energy levels',
      'Mood fluctuations'
    ],
    clinicalRelevance: ['depression', 'stress'],
    nimhansRef: 'HDRS-Multiple'
  },
  {
    id: '8',
    text: 'Rate your energy levels throughout the day',
    type: 'scale',
    category: 'behavioral',
    subCategory: 'energy',
    clinicalRelevance: ['depression'],
    nimhansRef: 'HDRS-Item13'
  },
  {
    id: '9',
    text: 'How would you rate your ability to cope with stress?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'coping',
    clinicalRelevance: ['stress'],
    nimhansRef: 'PSS-Item4'
  },
  {
    id: '10',
    text: 'Have you been avoiding situations that make you anxious?',
    type: 'yesNo',
    category: 'behavioral',
    subCategory: 'avoidance',
    clinicalRelevance: ['anxiety'],
    nimhansRef: 'HAM-A-Item3'
  }
];

const followUpTemplates = {
  emotional: {
    scale: [
      {
        text: "Which of these factors contribute to your current emotional state?",
        type: "multiSelect",
        options: [
          "Work-related stress",
          "Relationship issues",
          "Health concerns",
          "Financial stress",
          "Family matters",
          "Past experiences",
          "Future uncertainties",
          "Social situations"
        ],
        clinicalRelevance: ['stress', 'anxiety']
      }
    ],
    yesNo: [
      {
        text: "How frequently do you experience these feelings?",
        type: "singleSelect",
        options: [
          "Multiple times daily",
          "Once daily",
          "Several times a week",
          "Weekly",
          "Less frequently"
        ],
        clinicalRelevance: ['depression', 'anxiety']
      }
    ]
  },
  cognitive: {
    scale: [
      {
        text: "Which areas of your life are most affected by these difficulties?",
        type: "multiSelect",
        options: [
          "Work performance",
          "Academic tasks",
          "Daily responsibilities",
          "Social interactions",
          "Problem-solving",
          "Memory",
          "Decision making"
        ],
        clinicalRelevance: ['depression', 'anxiety']
      }
    ]
  },
  behavioral: {
    scale: [
      {
        text: "What support systems do you currently have?",
        type: "multiSelect",
        options: [
          "Family",
          "Friends",
          "Mental health professionals",
          "Support groups",
          "Religious/spiritual community",
          "Colleagues",
          "Online communities"
        ],
        clinicalRelevance: ['stress', 'depression']
      }
    ]
  }
};

function shouldAskFollowUp(previousResponses: any[]) {
  if (previousResponses.length === 0) return false;
  
  const lastResponse = previousResponses[previousResponses.length - 1];
  
  const criteria = {
    scale: (value: number) => value <= 3 || value >= 8,
    yesNo: (value: boolean) => value === true,
    multiSelect: (value: string[]) => value.length <= 2 || value.length >= 5,
    singleSelect: (value: string) => ['Very poor', 'Poor'].includes(value)
  };

  const responseValue = lastResponse.response;
  const questionType = lastResponse.question.type as keyof typeof criteria;

  return criteria[questionType]?.(responseValue) ?? false;
}

function getFollowUpQuestion(category: string, questionType: string) {
  const categoryTemplates = followUpTemplates[category];
  if (!categoryTemplates) return null;

  const typeTemplates = categoryTemplates[questionType];
  if (!typeTemplates) return null;

  const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  return {
    id: `dynamic-${Date.now()}`,
    ...template,
    category,
    followUp: true
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentQuestion, previousResponses = [] } = body;

    // Check for follow-up
    if (previousResponses.length > 0 && shouldAskFollowUp(previousResponses)) {
      const lastResponse = previousResponses[previousResponses.length - 1];
      const followUpQuestion = getFollowUpQuestion(
        lastResponse.question.category,
        lastResponse.question.type
      );

      if (followUpQuestion) {
        return NextResponse.json({
          complete: false,
          question: followUpQuestion
        });
      }
    }

    // If we have completed all questions, signal completion
    if (previousResponses.length >= questions.length) {
      return NextResponse.json({
        complete: true
      });
    }

    // Get next question from bank
    const nextQuestion = questions[previousResponses.length];

    return NextResponse.json({
      complete: false,
      question: nextQuestion
    });

  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate next question' },
      { status: 500 }
    );
  }
}