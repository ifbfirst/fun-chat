import { NewMessage } from './component/message';
import { Dialog, Message, User, Users } from './interfaces';
import { statusMessage } from './statement-response';
import { createTag } from './tag-creator';
import { checkReadingMessages } from './statement-client';

export function usersView(response: Users, userStatus: string): void {
  const users = <HTMLElement>document.querySelector('.users-section');
  const login = sessionStorage.getItem('login-fun-chat');
  response.payload.users.forEach((user: { login: string | null }) => {
    if (login && user.login !== login) {
      const newUser = createTag('div', users, '', `${userStatus} user`);
      newUser.innerHTML = `<i class="fa-regular fa-face-smile"></i>${user.login}`;
    }
  });
}

export function newUserView(response: User): void {
  const login = response.payload.user.login;
  const usersSection = <HTMLElement>document.querySelector('.users-section');
  const newUser = createTag('div', usersSection, '', 'user-active user');
  newUser.innerHTML = `<i class="fa-regular fa-face-smile"></i>${login}`;
}

export function dialogView(response: Dialog): void {
  const dialog = <HTMLElement>document.querySelector('.dialog');
  const login = sessionStorage.getItem('login-fun-chat');
  const receiver = document.querySelector('.receiver')?.textContent;
  let status: string;
  if (dialog) dialog.textContent = '';
  if (response.payload.messages.length === 0) {
    createTag('p', dialog, 'Напишите первое сообщение...', 'dialog-intro');
    return;
  }
  response.payload.messages.forEach((element: Message) => {
    status = <string>statusMessage(element.status);
    if (element.from === receiver)
      new NewMessage(
        element.text,
        'message-dialog receiver-message',
        element.from,
        element.datetime,
        ' ',
        element.id,
        element.status.isEdited,
      );

    if (element.from === login)
      new NewMessage(
        element.text,
        'message-dialog sender-message',
        'вы',
        element.datetime,
        status,
        element.id,
        element.status.isEdited,
      );
  });

  checkReadingMessages();
}

export function newMessageView(response: Message): void {
  const receiver = <string>document.querySelector('.receiver')?.textContent;
  const login = sessionStorage.getItem('login-fun-chat');
  if (response.from === login) {
    new NewMessage(
      response.text,
      'message-dialog sender-message',
      'вы',
      response.datetime,
      <string>statusMessage(response.status),
      response.id,
      response.status.isEdited,
    );
  }
  if (response.from === receiver) {
    new NewMessage(
      response.text,
      'message-dialog receiver-message',
      receiver,
      response.datetime,
      ' ',
      response.id,
      response.status.isEdited,
    );
    document.querySelector('.dialog-intro')?.remove();
  }
  checkReadingMessages();
}
