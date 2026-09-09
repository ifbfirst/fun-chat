import { el } from '../dom';

export type LoginCredentials = {
  login: string;
  password: string;
};

export class LoginPage {
  readonly root: HTMLElement;

  private readonly form: HTMLFormElement;

  constructor(
    private readonly onSubmit: (credentials: LoginCredentials) => void,
    private readonly onInfo: () => void,
  ) {
    const loginInput = el('input', {
      className: 'field-input',
      attrs: {
        name: 'login',
        type: 'text',
        required: 'true',
        maxlength: '10',
        autocomplete: 'username',
        autocapitalize: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
        pattern: '^[a-zA-Z]{3,10}$',
        title:
          'Логин: 3–10 латинских букв, без цифр и пробелов',
        placeholder: ' ',
      },
    });
    const passwordInput = el('input', {
      className: 'field-input',
      attrs: {
        name: 'password',
        type: 'password',
        required: 'true',
        maxlength: '10',
        autocomplete: 'current-password',
        pattern: '(?=.*[A-Z])(?=.*[0-9]).{4,10}',
        title:
          'Пароль: 4–10 символов, хотя бы одна заглавная буква и одна цифра',
        placeholder: ' ',
      },
    });

    const clearValidity = (event: Event): void => {
      const input = event.target;
      if (input instanceof HTMLInputElement) {
        input.setCustomValidity('');
      }
    };
    loginInput.addEventListener('input', clearValidity);
    passwordInput.addEventListener('input', clearValidity);

    this.form = el(
      'form',
      { className: 'login-form' },
      el('label', { className: 'field' }, loginInput, el('span', { text: 'Логин' })),
      el(
        'label',
        { className: 'field' },
        passwordInput,
        el('span', { text: 'Пароль' }),
      ),
      el(
        'button',
        { className: 'btn btn-primary', attrs: { type: 'submit' } },
        'Войти',
      ),
    );

    const infoButton = el(
      'button',
      { className: 'btn btn-ghost', attrs: { type: 'button' } },
      'О приложении',
    );
    infoButton.addEventListener('click', () => this.onInfo());

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!this.form.reportValidity()) {
        return;
      }
      const data = new FormData(this.form);
      const login = String(data.get('login') ?? '').trim();
      const password = String(data.get('password') ?? '');
      this.onSubmit({ login, password });
    });

    this.root = el(
      'div',
      { className: 'login-screen' },
      el(
        'div',
        { className: 'login-card' },
        el('p', { className: 'login-kicker', text: 'Rolling Scopes School' }),
        el('h1', { className: 'login-title', text: 'Fun Chat' }),
        el(
          'p',
          {
            className: 'login-lead',
            text: 'Тихий мессенджер для живых разговоров. Войдите — или создайте пользователя при первом входе.',
          },
        ),
        this.form,
        infoButton,
      ),
    );
  }

  mount(): void {
    document.body.append(this.root);
  }

  destroy(): void {
    this.root.remove();
  }
}
