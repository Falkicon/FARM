import { describe, it, expect } from 'vitest';
import {
  PromptTemplate,
  TemplateValidationError,
  PromptPatterns,
  compileTemplate,
  createTemplate,
} from '../core/prompts';

describe('Prompt Engineering Utilities', () => {
  describe('Template Validation', () => {
    it('should validate required variables', () => {
      const template: PromptTemplate = {
        template: 'Hello {{name}}!',
        variables: [
          {
            name: 'name',
            required: true,
          },
        ],
      };

      expect(() => compileTemplate(template, {})).toThrow(TemplateValidationError);

      expect(() => compileTemplate(template, { name: 'World' })).not.toThrow();
    });

    it('should use default values when available', () => {
      const template: PromptTemplate = {
        template: 'Hello {{name}}!',
        variables: [
          {
            name: 'name',
            required: true,
            defaultValue: 'World',
          },
        ],
      };

      const result = compileTemplate(template, {});
      expect(result).toBe('Hello World!');
    });
  });

  describe('Template Compilation', () => {
    it('should replace all variables in template', () => {
      const template: PromptTemplate = {
        template: '{{greeting}} {{name}}! How is the {{time}}?',
        variables: [
          { name: 'greeting', required: true },
          { name: 'name', required: true },
          { name: 'time', required: true },
        ],
      };

      const result = compileTemplate(template, {
        greeting: 'Hello',
        name: 'World',
        time: 'morning',
      });

      expect(result).toBe('Hello World! How is the morning?');
    });

    it('should handle repeated variables', () => {
      const template: PromptTemplate = {
        template: '{{name}}, {{name}}! Your name is {{name}}.',
        variables: [{ name: 'name', required: true }],
      };

      const result = compileTemplate(template, { name: 'Alice' });
      expect(result).toBe('Alice, Alice! Your name is Alice.');
    });
  });

  describe('Prompt Patterns', () => {
    describe('Zero-Shot', () => {
      it('should create a zero-shot prompt template', () => {
        const template = PromptPatterns.zeroShot('Classify this text');
        expect(template.systemMessage).toBeDefined();
        expect(template.variables).toHaveLength(1);
        expect(template.variables[0].name).toBe('task');
      });

      it('should compile a zero-shot prompt', () => {
        const template = PromptPatterns.zeroShot('Classify this text');
        const result = compileTemplate(template, { task: 'Classify this text' });
        expect(result).toBe('Complete the following task: Classify this text');
      });
    });

    describe('Few-Shot', () => {
      it('should create a few-shot prompt template', () => {
        const examples = [
          { input: 'Hello', output: 'Greeting' },
          { input: 'Goodbye', output: 'Farewell' },
        ];
        const template = PromptPatterns.fewShot('Classify: Hi', examples);

        expect(template.systemMessage).toBeDefined();
        expect(template.variables).toHaveLength(2);
        expect(template.variables[0].name).toBe('examples');
        expect(template.variables[1].name).toBe('task');
      });

      it('should compile a few-shot prompt with examples', () => {
        const examples = [
          { input: 'Hello', output: 'Greeting' },
          { input: 'Goodbye', output: 'Farewell' },
        ];
        const template = PromptPatterns.fewShot('Classify: Hi', examples);
        const result = compileTemplate(template, {
          task: 'Classify: Hi',
          examples: examples.map((e) => `Input: ${e.input}\nOutput: ${e.output}`).join('\n\n'),
        });

        expect(result).toContain('Here are some examples:');
        expect(result).toContain('Input: Hello\nOutput: Greeting');
        expect(result).toContain('Input: Goodbye\nOutput: Farewell');
        expect(result).toContain('Now complete the following task: Classify: Hi');
      });
    });

    describe('Chain-of-Thought', () => {
      it('should create a chain-of-thought prompt template', () => {
        const template = PromptPatterns.chainOfThought('Solve: 2 + 2');
        expect(template.systemMessage).toBeDefined();
        expect(template.variables).toHaveLength(3);
        expect(template.variables.map((v) => v.name)).toEqual(['task', 'steps', 'answer']);
      });

      it('should compile a chain-of-thought prompt', () => {
        const template = PromptPatterns.chainOfThought('Solve: 2 + 2');
        const result = compileTemplate(template, {
          task: 'Solve: 2 + 2',
          steps: 'Let me break this down:\n1. We have two numbers: 2 and 2\n2. Addition means combining them',
          answer: '4',
        });

        expect(result).toContain("Let's solve this step by step:");
        expect(result).toContain('First, understand the task: Solve: 2 + 2');
        expect(result).toContain('Let me break this down:');
        expect(result).toContain('Therefore, the final answer is: 4');
      });
    });
  });

  describe('Custom Templates', () => {
    it('should create a custom template', () => {
      const template = createTemplate(
        'The {{color}} {{animal}} jumps over the {{object}}',
        [
          { name: 'color', required: true },
          { name: 'animal', required: true },
          { name: 'object', required: true, defaultValue: 'fence' },
        ],
        'You are a creative writing assistant.',
      );

      expect(template.systemMessage).toBe('You are a creative writing assistant.');
      expect(template.variables).toHaveLength(3);

      const result = compileTemplate(template, {
        color: 'brown',
        animal: 'fox',
      });

      expect(result).toBe('The brown fox jumps over the fence');
    });

    it('should validate variable schema', () => {
      expect(() =>
        createTemplate(
          'Hello {{name}}!',
          [{ name: 123 as any, required: true }], // Invalid schema
        ),
      ).toThrow();
    });
  });
});
