/**
 * @fileoverview Environment variable constants for LLM providers
 */

/**
 * Environment variable names for LLM providers
 * Using const assertions for better type safety and to prevent modification
 */
export const ENV_VARS = {
  // OpenAI
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_ORG_ID: 'OPENAI_ORG_ID',

  // Azure OpenAI
  AZURE_OPENAI_API_KEY: 'AZURE_OPENAI_API_KEY',
  AZURE_OPENAI_ENDPOINT: 'AZURE_OPENAI_ENDPOINT',
  AZURE_OPENAI_API_VERSION: 'AZURE_OPENAI_API_VERSION',

  // Anthropic
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  ANTHROPIC_API_VERSION: 'ANTHROPIC_API_VERSION',

  // Google
  GOOGLE_API_KEY: 'GOOGLE_API_KEY',
  GOOGLE_PROJECT_ID: 'GOOGLE_PROJECT_ID',

  // General
  LLM_PROVIDER: 'LLM_PROVIDER',
  LLM_API_KEY: 'LLM_API_KEY',
  LLM_MODEL: 'LLM_MODEL',
} as const;

/**
 * Type for environment variable names
 */
export type EnvVarName = keyof typeof ENV_VARS;

/**
 * Get an environment variable value
 * @param name The environment variable name
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnvVar(name: EnvVarName, defaultValue?: string): string | undefined {
  return process.env[ENV_VARS[name]] || defaultValue;
}

/**
 * Check if an environment variable is set
 * @param name The environment variable name
 * @returns True if the environment variable is set
 */
export function hasEnvVar(name: EnvVarName): boolean {
  return !!process.env[ENV_VARS[name]];
}

/**
 * Get an environment variable value and throw an error if it's not set
 * @param name The environment variable name
 * @param errorMessage Optional custom error message
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function requireEnvVar(name: EnvVarName, errorMessage?: string): string {
  const value = getEnvVar(name);
  if (!value) {
    throw new Error(errorMessage || `Required environment variable ${ENV_VARS[name]} is not set`);
  }
  return value;
}

/**
 * Check if the current environment is a test environment
 * This is used across providers to determine whether to use mock responses
 * @returns True if the current environment is a test environment
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || !!process.env.VITEST;
}
