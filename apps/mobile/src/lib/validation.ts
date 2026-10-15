export type FormErrors = Record<string, string>;

export function validateRequired(value: string, label: string) {
  return value.trim() ? '' : `${label} is required.`;
}

export function validateEmail(value: string) {
  if (!value.trim()) return 'Email is required.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.';
}

export function validatePassword(value: string) {
  if (!value) return 'Password is required.';
  return value.length >= 8 ? '' : 'Password must be at least 8 characters.';
}
