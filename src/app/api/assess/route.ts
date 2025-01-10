import { NextResponse } from 'next/server';

// Interfaces
interface NIMHANSAssessmentData {
  emotional: {
    mood: string;
    intensity: number;
    anxiety: boolean;
    moodSwings: boolean;
    voiceJournal?: string;
    energy: number;
    description: string;
  };
  cognitive: {
    concentration: number;
    memoryIssues: boolean;
    focusIssues: boolean;
    thoughtPatterns: string;
    decisionMaking: number;
    clarity: number;
  };
  behavioral: {
    sleep: string;
    sleepHours: number;
    socialActivity: string;
    activities: string[];
    avoidance: boolean;
    routineChanges: boolean;
  };
  eqMetrics: {
    selfAwareness: number;
    empathy: number;
    regulation: number;
    socialSkills: number;
    motivation: number;
  };
}

// Prompt Construction
function constructNIMHANSPrompt(data: NIMHANSAssessmentData, history: any[]): string {
  return `As a NIMHANS-trained clinical psychologist, provide a comprehensive mental health evaluation following NIMHANS diagnostic principles:

Assessment Data:
${JSON.stringify(data, null, 2)}

Historical Data (if available):
${JSON.stringify(history || [], null, 2)}

Follow these NIMHANS diagnostic principles:
1. Use multidisciplinary evaluation approach
2. Consider biological, psychological, and social factors
3. Focus on primary conditions and comorbidities
4. Maintain cultural sensitivity
5. Reference standardized psychometric tools (PHQ-9, GAD-7, etc.)

Based on the assessment data, provide a detailed clinical evaluation in the following exact JSON format:
{
  "primary": {
    "category": "string (Mood/Anxiety/Behavioral/Trauma/Psychosis)",
    "symptoms": ["string array of primary symptoms"],
    "severity": "string (Mild/Moderate/Severe)",
    "nimhansClassification": "string (diagnostic category as per NIMHANS)"
  },
  "comorbidities": {
    "conditions": [{
      "name": "string (condition name)",
      "severity": "string (Mild/Moderate/Severe)",
      "keySymptoms": ["string array of symptoms"]
    }]
  },
  "psychometricScores": {
    "phq9": number (0-27),
    "gad7": number (0-21),
    "eqScore": number (0-100)
  },
  "diagnosticIndications": {
    "anxiety": {
      "severity": "string (Low/Moderate/High)",
      "keySymptoms": ["string array"],
      "specificType": "string (as per NIMHANS classification)"
    },
    "depression": {
      "severity": "string (Low/Moderate/High)",
      "keySymptoms": ["string array"],
      "specificType": "string (as per NIMHANS classification)"
    }
  },
  "eqDevelopment": {
    "strengths": ["string array"],
    "areasForImprovement": ["string array"],
    "exercises": ["string array"]
  },
  "treatmentPlan": {
    "immediate": ["Array of specific immediate actions needed"],
    "longTerm": ["Array of long-term treatment strategies"],
    "therapeuticApproaches": [
      "Detailed therapeutic modalities recommended by NIMHANS",
      "Specific evidence-based therapy approaches",
      "Structured intervention techniques",
      "Recommended counseling methods"
    ]
  },
  "riskAssessment": {
    "level": "string (Low/Moderate/High)",
    "factors": ["string array"],
    "safetyPlan": ["string array"],
    "urgencyOfIntervention": "string (Routine/Priority/Urgent)"
  },
  "professionalCare": {
    "recommended": boolean,
    "urgencyLevel": "string (Low/Moderate/High)",
    "recommendationType": "string (Outpatient/Intensive Outpatient/Inpatient)",
    "specialistReferral": ["string array of recommended specialists"]
  }
}

Ensure the response is a valid JSON object following the exact structure above, with appropriate clinical insights based on NIMHANS guidelines.`;
}

// Mistral Query Function
async function queryMistral(prompt: string, retries = 3) {
  const timeout = 60000; // 60 seconds timeout
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${retries}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('http://localhost:11435/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: "mistral",
          prompt: prompt,
          stream: false,
          format: "json",
          options: {
            num_predict: 2048,
            top_k: 40,
            top_p: 0.9,
            temperature: 0.7,
          }
        }),
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Empty response from Mistral');
      }

      console.log('Successfully received response from Mistral');
      return data.response;

    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      }

      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${waitTime}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Input Validation
function validateInput(data: any) {
  if (!data?.currentAssessment) {
    throw new Error('Current assessment data is required');
  }
  
  const requiredFields = ['emotional', 'cognitive', 'behavioral', 'eqMetrics'];
  const missingFields = requiredFields.filter(field => !data.currentAssessment[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

// Main POST Handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Processing assessment request...');

    validateInput(data);
    
    console.log('Sending request to Mistral...');
    const result = await queryMistral(constructNIMHANSPrompt(data.currentAssessment, data.history));
    console.log('Received response from Mistral');

    const parsedResult = JSON.parse(result);
    console.log('Successfully parsed Mistral response');
    
    const formattedResult = {
      timestamp: new Date().toISOString(),
      primary: parsedResult.primary || {
        category: 'Not specified',
        symptoms: [],
        severity: 'Not specified',
        nimhansClassification: 'Not specified'
      },
      comorbidities: parsedResult.comorbidities || { conditions: [] },
      psychometricScores: parsedResult.psychometricScores || {
        phq9: 0,
        gad7: 0,
        eqScore: 0
      },
      diagnosticIndications: parsedResult.diagnosticIndications || {
        anxiety: { severity: 'Low', keySymptoms: [], specificType: 'Not specified' },
        depression: { severity: 'Low', keySymptoms: [], specificType: 'Not specified' }
      },
      eqDevelopment: parsedResult.eqDevelopment || {
        strengths: [],
        areasForImprovement: [],
        exercises: []
      },
      treatmentPlan: parsedResult.treatmentPlan || {
        immediate: [],
        longTerm: [],
        therapeuticApproaches: []
      },
      riskAssessment: parsedResult.riskAssessment || {
        level: 'Low',
        factors: [],
        safetyPlan: [],
        urgencyOfIntervention: 'Routine'
      },
      professionalCare: parsedResult.professionalCare || {
        recommended: false,
        urgencyLevel: 'Low',
        recommendationType: 'Not specified',
        specialistReferral: []
      }
    };

    console.log('Sending formatted response');
    return NextResponse.json(formattedResult);

  } catch (error: any) {
    console.error('Assessment error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          details: 'Failed to parse assessment results'
        },
        { status: 500 }
      );
    }

    if (error.message.includes('ECONNREFUSED') || error.message.includes('Headers Timeout')) {
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable',
          details: 'The assessment service is currently busy. Please try again in a moment.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}