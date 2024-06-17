import { createTag, createTagInput } from '../component/tag-creator';
import './style-login.css';

export class LoginForm {
  private tagResult: HTMLElement;

  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor() {
    this.tagResult = createTag('form', document.body, '', 'login-form');
    const loginInput = createTagInput(
      this.tagResult,
      'text',
      'Логин',
      'login',
      'login',
    );
    const passwordInput = createTagInput(
      this.tagResult,
      'password',
      'Пароль',
      'password',
      'password',
    );
    const btnSubmit = createTagInput(
      this.tagResult,
      'submit',
      '',
      '',
      'btn-submit',
    );
    loginInput.required = true;
    btnSubmit.value = 'Войти';
    loginInput.pattern = '^[a-zA-z]{3,10}';
    loginInput.title =
      'Логин должен быть не короче 3 символов и не длиннее 10 символов и содержать буквы латинского алфавита';
    passwordInput.pattern = '(?=.*[A-Z])(?=.*[0-9]).{4,10}';
    passwordInput.title =
      'Пароль должен быть не короче 4 символов и не длиннее 10 символов и содержать минимум одну большую букву латинского алфавита и одну цифру';
    loginInput.setAttribute('oninput', "this.setCustomValidity('')");
    passwordInput.setAttribute('oninput', "this.setCustomValidity('')");
  }
}
