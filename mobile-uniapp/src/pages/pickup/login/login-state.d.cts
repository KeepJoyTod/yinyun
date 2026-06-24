export type LoginMode = 'customer' | 'pickup';

export function normalizeRedirect(raw?: string): string;
export function normalizeLoginMode(raw?: string): LoginMode | '';
export function resolveLoginMode(target?: string, requestedMode?: string): LoginMode;

declare const loginState: {
  normalizeRedirect: typeof normalizeRedirect;
  normalizeLoginMode: typeof normalizeLoginMode;
  resolveLoginMode: typeof resolveLoginMode;
};

export default loginState;
