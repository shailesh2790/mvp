// api/next-question/route.ts

import { NextResponse } from 'next/server';

// Comprehensive structured question bank based on standardized scales
const questions = [
  // PHQ-9 Based Questions (Depression Screening)
  {
    id: 'dep-1',
    text: 'Over the last 2 weeks, how often have you felt down, depressed, or hopeless?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'mood',
    clinicalRelevance: ['depression'],
    nimhansRef: 'PHQ-9-Item2'
  },
  {
    id: 'dep-2',
    text: 'How would you rate your interest or pleasure in doing things you usually enjoy?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'anhedonia',
    clinicalRelevance: ['depression'],
    nimhansRef: 'PHQ-9-Item1'
  },
  {
    id: 'dep-3',
    text: 'Have you experienced changes in your sleep patterns?',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Difficulty falling asleep',
      'Waking up frequently',
      'Sleeping too much',
      'Early morning awakening',
      'No significant changes'
    ],
    clinicalRelevance: ['depression', 'anxiety'],
    nimhansRef: 'PHQ-9-Item3'
  },

  // GAD-7 Based Questions (Anxiety Screening)
  {
    id: 'anx-1',
    text: 'How often do you feel nervous, anxious, or on edge?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'anxiety',
    clinicalRelevance: ['anxiety', 'stress'],
    nimhansRef: 'GAD-7-Item1'
  },
  {
    id: 'anx-2',
    text: 'Do you find it difficult to control worrying?',
    type: 'scale',
    category: 'emotional',
    subCategory: 'worry',
    clinicalRelevance: ['anxiety'],
    nimhansRef: 'GAD-7-Item2'
  },

  // YMRS Based Questions (Bipolar/Mania Screening)
  {
    id: 'bip-1',
    text: 'Have you experienced periods of unusually elevated mood or energy?',
    type: 'yesNo',
    category: 'emotional',
    subCategory: 'mania',
    clinicalRelevance: ['bipolar'],
    nimhansRef: 'YMRS-Item1'
  },
  {
    id: 'bip-2',
    text: 'During these periods, select any changes you\'ve noticed:',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Decreased need for sleep',
      'More talkative than usual',
      'Racing thoughts',
      'Increased goal-directed activity',
      'Risky or impulsive behavior'
    ],
    clinicalRelevance: ['bipolar'],
    nimhansRef: 'YMRS-Multiple'
  },

  // Cognitive Assessment
  {
    id: 'cog-1',
    text: 'How would you rate your ability to concentrate on tasks?',
    type: 'scale',
    category: 'cognitive',
    subCategory: 'concentration',
    clinicalRelevance: ['depression', 'anxiety', 'adhd'],
    nimhansRef: 'NIMHANS-Cognitive-Battery'
  },
  {
    id: 'cog-2',
    text: 'Which cognitive difficulties have you experienced?',
    type: 'multiSelect',
    category: 'cognitive',
    options: [
      'Memory problems',
      'Difficulty making decisions',
      'Trouble planning or organizing',
      'Poor attention span',
      'Mental fatigue'
    ],
    clinicalRelevance: ['depression', 'anxiety', 'cognitive'],
    nimhansRef: 'NIMHANS-Cognitive-Scale'
  },

  // Trauma/Stress Assessment
  {
    id: 'trm-1',
    text: 'Have you experienced any significant life changes or stressors recently?',
    type: 'multiSelect',
    category: 'emotional',
    options: [
      'Work-related stress',
      'Relationship issues',
      'Financial problems',
      'Health concerns',
      'Loss of loved one',
      'Major life changes'
    ],
    clinicalRelevance: ['stress', 'adjustment'],
    nimhansRef: 'PSS-Life-Events'
  },

  // Social/Behavioral Assessment
  {
    id: 'soc-1',
    text: 'How would you rate your current social support system?',
    type: 'scale',
    category: 'behavioral',
    subCategory: 'social',
    clinicalRelevance: ['depression', 'anxiety'],
    nimhansRef: 'NIMHANS-Social-Support'
  },
  {
    id: 'soc-2',
    text: 'Have you noticed changes in your social interactions?',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Withdrawing from friends/family',
      'Difficulty maintaining relationships',
      'Avoiding social situations',
      'Increased irritability with others',
      'No significant changes'
    ],
    clinicalRelevance: ['depression', 'anxiety', 'social'],
    nimhansRef: 'Social-Functioning-Scale'
  },

  // Coping Mechanisms
  {
    id: 'cop-1',
    text: 'Which coping strategies do you currently use?',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Exercise/Physical activity',
      'Meditation/Mindfulness',
      'Talking to friends/family',
      'Professional help',
      'Creative activities',
      'Religious/Spiritual practices'
    ],
    clinicalRelevance: ['coping', 'resilience'],
    nimhansRef: 'NIMHANS-Coping-Inventory'
  },

  // Functional Impact
  {
    id: 'func-1',
    text: 'How have your symptoms affected your daily functioning?',
    type: 'multiSelect',
    category: 'behavioral',
    options: [
      'Work/Academic performance',
      'Household responsibilities',
      'Personal relationships',
      'Self-care',
      'Leisure activities'
    ],
    clinicalRelevance: ['functional', 'impairment'],
    nimhansRef: 'GAF-Scale'
  }
];



