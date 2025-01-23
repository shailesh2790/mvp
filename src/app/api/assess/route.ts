// app/api/assess/route.ts

// app/api/assess/route.ts
import { NextResponse } from 'next/server';

// Clinical Assessment Interface
interface ClinicalAssessment {
  screening: {
    depression: {
      score: number;
      severity: string;
      keySymptoms: string[];
      riskFactors: string[];
      phq9Score: number;
    };
    anxiety: {
      score: number;
      severity: string;
      keySymptoms: string[];
      riskFactors: string[];
      gad7Score: number;
    };
    bipolar: {
      score: number;
      severity: string;
      keySymptoms: string[];
      riskFactors: string[];
      ymrsScore: number;
      moodPatterns: string[];
    };
  };
  clinicalSummary: {
    primaryConcerns: string[];
    immediateActions: string[];
    warningSignals: string[];
    recommendedProfessionalSupport: string[];
  };
  patientGuidance: {
    selfCareSteps: string[];
    lifestyleChanges: string[];
    supportResources: string[];
    whenToSeekHelp: string[];
  };
  professionalReport: {
    clinicalImpressions: string[];
    diagnosisConsiderations: {
      condition: string;
      icdCode: string;
      indicators: string[];
      differentials: string[];
    }[];
    recommendedAssessments: string[];
    suggestedInterventions: string[];
  };
}

const SEVERITY_THRESHOLDS = {
  depression: {
    mild: 5,
    moderate: 10,
    severe: 15
  },
  anxiety: {
    mild: 5,
    moderate: 10,
    severe: 15
  },
  bipolar: {
    mild: 5,
    moderate: 10,
    severe: 15
  }
};

function initializeScreening() {
  return {
    score: 0,
    severity: 'minimal',
    keySymptoms: [],
    riskFactors: [],
    phq9Score: 0,
    gad7Score: 0,
    ymrsScore: 0,
    moodPatterns: []
  };
}

function initializeBipolarScreening() {
  return {
    score: 0,
    severity: 'minimal',
    keySymptoms: [],
    riskFactors: [],
    ymrsScore: 0,
    moodPatterns: []
  };
}

function initializeSummary() {
  return {
    primaryConcerns: [],
    immediateActions: [],
    warningSignals: [],
    recommendedProfessionalSupport: []
  };
}

function initializeGuidance() {
  return {
    selfCareSteps: [],
    lifestyleChanges: [],
    supportResources: [],
    whenToSeekHelp: []
  };
}

function initializeProfessionalReport() {
  return {
    clinicalImpressions: [],
    diagnosisConsiderations: [],
    recommendedAssessments: [],
    suggestedInterventions: []
  };
}

// Core Assessment Functions
function calculateClinicalAssessment(responses: any[]): ClinicalAssessment {
  const assessment: ClinicalAssessment = {
    screening: {
      depression: initializeScreening(),
      anxiety: initializeScreening(),
      bipolar: initializeBipolarScreening()
    },
    clinicalSummary: initializeSummary(),
    patientGuidance: initializeGuidance(),
    professionalReport: initializeProfessionalReport()
  };

  // Process each response
  responses.forEach(response => {
    if (!response || !response.question) return;
    
    const { question, response: value } = response;
    processResponse(question, value, assessment);
  });

  // Finalize assessment
  finalizeAssessment(assessment);
  
  return assessment;
}

function processResponse(question: any, value: any, assessment: ClinicalAssessment) {
  // Process based on question category
  switch (question.category) {
    case 'emotional':
      processEmotionalResponse(question, value, assessment);
      break;
    case 'cognitive':
      processCognitiveResponse(question, value, assessment);
      break;
    case 'behavioral':
      processBehavioralResponse(question, value, assessment);
      break;
  }

  // Check for risk factors
  checkRiskFactors(question, value, assessment);
}

