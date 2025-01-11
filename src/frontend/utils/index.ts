/**
 * Formats a number of bytes into a human-readable string
 * @param bytes The number of bytes to format
 * @param decimals The number of decimal places to show (default: 2)
 * @returns A formatted string (e.g., "1.00 KB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return `0.00 B`;

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const isNegative = bytes < 0;
  bytes = Math.abs(bytes);

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${isNegative ? '-' : ''}${value.toFixed(decimals)} ${sizes[i]}`;
}
