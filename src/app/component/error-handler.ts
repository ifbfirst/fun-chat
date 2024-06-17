import { Modal } from './component/modal';
import { CommonInterface } from './interfaces';

export function handlerError(response: CommonInterface): void {
  if (
    response.payload.error === 'a user with this login is already authorized'
  ) {
    new Modal('Пользователь с таким логином уже авторизован');
  }
  if (response.payload.error === 'incorrect password') {
    new Modal('Пароль не верен');
  }
}