// Processing Functions
function processEmotionalResponse(question: any, value: any, assessment: ClinicalAssessment) {
  const { depression, anxiety, bipolar } = assessment.screening;

  switch (question.subCategory) {
    case 'mood':
    case 'depression':
      if (typeof value === 'number') {
        depression.score += value >= 7 ? 3 : value >= 5 ? 2 : 1;
        if (value >= 7) {
          depression.keySymptoms.push(`Severe mood symptoms: ${value}/10`);
        }
        depression.phq9Score += normalizeToPhq9Scale(value);
      }
      break;

    case 'anxiety':
      if (typeof value === 'number') {
        anxiety.score += value >= 7 ? 3 : value >= 5 ? 2 : 1;
        if (value >= 7) {
          anxiety.keySymptoms.push(`Severe anxiety symptoms: ${value}/10`);
        }
        anxiety.gad7Score += normalizeToGad7Scale(value);
      }
      break;

    case 'mania':
      if (typeof value === 'number' || value === true) {
        const score = typeof value === 'number' ? value : (value ? 10 : 0);
        bipolar.score += score >= 7 ? 3 : score >= 5 ? 2 : 1;
        if (score >= 7) {
          bipolar.keySymptoms.push('Significant manic symptoms');
        }
      }
      break;
  }
}

function processCognitiveResponse(question: any, value: any, assessment: ClinicalAssessment) {
  const { depression, anxiety } = assessment.screening;

  if (typeof value === 'number' && value <= 4) {
    assessment.professionalReport.clinicalImpressions.push(
      `Cognitive difficulties noted: ${question.text} - ${value}/10`
    );
  }

  if (question.subCategory === 'concentration' && typeof value === 'number') {
    if (value <= 4) {
      depression.keySymptoms.push('Poor concentration');
      anxiety.keySymptoms.push('Difficulty concentrating');
    }
  }
}

function processBehavioralResponse(question: any, value: any, assessment: ClinicalAssessment) {
  const { depression, anxiety } = assessment.screening;

  switch (question.subCategory) {
    case 'sleep':
      if (Array.isArray(value) && value.length >= 2) {
        depression.keySymptoms.push('Sleep disturbance');
        depression.score += 2;
      }
      break;

    case 'social':
      if (typeof value === 'number' && value <= 4) {
        depression.keySymptoms.push('Social withdrawal');
        anxiety.keySymptoms.push('Social avoidance');
        depression.score += 2;
        anxiety.score += 2;
      }
      break;
  }
}

function checkRiskFactors(question: any, value: any, assessment: ClinicalAssessment) {
  // Check for immediate risk factors
  if (
    (typeof value === 'number' && value >= 8) ||
    (typeof value === 'boolean' && value === true && question.clinicalRelevance?.includes('risk'))
  ) {
    assessment.clinicalSummary.warningSignals.push(
      `High score on ${question.text}: ${value}`
    );
  }

  // Check for specific risk patterns
  if (question.subCategory === 'mood' && typeof value === 'number' && value <= 3) {
    assessment.clinicalSummary.warningSignals.push('Severe mood symptoms present');
  }
}

function finalizeAssessment(assessment: ClinicalAssessment) {
  const { depression, anxiety, bipolar } = assessment.screening;

  // Update severities
  depression.severity = calculateSeverity('depression', depression.score);
  anxiety.severity = calculateSeverity('anxiety', anxiety.score);
  bipolar.severity = calculateSeverity('bipolar', bipolar.score);

  // Generate clinical impressions
  generateClinicalImpressions(assessment);

  // Generate recommendations
  generateRecommendations(assessment);

  // Generate patient guidance
  generatePatientGuidance(assessment);
}

function calculateSeverity(condition: keyof typeof SEVERITY_THRESHOLDS, score: number): string {
  const thresholds = SEVERITY_THRESHOLDS[condition];
  if (score >= thresholds.severe) return 'severe';
  if (score >= thresholds.moderate) return 'moderate';
  if (score >= thresholds.mild) return 'mild';
  return 'minimal';
}

function normalizeToPhq9Scale(value: number): number {
  return Math.round((value / 10) * 3); // Convert 0-10 scale to 0-3 PHQ-9 scale
}

function normalizeToGad7Scale(value: number): number {
  return Math.round((value / 10) * 3); // Convert 0-10 scale to 0-3 GAD-7 scale
}

