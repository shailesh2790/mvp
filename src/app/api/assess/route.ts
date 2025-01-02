import { NextResponse } from 'next/server';

interface AssessmentData {
  emotional: {
    mood: string;
    intensity: number;
    anxiety: boolean;
    moodSwings: boolean;
    voiceJournal?: string;
  };
  cognitive: {
    concentration: number;
    memoryIssues: boolean;
    focusIssues: boolean;
    thoughtPatterns: string;
  };
  behavioral: {
    sleep: string;
    sleepHours: number;
    socialActivity: string;
    activities: string[];
  };
  eqMetrics: {
    selfAwareness: number;
    empathy: number;
    regulation: number;
  };
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
    return data.response;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

function validateAssessmentData(data: Partial<AssessmentData>): void {
  if (!data) throw new Error('Assessment data is required');
  
  // Initialize missing sections with default values
  data.emotional = data.emotional || {
    mood: 'not specified',
    intensity: 5,
    anxiety: false,
    moodSwings: false
  };
  
  data.cognitive = data.cognitive || {
    concentration: 5,
    memoryIssues: false,
    focusIssues: false,
    thoughtPatterns: 'not specified'
  };

  data.behavioral = data.behavioral || {
    sleep: 'not specified',
    sleepHours: 8,
    socialActivity: 'not specified',
    activities: []
  };

  data.eqMetrics = data.eqMetrics || {
    selfAwareness: 5,
    empathy: 5,
    regulation: 5
  };

  // Validate data ranges
  if (data.emotional.intensity !== undefined && 
      (typeof data.emotional.intensity !== 'number' || 
       data.emotional.intensity < 0 || 
       data.emotional.intensity > 10)) {
    throw new Error('Emotional intensity must be between 0 and 10');
  }

  if (data.behavioral.sleepHours !== undefined && 
      (typeof data.behavioral.sleepHours !== 'number' || 
       data.behavioral.sleepHours < 0 || 
       data.behavioral.sleepHours > 24)) {
    throw new Error('Sleep hours must be between 0 and 24');
  }

  const eqMetrics = ['selfAwareness', 'empathy', 'regulation'] as const;
  for (const metric of eqMetrics) {
    const value = data.eqMetrics[metric];
    if (value !== undefined && 
        (typeof value !== 'number' || 
         value < 0 || 
         value > 10)) {
      throw new Error(`${metric} must be between 0 and 10`);
    }
  }
}

function constructPrompt(data: AssessmentData): string {
  return `As an expert clinical psychologist, analyze this mental health assessment data and provide a comprehensive evaluation. Format your response as a specific JSON object.

Assessment Data:
Emotional State:
- Mood: ${data.emotional.mood}
- Intensity: ${data.emotional.intensity}/10
- Anxiety Present: ${data.emotional.anxiety}
- Mood Swings: ${data.emotional.moodSwings}
${data.emotional.voiceJournal ? `- Voice Journal: ${data.emotional.voiceJournal}` : ''}

Cognitive State:
- Concentration: ${data.cognitive.concentration}/10
- Memory Issues: ${data.cognitive.memoryIssues}
- Focus Issues: ${data.cognitive.focusIssues}
- Thought Patterns: ${data.cognitive.thoughtPatterns}

Behavioral Patterns:
- Sleep Quality: ${data.behavioral.sleep}
- Sleep Hours: ${data.behavioral.sleepHours}
- Social Activity: ${data.behavioral.socialActivity}
- Activities: ${data.behavioral.activities.join(', ')}

EQ Metrics:
- Self Awareness: ${data.eqMetrics.selfAwareness}/10
- Empathy: ${data.eqMetrics.empathy}/10
- Regulation: ${data.eqMetrics.regulation}/10

Provide your evaluation in this exact JSON format:
{
  "clinicalAssessment": {
    "severityLevel": "string (Low/Moderate/High)",
    "primarySymptoms": ["string array of main symptoms"]
  },
  "diagnosticIndications": {
    "anxiety": {
      "severity": "string (Low/Moderate/High)",
      "keySymptoms": ["string array of anxiety symptoms"]
    },
    "depression": {
      "severity": "string (Low/Moderate/High)",
      "keySymptoms": ["string array of depression symptoms"]
    }
  },
  "eqDevelopment": {
    "strengths": ["string array of emotional strengths"],
    "areasForImprovement": ["string array of areas to work on"],
    "exercises": ["string array of recommended exercises"]
  },
  "treatmentPlan": {
    "immediate": ["string array of immediate actions"],
    "longTerm": ["string array of long-term strategies"]
  },
  "professionalCare": {
    "recommended": boolean,
    "urgencyLevel": "string (Low/Moderate/High)",
    "recommendation": "string explaining professional care recommendation"
  }
}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    validateAssessmentData(data);

    const result = await queryMistral(constructPrompt(data));
    
    // Parse and validate the response
    const parsedResult = JSON.parse(result);
    
    // Validate required sections
    const requiredSections = [
      'clinicalAssessment',
      'diagnosticIndications',
      'eqDevelopment',
      'treatmentPlan',
      'professionalCare'
    ];
    
    const missingSections = requiredSections.filter(section => !parsedResult[section]);
    if (missingSections.length > 0) {
      throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
    }

    return NextResponse.json(parsedResult);

  } catch (error) {
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

    return NextResponse.json(
      { 
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}