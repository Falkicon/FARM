/**
 * @fileoverview Tool registry and execution implementation
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { Tool, ToolRegistryConfig, ToolResult, ToolExecutionOptions } from '../types/tools';
import { ToolExecutionError, ToolValidationError, ToolTimeoutError } from '../types/tools';

/**
 * Default tool registry configuration
 */
const DEFAULT_CONFIG: Required<ToolRegistryConfig> = {
  maxToolCalls: 10,
  toolTimeout: 30000, // 30 seconds
  allowParallel: false
};

/**
 * Tool registry for managing and executing tools
 */
export class ToolRegistry {
  private tools = new Map<string, Tool>();
  private config: Required<ToolRegistryConfig>;

  constructor(config: ToolRegistryConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a new tool
   */
  register<TInput, TOutput>(tool: Tool<TInput, TOutput>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name '${tool.name}' is already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): void {
    if (!this.tools.has(name)) {
      throw new Error(`Tool with name '${name}' is not registered`);
    }
    this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get OpenAI function definitions for all registered tools
   */
  getFunctionDefinitions(): Array<{
    name: string;
    description: string;
    parameters: ReturnType<typeof zodToJsonSchema>;
  }> {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters)
    }));
  }

  /**
   * Execute a tool with the given input
   */
  async executeTool<TOutput = any>(
    name: string,
    input: unknown,
    options: ToolExecutionOptions = {}
  ): Promise<ToolResult<TOutput>> {
    const startTime = performance.now();
    const tool = this.getTool(name);

    if (!tool) {
      throw new Error(`Tool with name '${name}' is not registered`);
    }

    try {
      // Validate input against tool schema
      const validatedInput = await tool.parameters.parseAsync(input);

      // Create execution promise
      const executionPromise = tool.execute(validatedInput);

      // Handle timeout
      const timeout = options.timeout ?? this.config.toolTimeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          const error = new ToolTimeoutError(
            `Tool execution timed out after ${timeout}ms`,
            name,
            timeout
          );
          reject(error);
        }, timeout);

        // Cleanup timeout if execution finishes first
        executionPromise.finally(() => clearTimeout(timeoutId));
      });

      // Race execution against timeout
      const output = await Promise.race([executionPromise, timeoutPromise]);

      return {
        toolName: name,
        output,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const validationError = new ToolValidationError(
          'Tool input validation failed',
          name,
          error
        );

        if (options.throwOnError) {
          throw validationError;
        }

        return {
          toolName: name,
          output: undefined as unknown as TOutput,
          executionTime: performance.now() - startTime,
          error: validationError
        };
      }

      // Handle timeout errors
      if (error instanceof ToolTimeoutError) {
        if (options.throwOnError) {
          throw error;
        }

        return {
          toolName: name,
          output: undefined as unknown as TOutput,
          executionTime: performance.now() - startTime,
          error
        };
      }

      // Handle other errors
      const executionError = error instanceof Error ? error : new Error(String(error));
      const toolError = new ToolExecutionError(
        'Tool execution failed',
        name,
        executionError
      );

      if (options.throwOnError) {
        throw toolError;
      }

      return {
        toolName: name,
        output: undefined as unknown as TOutput,
        executionTime: performance.now() - startTime,
        error: toolError
      };
    }
  }

  /**
   * Execute multiple tools in sequence or parallel
   */
  async executeTools<TOutput = any>(
    calls: Array<{ name: string; input: unknown }>,
    options: ToolExecutionOptions = {}
  ): Promise<ToolResult<TOutput>[]> {
    // Validate against max tool calls
    if (calls.length > this.config.maxToolCalls) {
      throw new Error(`Cannot execute more than ${this.config.maxToolCalls} tools in a single request`);
    }

    // Execute tools
    if (this.config.allowParallel) {
      // Execute in parallel
      return Promise.all(
        calls.map(call => this.executeTool<TOutput>(call.name, call.input, options))
      );
    } else {
      // Execute in sequence
      const results: ToolResult<TOutput>[] = [];
      for (const call of calls) {
        const result = await this.executeTool<TOutput>(call.name, call.input, options);
        results.push(result);
      }
      return results;
    }
  }
}