//Recommendation Functions
function generateClinicalImpressions(assessment: ClinicalAssessment) {
  const { screening, professionalReport } = assessment;

  // Depression impressions
  if (screening.depression.score > 0) {
    professionalReport.diagnosisConsiderations.push({
      condition: 'Major Depressive Disorder',
      icdCode: 'F32',
      indicators: screening.depression.keySymptoms,
      differentials: ['Adjustment Disorder', 'Bipolar Depression']
    });
  }

  // Anxiety impressions
  if (screening.anxiety.score > 0) {
    professionalReport.diagnosisConsiderations.push({
      condition: 'Generalized Anxiety Disorder',
      icdCode: 'F41.1',
      indicators: screening.anxiety.keySymptoms,
      differentials: ['Social Anxiety', 'Panic Disorder']
    });
  }

  // Bipolar impressions
  if (screening.bipolar.score > 0) {
    professionalReport.diagnosisConsiderations.push({
      condition: 'Bipolar Disorder',
      icdCode: 'F31',
      indicators: screening.bipolar.keySymptoms,
      differentials: ['Major Depression', 'ADHD']
    });
  }
}

function generateRecommendations(assessment: ClinicalAssessment) {
  const { screening, clinicalSummary, professionalReport } = assessment;

  // Professional recommendations
  if (screening.depression.severity !== 'minimal') {
    professionalReport.recommendedAssessments.push(
      'Complete PHQ-9 assessment',
      'Evaluate for suicidal ideation',
      'Consider psychotherapy referral'
    );
  }

  if (screening.anxiety.severity !== 'minimal') {
    professionalReport.recommendedAssessments.push(
      'Complete GAD-7 assessment',
      'Evaluate for panic symptoms',
      'Consider CBT referral'
    );
  }

  if (screening.bipolar.severity !== 'minimal') {
    professionalReport.recommendedAssessments.push(
      'Complete mood disorder evaluation',
      'Consider YMRS assessment',
      'Evaluate need for mood stabilizers'
    );
  }

  // Immediate actions based on severity
  if (isHighRisk(assessment)) {
    clinicalSummary.immediateActions.push(
      'Urgent mental health evaluation recommended',
      'Consider crisis intervention',
      'Establish safety plan'
    );
  }
}

function generatePatientGuidance(assessment: ClinicalAssessment) {
  const { screening, patientGuidance } = assessment;

  // Self-care steps
  patientGuidance.selfCareSteps = [
    'Maintain regular sleep schedule',
    'Engage in daily physical activity',
    'Practice stress management techniques'
  ];

  // Condition-specific guidance
  if (screening.depression.severity !== 'minimal') {
    patientGuidance.selfCareSteps.push(
      'Set small, achievable daily goals',
      'Stay connected with supportive people',
      'Schedule enjoyable activities'
    );
  }

  if (screening.anxiety.severity !== 'minimal') {
    patientGuidance.selfCareSteps.push(
      'Practice deep breathing exercises',
      'Use grounding techniques',
      'Limit caffeine and alcohol'
    );
  }

  if (screening.bipolar.severity !== 'minimal') {
    patientGuidance.selfCareSteps.push(
      'Track your mood daily',
      'Maintain consistent daily routines',
      'Avoid making major decisions during mood episodes'
    );
  }

  // When to seek help
  generateSeekHelpGuidelines(assessment);
}

function generateSeekHelpGuidelines(assessment: ClinicalAssessment) {
  assessment.patientGuidance.whenToSeekHelp = [
    'Thoughts of self-harm or suicide',
    'Symptoms interfere with daily functioning',
    'Feeling overwhelmed by emotions',
    'Significant changes in sleep or appetite',
    'Unable to maintain work or relationships'
  ];
}

function isHighRisk(assessment: ClinicalAssessment): boolean {
  const { depression, anxiety, bipolar } = assessment.screening;
  return (
    depression.severity === 'severe' ||
    anxiety.severity === 'severe' ||
    bipolar.severity === 'severe' ||
    depression.keySymptoms.some(s => s.toLowerCase().includes('suicidal'))
  );
}

