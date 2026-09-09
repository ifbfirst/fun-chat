const LOGIN_KEY = 'fun-chat.login';
const PASSWORD_KEY = 'fun-chat.password';

export type Session = {
  login: string;
  password: string;
};

export function loadSession(): Session | null {
  const login = sessionStorage.getItem(LOGIN_KEY);
  const password = sessionStorage.getItem(PASSWORD_KEY);
  if (!login || !password) {
    return null;
  }
  return { login, password };
}

export function saveSession(session: Session): void {
  sessionStorage.setItem(LOGIN_KEY, session.login);
  sessionStorage.setItem(PASSWORD_KEY, session.password);
}

export function clearSession(): void {
  sessionStorage.removeItem(LOGIN_KEY);
  sessionStorage.removeItem(PASSWORD_KEY);
  sessionStorage.removeItem('login-fun-chat');
  sessionStorage.removeItem('password');
}
