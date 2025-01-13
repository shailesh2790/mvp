// app/api/assess/route.ts
import { NextResponse } from 'next/server';

interface Assessment {
  emotional: {
    mood?: string;
    intensity?: number;
    triggers?: string[];
  };
  cognitive: {
    thoughtPatterns?: string[];
    beliefs?: string[];
    concerns?: string[];
  };
  behavioral: {
    sleep?: string;
    activity?: string;
    social?: string;
  };
  eqMetrics: {
    awareness?: number;
    regulation?: number;
    social?: number;
  };
}

function cleanAndParseJSON(str: string) {
  try {
    // First attempt: direct parse
    return JSON.parse(str);
  } catch (e) {
    try {
      // Second attempt: Extract JSON from the response
      const jsonMatch = str.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Third attempt: Clean and try to parse
      const cleaned = str
        .replace(/[\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!cleaned.startsWith('{')) {
        const firstBrace = cleaned.indexOf('{');
        if (firstBrace !== -1) {
          return JSON.parse(cleaned.substring(firstBrace));
        }
      }
      
      throw new Error('Could not extract valid JSON from response');
    } catch (error) {
      console.error('Failed to parse response:', str);
      throw new Error('Invalid JSON format in response');
    }
  }
}

function constructNIMHANSPrompt(currentAssessment: Assessment, history: any[] = []) {
  return `You are an expert mental health diagnostic system following NIMHANS (National Institute of Mental Health and Neurosciences) guidelines and ICD-11 criteria. 
Analyze the following assessment data and provide a comprehensive evaluation.

Current Assessment:
Emotional State: ${JSON.stringify(currentAssessment.emotional)}
Cognitive Patterns: ${JSON.stringify(currentAssessment.cognitive)}
Behavioral Indicators: ${JSON.stringify(currentAssessment.behavioral)}
EQ Metrics: ${JSON.stringify(currentAssessment.eqMetrics)}

${history?.length > 0 ? `Assessment History:\n${JSON.stringify(history, null, 2)}` : 'No previous history available.'}

Based on this information, provide a comprehensive assessment following NIMHANS guidelines. 
Include:
1. Primary diagnosis category
2. Severity assessment
3. Key symptoms identified
4. Treatment recommendations
5. Professional care requirements

Format your response strictly as JSON following this structure:
{
  "primary": {
    "category": "Specific diagnostic category",
    "symptoms": ["symptom1", "symptom2"],
    "severity": "mild/moderate/severe",
    "nimhansClassification": "Classification code"
  },
  "psychometricScores": {
    "phq9": Number (0-27),
    "gad7": Number (0-21),
    "eqScore": Number (0-100)
  },
  "treatmentPlan": {
    "immediate": ["action1", "action2"],
    "longTerm": ["strategy1", "strategy2"],
    "therapeuticApproaches": ["approach1", "approach2"]
  },
  "professionalCare": {
    "recommended": boolean,
    "urgencyLevel": "low/moderate/high",
    "recommendationType": "type of care recommended",
    "specialistReferral": ["specialist1", "specialist2"]
  }
}

Response (in JSON format only):`;
}

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "mistral",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        }),
        signal: controller.signal
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
      clearTimeout(timeoutId);
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

function validateAssessmentData(data: any) {
  if (!data?.currentAssessment) {
    throw new Error('Current assessment data is required');
  }

  const requiredFields = ['emotional', 'cognitive', 'behavioral', 'eqMetrics'];
  const missingFields = requiredFields.filter(field => !data.currentAssessment[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Processing assessment request...');

    // Validate input data
    validateAssessmentData(data);
    
    console.log('Sending request to Mistral...');
    const result = await queryMistral(constructNIMHANSPrompt(data.currentAssessment, data.history));
    console.log('Received response from Mistral');

    let parsedResult;
    try {
      parsedResult = cleanAndParseJSON(result);
      console.log('Successfully parsed Mistral response');
    } catch (error) {
      console.error('Failed to parse result:', error);
      console.log('Raw result:', result);
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          details: 'Failed to parse assessment results'
        },
        { status: 500 }
      );
    }
    
    const formattedResult = {
      timestamp: new Date().toISOString(),
      primary: parsedResult.primary || {
        category: 'Not specified',
        symptoms: [],
        severity: 'Not specified',
        nimhansClassification: 'Not specified'
      },
      psychometricScores: parsedResult.psychometricScores || {
        phq9: 0,
        gad7: 0,
        eqScore: 0
      },
      treatmentPlan: parsedResult.treatmentPlan || {
        immediate: [],
        longTerm: [],
        therapeuticApproaches: []
      },
      professionalCare: parsedResult.professionalCare || {
        recommended: false,
        urgencyLevel: 'Low',
        recommendationType: 'Not specified',
        specialistReferral: []
      }
    };

    return NextResponse.json(formattedResult, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

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

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'The assessment is taking longer than expected. Please try again.'
        },
        { status: 504 }
      );
    }

    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: 'Cannot connect to Mistral server. Please ensure it is running.'
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