// API Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentAssessment, responses, history } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Valid responses are required' },
        { status: 400 }
      );
    }

    // Calculate clinical assessment
    const clinicalAssessment = calculateClinicalAssessment(responses);

    // Format reports
    const formattedAssessment = {
      timestamp: new Date().toISOString(),
      screening: {
        depression: {
          score: clinicalAssessment.screening.depression.phq9Score,
          severity: clinicalAssessment.screening.depression.severity,
          keySymptoms: clinicalAssessment.screening.depression.keySymptoms
        },
        anxiety: {
          score: clinicalAssessment.screening.anxiety.gad7Score,
          severity: clinicalAssessment.screening.anxiety.severity,
          keySymptoms: clinicalAssessment.screening.anxiety.keySymptoms
        },
        bipolar: {
          score: clinicalAssessment.screening.bipolar.ymrsScore,
          severity: clinicalAssessment.screening.bipolar.severity,
          keySymptoms: clinicalAssessment.screening.bipolar.keySymptoms,
          moodPatterns: clinicalAssessment.screening.bipolar.moodPatterns
        }
      },
      summary: generateSummary(clinicalAssessment),
      clinicalReport: {
        diagnosticConsiderations: clinicalAssessment.professionalReport.diagnosisConsiderations,
        recommendedAssessments: clinicalAssessment.professionalReport.recommendedAssessments,
        clinicalImpressions: clinicalAssessment.professionalReport.clinicalImpressions,
        riskFactors: clinicalAssessment.clinicalSummary.warningSignals
      },
      recommendations: {
        immediate: clinicalAssessment.clinicalSummary.immediateActions,
        professional: clinicalAssessment.clinicalSummary.recommendedProfessionalSupport,
        selfCare: clinicalAssessment.patientGuidance.selfCareSteps,
        lifestyle: clinicalAssessment.patientGuidance.lifestyleChanges,
        support: clinicalAssessment.patientGuidance.supportResources,
        warningSignals: clinicalAssessment.patientGuidance.whenToSeekHelp
      },
      historicalComparison: history ? generateHistoricalComparison(clinicalAssessment, history) : null
    };

    return NextResponse.json({
      success: true,
      assessment: formattedAssessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Assessment failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSummary(assessment: ClinicalAssessment): string {
  const concerns = [];
  const { depression, anxiety, bipolar } = assessment.screening;

  if (depression.severity !== 'minimal') {
    concerns.push(`${depression.severity} depressive symptoms`);
  }
  if (anxiety.severity !== 'minimal') {
    concerns.push(`${anxiety.severity} anxiety symptoms`);
  }
  if (bipolar.severity !== 'minimal') {
    concerns.push(`${bipolar.severity} bipolar symptoms`);
  }

  if (concerns.length === 0) {
    return "No significant mental health concerns identified at this time.";
  }

  return `Assessment indicates ${concerns.join(', ')}. ${
    isHighRisk(assessment) 
      ? 'Professional evaluation is strongly recommended.' 
      : 'Consider following the recommended support steps.'
  }`;
}

function generateHistoricalComparison(
  currentAssessment: ClinicalAssessment, 
  history: any[]
): any {
  if (!history.length) return null;

  const latestPrevious = history[history.length - 1];
  const changes = {
    depression: compareScores(
      currentAssessment.screening.depression.score,
      latestPrevious.depression?.score
    ),
    anxiety: compareScores(
      currentAssessment.screening.anxiety.score,
      latestPrevious.anxiety?.score
    ),
    bipolar: compareScores(
      currentAssessment.screening.bipolar.score,
      latestPrevious.bipolar?.score
    ),
    overallTrend: 'stable'
  };

  // Determine overall trend
  const significantChanges = Object.values(changes).filter(change => 
    change === 'significant improvement' || change === 'significant worsening'
  );

  if (significantChanges.length > 0) {
    changes.overallTrend = significantChanges.every(change => 
      change === 'significant improvement'
    ) ? 'improving' : 'worsening';
  }

  return changes;
}

function compareScores(current: number, previous?: number): string {
  if (!previous) return 'initial assessment';
  
  const difference = current - previous;
  if (Math.abs(difference) >= 3) {
    return difference > 0 ? 'significant worsening' : 'significant improvement';
  }
  if (Math.abs(difference) >= 1) {
    return difference > 0 ? 'slight worsening' : 'slight improvement';
  }
  return 'stable';
}

