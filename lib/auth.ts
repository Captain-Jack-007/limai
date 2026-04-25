const KEY = 'scibridge-auth';

export function signIn(email: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, email);
}

export function signOut() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}

export function getAuthedEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY);
}

export function isAuthed(): boolean {
  return getAuthedEmail() !== null;
}
