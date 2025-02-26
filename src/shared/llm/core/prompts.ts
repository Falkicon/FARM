/**
 * @fileoverview Prompt engineering utilities for LLM interactions
 */

import { z } from 'zod';

/**
 * Template variable schema
 */
export const TemplateVariableSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
  defaultValue: z.any().optional()
});

export type TemplateVariable = z.infer<typeof TemplateVariableSchema>;

/**
 * Prompt template configuration
 */
export interface PromptTemplate {
  /** Template string with variable placeholders */
  template: string;
  /** Variables used in the template */
  variables: TemplateVariable[];
  /** System message to set context */
  systemMessage?: string;
  /** Temperature for response generation */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
}

/**
 * Error thrown when template variables are invalid
 */
export class TemplateValidationError extends Error {
  constructor(
    message: string,
    public readonly variables: string[]
  ) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

/**
 * Common prompt patterns
 */
export const PromptPatterns = {
  /**
   * Zero-shot task completion
   */
  zeroShot: (task: string): PromptTemplate => ({
    template: 'Complete the following task: {{task}}',
    variables: [{
      name: 'task',
      description: 'Task to complete',
      required: true,
      defaultValue: task
    }],
    systemMessage: 'You are a helpful assistant that completes tasks accurately.'
  }),

  /**
   * Few-shot learning with examples
   */
  fewShot: (task: string, examples: Array<{ input: string; output: string }>): PromptTemplate => ({
    template: `Here are some examples:
{{examples}}

Now complete the following task: {{task}}`,
    variables: [{
      name: 'examples',
      description: 'Examples formatted as input -> output pairs',
      required: true,
      defaultValue: examples.map(e => `Input: ${e.input}\nOutput: ${e.output}`).join('\n\n')
    }, {
      name: 'task',
      description: 'Task to complete',
      required: true,
      defaultValue: task
    }],
    systemMessage: 'You are a helpful assistant that learns from examples.'
  }),

  /**
   * Chain-of-thought reasoning
   */
  chainOfThought: (task: string): PromptTemplate => ({
    template: `Let's solve this step by step:
1. First, understand the task: {{task}}
2. {{steps}}
3. Therefore, the final answer is: {{answer}}`,
    variables: [{
      name: 'task',
      description: 'Task to solve',
      required: true,
      defaultValue: task
    }, {
      name: 'steps',
      description: 'Step-by-step reasoning process',
      required: true
    }, {
      name: 'answer',
      description: 'Final answer based on reasoning',
      required: true
    }],
    systemMessage: 'You are a helpful assistant that explains your reasoning step by step.'
  })
};

/**
 * Validate and compile a prompt template
 */
export function compileTemplate(
  template: PromptTemplate,
  variables: Record<string, any>
): string {
  // Validate required variables
  const missingVariables = template.variables
    .filter(v => v.required && !variables[v.name] && !v.defaultValue)
    .map(v => v.name);

  if (missingVariables.length > 0) {
    throw new TemplateValidationError(
      'Missing required variables',
      missingVariables
    );
  }

  // Replace variables in template
  let result = template.template;
  for (const variable of template.variables) {
    const value = variables[variable.name] ?? variable.defaultValue;
    if (value !== undefined) {
      result = result.replace(
        new RegExp(`{{${variable.name}}}`, 'g'),
        String(value)
      );
    }
  }

  return result;
}

/**
 * Create a custom prompt template
 */
export function createTemplate(
  template: string,
  variables: TemplateVariable[] = [],
  systemMessage?: string
): PromptTemplate {
  return {
    template,
    variables: variables.map(v => TemplateVariableSchema.parse(v)),
    systemMessage
  };
}
