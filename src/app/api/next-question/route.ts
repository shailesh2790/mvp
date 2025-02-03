
// app/api/next-question/route.ts

import { NextResponse } from 'next/server';

const diagnosticTree = {
  rootQuestion: {
    category: 'screening',
    text: 'Mental health concerns affecting daily life'
  },
  
  levelOne: {
    categories: {
      mood: {
        indicators: ['persistent sadness', 'mood swings', 'excessive energy'],
        followUp: ['depression', 'bipolar', 'dysthymia']
      },
      anxiety: {
        indicators: ['fear', 'worry', 'restlessness'],
        followUp: ['GAD', 'panic', 'social anxiety']
      },
      behavioral: {
        indicators: ['impulsivity', 'compulsions', 'hyperactivity'],
        followUp: ['ADHD', 'OCD', 'impulse control']
      },
      trauma: {
        indicators: ['intrusive memories', 'flashbacks', 'avoidance'],
        followUp: ['PTSD', 'acute stress', 'adjustment']
      }
    }
  },

  comorbidityPatterns: {
    depression: {
      commonComorbidities: ['anxiety', 'PTSD', 'ADHD'],
      assessmentScales: ['PHQ-9', 'HDRS', 'BDI-II']
    },
    anxiety: {
      commonComorbidities: ['depression', 'OCD', 'social anxiety'],
      assessmentScales: ['GAD-7', 'HAM-A', 'BAI']
    },
    bipolar: {
      commonComorbidities: ['ADHD', 'anxiety', 'substance use'],
      assessmentScales: ['YMRS', 'BPRS', 'MADRS']
    }
  },

  psychometricTools: {
    depression: 'PHQ-9',
    anxiety: 'GAD-7',
    ocd: 'Y-BOCS',
    adhd: 'ASRS',
    ptsd: 'CAPS-5'
  }
};

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



// Keep existing diagnosticTree and questions arrays as they are

async function queryHF(prompt: string) {
 const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', {
   headers: { 
     'Authorization': `Bearer ${process.env.HF_API_KEY}`,
     'Content-Type': 'application/json'
   },
   method: 'POST',
   body: JSON.stringify({ inputs: prompt })
 });

 if (!response.ok) throw new Error('HF API error');
 const data = await response.json();
 return data[0].generated_text;
}

function analyzePreviousResponses(responses: any[]) {
 const analysis = {
   primaryConcerns: new Set<string>(),
   potentialComorbidities: new Set<string>(),
   severityScores: {
     depression: 0,
     anxiety: 0,
     bipolar: 0,
     trauma: 0,
     stress: 0
   },
   riskFactors: new Set<string>()
 };

 responses.forEach(response => {
   if (response.question.clinicalRelevance) {
     response.question.clinicalRelevance.forEach(condition => {
       if (typeof response.response === 'number') {
         analysis.severityScores[condition] = 
           (analysis.severityScores[condition] || 0) + response.response;
       }
       
       if (shouldFlagAsConcern(response.response, response.question.type)) {
         analysis.primaryConcerns.add(condition);
         
         const comorbidities = diagnosticTree.comorbidityPatterns[condition]?.commonComorbidities;
         if (comorbidities) {
           comorbidities.forEach(c => analysis.potentialComorbidities.add(c));
         }
       }
     });
   }
 });

 return analysis;
}

function shouldFlagAsConcern(response: any, type: string) {
 switch (type) {
   case 'scale':
     return response <= 3 || response >= 7;
   case 'yesNo':
     return response === true;
   case 'multiSelect':
     return Array.isArray(response) && response.length >= 2;
   default:
     return false;
 }
}

async function generateDynamicQuestion(previousResponses: any[]) {
    const lastResponse = previousResponses[previousResponses.length - 1];
    const analysis = analyzePreviousResponses(previousResponses);
  
    const prompt = `Given previous mental health responses, generate relevant follow-up question.
    Last response: ${JSON.stringify(lastResponse)}
    Analysis: ${JSON.stringify(analysis)}
    Return ONLY a valid JSON question object.`;
  
    try {
      const result = await queryHF(prompt);
      const parsedResult = JSON.parse(result);
      
      return {
        id: `dynamic-${Date.now()}`,
        text: parsedResult.text,
        type: parsedResult.type || 'scale',
        category: parsedResult.category || lastResponse.question.category,
        clinicalRelevance: parsedResult.clinicalRelevance || [],
        followUp: true
      };
    } catch (err) {
      return questions[previousResponses.length];
    }
  }
  
  export async function POST(request: Request) {
    const { previousResponses = [] } = await request.json();
    
    try {
      if (previousResponses.length >= questions.length) {
        return NextResponse.json({ complete: true });
      }
  
      const shouldGenerateDynamic = previousResponses.length > 0 && 
        previousResponses[previousResponses.length - 1].response > 6;
      
      const nextQuestion = shouldGenerateDynamic ? 
        await generateDynamicQuestion(previousResponses) : 
        questions[previousResponses.length];
  
      return NextResponse.json({
        complete: false,
        question: nextQuestion
      });
    } catch (error) {
      return NextResponse.json({ error: 'Question generation failed' }, { status: 500 });
    }
  }





  


