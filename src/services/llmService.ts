// src/services/llmService.ts
export class LLMService {
    private async generateSystemPrompt(context: AssessmentContext): Promise {
      return `You are an expert mental health diagnostic system. Your task is to:
  1. Analyze the user's emotional state, behaviors, and thought patterns
  2. Generate relevant follow-up questions based on their responses
  3. Identify potential early warning signs of mental health conditions
  4. Follow clinical diagnostic criteria (DSM-5 and ICD-11)
  
  Current Assessment Context:
  ${JSON.stringify(context, null, 2)}
  
  Previous responses indicate ${context.currentState.emotionalState} with intensity ${context.currentState.intensity}.
  Common triggers: ${context.historicalPattern.frequentTriggers.join(', ')}
  
  Generate the next most appropriate question to:
  1. Deepen understanding of their current state
  2. Explore any concerning patterns
  3. Assess risk factors if present
  4. Maintain therapeutic alliance
  
  Format your response as JSON:
  {
    "question": "the next question to ask",
    "type": "scale|text|multiSelect|singleSelect",
    "options": ["if applicable"],
    "clinicalReasoning": "why this question is relevant",
    "riskFactors": ["any identified risks"],
    "suggestedFocus": ["areas to explore further"]
  }`;
    }
  
    async generateNextQuestion(context: AssessmentContext): Promise<DynamicQuestion> {
      const systemPrompt = await this.generateSystemPrompt(context);
      
      try {
        const response = await fetch('http://localhost:11435/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "mistral",
            prompt: systemPrompt,
            stream: false,
            options: {
              temperature: 0.7
            }
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to generate next question');
        }
  
        const data = await response.json();
        const result = JSON.parse(data.response);
  
        return {
          id: `q_${Date.now()}`,
          text: result.question,
          type: result.type,
          options: result.options,
          context: context,
          followUpStrategy: result.clinicalReasoning
        };
      } catch (error) {
        console.error('Error generating question:', error);
        throw error;
      }
    }
  
    async analyzeResponse(response: DynamicResponse, context: AssessmentContext) {
      const analysisPrompt = `
      Analyze this response in the context of the ongoing assessment:
      Response: ${JSON.stringify(response)}
      Context: ${JSON.stringify(context)}
  
      Provide:
      1. Updated emotional state assessment
      2. Risk factor identification
      3. Suggested areas for deeper exploration
      4. Potential diagnostic patterns
      5. Recommended therapeutic approaches
  
      Format as JSON with clinical reasoning.
      `;
  
      try {
        const result = await fetch('http://localhost:11435/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "mistral",
            prompt: analysisPrompt,
            stream: false
          })
        });
  
        if (!result.ok) {
          throw new Error('Failed to analyze response');
        }
  
        const data = await result.json();
        return JSON.parse(data.response);
      } catch (error) {
        console.error('Error analyzing response:', error);
        throw error;
      }
    }
  }
  
