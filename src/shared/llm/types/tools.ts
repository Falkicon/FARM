/**
 * @fileoverview Type definitions for tool registry and execution
 */

import { z } from 'zod';

/**
 * Base tool interface
 */
export interface Tool<TInput = any, TOutput = any> {
  /** Unique name for the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** Input schema for the tool */
  parameters: z.ZodType<TInput>;
  /** Execute the tool with the given input */
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Tool registry configuration
 */
export interface ToolRegistryConfig {
  /** Maximum number of tools that can be called in a single request */
  maxToolCalls?: number;
  /** Maximum time (in ms) to wait for a tool to complete */
  toolTimeout?: number;
  /** Whether to allow parallel tool execution */
  allowParallel?: boolean;
}

/**
 * Tool execution result
 */
export interface ToolResult<TOutput = any> {
  /** Name of the tool that was executed */
  toolName: string;
  /** Output from the tool execution */
  output: TOutput;
  /** Time taken to execute the tool (in ms) */
  executionTime: number;
  /** Any errors that occurred during execution */
  error?: Error;
}

/**
 * Tool execution options
 */
export interface ToolExecutionOptions {
  /** Maximum time (in ms) to wait for the tool to complete */
  timeout?: number;
  /** Whether to throw on error or return error in result */
  throwOnError?: boolean;
}

/**
 * Tool execution error
 */
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly cause: Error,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

/**
 * Tool validation error
 */
export class ToolValidationError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly validationError: z.ZodError,
  ) {
    super(message);
    this.name = 'ToolValidationError';
  }
}

/**
 * Tool timeout error
 */
export class ToolTimeoutError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly timeout: number,
  ) {
    super(message);
    this.name = 'ToolTimeoutError';
  }
}
