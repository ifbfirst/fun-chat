import { sendMessage, userAuthorization } from './api';

export function formAuthorizationHandler(): void {
  const form = <HTMLFormElement>document.querySelector('.login-form');
  form.onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const login = <string>formData.get('login');
    const password = <string>formData.get('password');
    sessionStorage.setItem('login-fun-chat', login);
    sessionStorage.setItem('password', password);
    userAuthorization(login, password);
  };
}

export function formMessageHandler(): void {
  const form = <HTMLFormElement>document.querySelector('.form-new-message');
  form.onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const text = <string>formData.get('text');
    sendMessage(text);
  };
}
