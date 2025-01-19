// app/api/assess/route.ts

import { NextResponse } from 'next/server';

interface AssessmentData {
  emotional: {
    mood: string;
    intensity: number;
    moodSwings: boolean;
    anxiety: boolean;
    energy: number;
    description: string;
    voiceJournal: string;
  };
  cognitive: {
    concentration: number;
    focusIssues: boolean;
    memoryIssues: boolean;
    thoughtPatterns: string;
    decisionMaking: number;
    clarity: number;
  };
  behavioral: {
    sleep: 'good' | 'fair' | 'poor';
    sleepHours: number;
    socialActivity: 'normal' | 'reduced' | 'withdrawn' | 'increased';
    activities: string[];
    avoidance: boolean;
    routineChanges: boolean;
  };
}

function calculateScores(responses: any[]) {
  const scores = {
    depression: 0,
    anxiety: 0,
    bipolar: 0,
    stress: 0,
    overall: 0
  };

  let totalQuestions = 0;

  responses.forEach(response => {
    const question = response.question;
    if (question.clinicalRelevance) {
      question.clinicalRelevance.forEach((condition: string) => {
        totalQuestions++;
        switch (question.type) {
          case 'scale':
            scores[condition] += 10 - response.response; // Invert for severity
            break;
          case 'yesNo':
            scores[condition] += response.response ? 10 : 0;
            break;
          case 'multiSelect':
            if (Array.isArray(response.response)) {
              scores[condition] += (response.response.length / question.options.length) * 10;
            }
            break;
          case 'singleSelect':
            const negativeOptions = ['Very poor', 'Poor', 'Severe'];
            if (negativeOptions.includes(response.response)) {
              scores[condition] += 10;
            }
            break;
        }
      });
    }
  });

  // Normalize scores
  Object.keys(scores).forEach(key => {
    if (key !== 'overall') {
      scores[key] = Math.round((scores[key] / totalQuestions) * 10);
    }
  });

  // Calculate overall score
  scores.overall = Math.round(
    (scores.depression + scores.anxiety + scores.bipolar + scores.stress) / 4
  );

  return scores;
}

function generateClinicalSummary(scores: any, responses: any[]) {
  const summary = {
    severity: scores.overall >= 7 ? 'severe' : scores.overall >= 5 ? 'moderate' : 'mild',
    primaryConcerns: [],
    clinicalImpressions: [],
    icdCodes: [],
    nimhansScales: [],
    recommendations: []
  };

  // Map conditions to ICD codes
  const conditionMappings = {
    depression: { icd10: 'F32', icd11: '6A70', scale: 'PHQ-9' },
    anxiety: { icd10: 'F41', icd11: '6B00', scale: 'GAD-7' },
    bipolar: { icd10: 'F31', icd11: '6A60', scale: 'YMRS' },
    stress: { icd10: 'F43', icd11: '6B40', scale: 'PSS' }
  };

  // Identify primary concerns (scores >= 6)
  Object.entries(scores).forEach(([condition, score]) => {
    if (condition !== 'overall' && score >= 6) {
      summary.primaryConcerns.push(condition);
      if (conditionMappings[condition]) {
        summary.icdCodes.push({
          condition,
          icd10: conditionMappings[condition].icd10,
          icd11: conditionMappings[condition].icd11
        });
        summary.nimhansScales.push(conditionMappings[condition].scale);
      }
    }
  });

  // Generate clinical impressions
  responses.forEach(response => {
    if (response.question.clinicalRelevance) {
      const relevantSymptoms = response.question.clinicalRelevance
        .filter(condition => summary.primaryConcerns.includes(condition));
      
      if (relevantSymptoms.length > 0) {
        summary.clinicalImpressions.push({
          symptom: response.question.text,
          severity: response.response,
          conditions: relevantSymptoms
        });
      }
    }
  });

  // Generate recommendations based on severity
  if (summary.severity === 'severe') {
    summary.recommendations.push(
      'Immediate professional mental health consultation recommended',
      'Consider comprehensive psychiatric evaluation',
      'Develop crisis management plan'
    );
  } else if (summary.severity === 'moderate') {
    summary.recommendations.push(
      'Schedule consultation with mental health professional',
      'Regular monitoring of symptoms',
      'Implement stress management strategies'
    );
  } else {
    summary.recommendations.push(
      'Continue self-monitoring',
      'Practice preventive mental health strategies',
      'Consider routine check-ups'
    );
  }

  return summary;
}

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

    // Calculate clinical scores
    const scores = calculateScores(responses);

    // Generate clinical summary
    const clinicalSummary = generateClinicalSummary(scores, responses);

    // Generate analysis and recommendations
    const assessment = {
      timestamp: new Date().toISOString(),
      scores,
      clinicalSummary,
      summary: `Overall Assessment Score: ${scores.overall}/10 - ${clinicalSummary.severity.toUpperCase()} severity`,
      recommendations: {
        immediate: clinicalSummary.severity === 'severe' ? [
          "Seek immediate professional mental health support",
          "Consider comprehensive psychiatric evaluation",
          "Establish a safety plan with support network"
        ] : [],
        shortTerm: [
          ...clinicalSummary.recommendations,
          "Regular monitoring of symptoms",
          "Implement suggested coping strategies"
        ],
        longTerm: [
          "Develop sustainable self-care routines",
          "Build strong support networks",
          "Regular mental health check-ins"
        ]
      },
      detailedAnalysis: {
        emotional: {
          summary: `Emotional health score: ${scores.depression}/10`,
          details: responses
            .filter(r => r.question.category === 'emotional')
            .map(r => `${r.question.text}: ${r.response}`)
        },
        cognitive: {
          summary: `Cognitive function score: ${scores.overall}/10`,
          details: responses
            .filter(r => r.question.category === 'cognitive')
            .map(r => `${r.question.text}: ${r.response}`)
        },
        behavioral: {
          summary: `Behavioral health score: ${scores.overall}/10`,
          details: responses
            .filter(r => r.question.category === 'behavioral')
            .map(r => `${r.question.text}: ${r.response}`)
        }
      }
    };

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Assessment failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}