async function generateDynamicQuestion(previousResponses: any[]) {
  try {
    const lastResponse = previousResponses[previousResponses.length - 1];
    
    // Create context based on NIMHANS diagnostic tree
    const context = `
    Based on NIMHANS diagnostic principles and the following patient response:
    Question: "${lastResponse.question.text}"
    Response: "${lastResponse.response}"
    Category: ${lastResponse.question.category}

    Consider the diagnostic tree:
    Level 1: Categorize symptoms (Mood, Anxiety, Behavioral, Trauma, Psychosis)
    Level 2: Refine categories based on specific symptoms
    Level 3: Identify comorbidities
    Level 4: Rule out organic causes
    Level 5: Cross-verify with psychometric tools

    Generate a follow-up question that:
    1. Aligns with NIMHANS diagnostic principles
    2. Helps identify potential comorbidities
    3. Follows standardized assessment scales (PHQ-9, GAD-7, YMRS)
    4. Uses culturally sensitive language
    
    Return the question in JSON format with:
    {
      "text": "question text",
      "type": "scale/yesNo/multiSelect/singleSelect",
      "category": "category",
      "options": ["option1", "option2"],
      "clinicalRelevance": ["condition1", "condition2"],
      "nimhansRef": "reference to NIMHANS scale"
    }`;

    try {
      // Call Mistral via Ollama
      const response = await fetch('http://localhost:11435/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: context,
          format: 'json'
        })
      });

      if (!response.ok) {
        console.error('Mistral API error:', response.statusText);
        return null;
      }

      const data = await response.json();
      let generatedQuestion;
      
      try {
        generatedQuestion = JSON.parse(data.response);
      } catch (parseError) {
        console.error('Failed to parse Mistral response:', parseError);
        return null;
      }

      // Validate the generated question has required fields
      if (!generatedQuestion.text || !generatedQuestion.type || !generatedQuestion.category) {
        console.error('Invalid question format from Mistral');
        return null;
      }

      return {
        id: `dynamic-${Date.now()}`,
        ...generatedQuestion,
        followUp: true
      };
    } catch (mistralError) {
      console.error('Mistral API call failed:', mistralError);
      return null;
    }
  } catch (error) {
    console.error('Question generation failed:', error);
    return null;
  }
}

function shouldGenerateDynamicQuestion(previousResponses: any[]) {
  if (previousResponses.length === 0) return false;
  
  const lastResponse = previousResponses[previousResponses.length - 1];
  
  // Enhanced triggers with more specific conditions
  const triggers = {
    emotional: {
      threshold: 7,
      comorbidities: ['anxiety', 'depression', 'bipolar'],
      conditions: {
        depression: (score: number) => score <= 3,
        anxiety: (score: number) => score >= 7,
        bipolar: (response: any) => response === true
      }
    },
    cognitive: {
      threshold: 6,
      comorbidities: ['depression', 'anxiety', 'adhd'],
      conditions: {
        concentration: (score: number) => score <= 4,
        memory: (score: number) => score <= 4
      }
    },
    behavioral: {
      threshold: 6,
      comorbidities: ['depression', 'anxiety', 'adjustment'],
      conditions: {
        sleep: (response: string[]) => response.length >= 2,
        social: (score: number) => score <= 3
      }
    }
  };

  const category = lastResponse.question.category;
  const subCategory = lastResponse.question.subCategory;
  const response = lastResponse.response;
  
  // Check category-specific conditions
  const categoryTriggers = triggers[category];
  if (!categoryTriggers) return false;

  // Check numeric responses
  if (typeof response === 'number') {
    return response >= categoryTriggers.threshold;
  }

  // Check boolean responses
  if (typeof response === 'boolean') {
    return response === true;
  }

  // Check array responses (multiSelect)
  if (Array.isArray(response)) {
    return response.length >= 2;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentQuestion, previousResponses = [] } = body;

    console.log('Processing request:', {
      currentQuestion: currentQuestion?.id,
      responsesCount: previousResponses.length
    });

    // Attempt dynamic question generation
    if (previousResponses.length > 0 && shouldGenerateDynamicQuestion(previousResponses)) {
      console.log('Attempting dynamic question generation...');
      const dynamicQuestion = await generateDynamicQuestion(previousResponses);
      if (dynamicQuestion) {
        console.log('Dynamic question generated:', dynamicQuestion.id);
        return NextResponse.json({
          complete: false,
          question: dynamicQuestion
        });
      }
    }

    // Fallback to structured questions
    if (previousResponses.length >= questions.length) {
      console.log('Assessment complete');
      return NextResponse.json({ complete: true });
    }

    const nextQuestion = questions[previousResponses.length];
    console.log('Serving structured question:', nextQuestion.id);
    return NextResponse.json({
      complete: false,
      question: nextQuestion
    });

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate next question', details: error.message },
      { status: 500 }
    );
  }
}