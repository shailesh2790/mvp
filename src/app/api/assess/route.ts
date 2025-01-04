import { NextResponse } from 'next/server';

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

interface AssessmentResult {
  primary: {
    category: string;
    symptoms: string[];
    severity: string;
    nimhansClassification: string;
  };
  comorbidities: {
    conditions: Array<{
      name: string;
      severity: string;
      keySymptoms: string[];
    }>;
  };
  psychometricScores: {
    phq9: number;
    gad7: number;
    eqScore: number;
  };
  diagnosticIndications: {
    anxiety: {
      severity: string;
      keySymptoms: string[];
      specificType: string;
    };
    depression: {
      severity: string;
      keySymptoms: string[];
      specificType: string;
    };
  };
  eqDevelopment: {
    strengths: string[];
    areasForImprovement: string[];
    exercises: string[];
  };
  treatmentPlan: {
    immediate: string[];
    longTerm: string[];
    therapeuticApproaches: string[];
  };
  riskAssessment: {
    level: string;
    factors: string[];
    safetyPlan: string[];
    urgencyOfIntervention: string;
  };
  professionalCare: {
    recommended: boolean;
    urgencyLevel: string;
    recommendationType: string;
    specialistReferral: string[];
  };
}

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

async function queryMistral(prompt: string) {
  try {
    const response = await fetch('http://localhost:11435/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
        format: "json"
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error('Empty response from Mistral');
    }

    return data.response;
  } catch (error: any) {
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Unable to connect to Mistral. Please ensure the service is running.');
    }
    console.error('Mistral API error:', error);
    throw error;
  }
}

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

Provide your evaluation in this exact JSON format:
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
    "immediate": ["string array"],
    "longTerm": ["string array"],
    "therapeuticApproaches": ["string array of recommended NIMHANS therapy approaches"]
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

Analyze the provided assessment data thoroughly and ensure the response strictly follows this JSON structure with appropriate clinical insights.`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received assessment data:', data);

    // Validate input
    validateInput(data);

    // Get Mistral response
    const result = await queryMistral(constructNIMHANSPrompt(data.currentAssessment, data.history));
    console.log('Raw Mistral response:', result);
    
    // Parse and validate the response
    const parsedResult = JSON.parse(result);
    
    // Provide default values for missing sections
    const formattedResult: AssessmentResult = {
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

    console.log('Formatted result:', formattedResult);
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

    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: 'Unable to connect to assessment service. Please ensure Mistral is running.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name
      },
      { status: 500 }
    );
  }
}