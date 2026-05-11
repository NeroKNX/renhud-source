export interface RenUser {
  user_id: string;
  name?: string;
  role?: string;
  isGuest?: boolean;
}

export function getUser(): RenUser | null {
  try {
    const raw = localStorage.getItem('ren_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: RenUser): void {
  localStorage.setItem('ren_user', JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem('ren_user');
}

export function getUserId(): string {
  const user = getUser();
  return user?.user_id || 'invitado';
}

export function isGuest(): boolean {
  const user = getUser();
  return user?.isGuest === true;
}
