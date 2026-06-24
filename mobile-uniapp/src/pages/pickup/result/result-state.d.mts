export type ResultType = 'info' | 'warning' | 'error';

export interface ResultStatusConfig {
  title: string;
  buttonLabel: string;
  copy: string;
  reason: string;
  nextSteps: string[];
}

export function normalizeResultType(type?: string): ResultType;

export function getResultStatusConfig(type?: string): ResultStatusConfig;

export function getResultRedirectUrl(type?: string, redirect?: string): string;
