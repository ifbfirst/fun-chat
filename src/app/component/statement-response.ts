import { User } from './interfaces';
import { changeReceiverStatusInfo } from './statement-client';

export function setUserStatus(
  response: User,
  statusCurrent: string,
  statusPrevious: string,
): void {
  const users = document.querySelectorAll(`.${statusPrevious}`);
  const usersSection = document.querySelector('.users-section');
  const receiverStatusInfo = document.querySelector('.receiver-status');
  const login = response.payload.user.login;
  users.forEach((element) => {
    if (element.textContent === login) {
      element.classList.remove(`${statusPrevious}`);
      element.classList.add(`${statusCurrent}`);
      if (statusCurrent === 'user-active') {
        usersSection?.prepend(element);
        if (receiverStatusInfo?.textContent?.length !== 0)
          changeReceiverStatusInfo('в сети', 'user-inactive', 'user-active');
      }
      if (statusCurrent === 'user-inactive') {
        usersSection?.append(element);
        if (receiverStatusInfo?.textContent?.length !== 0)
          changeReceiverStatusInfo('не в сети', 'user-active', 'user-inactive');
      }
    }
  });
}

export function checkUser(response: User): boolean | undefined {
  const login = response.payload.user.login;
  const users = document.querySelectorAll('.user');
  let arr = [];
  users.forEach((user) => {
    if (user.textContent === login) arr.push(user);
  });
  if (arr.length === 0) return false;
}

export function statusMessage(statusResponse: {
  isDelivered: boolean;
  isReaded: boolean;
  isEdited: boolean;
}) {
  if (statusResponse.isReaded === true) return 'прочитано';
  if (statusResponse.isDelivered === true) return 'доставлено';
  if (statusResponse.isDelivered === false) return 'отправлено';
}

export function changeStatusOnDelivered(id: string) {
  const messagesInfo = document.querySelectorAll('.sender-message');
  messagesInfo.forEach((message) => {
    if (id === message.id) {
      const statusDiv = message.querySelector('.status');
      if (statusDiv) statusDiv.textContent = 'доставлено';
    }
  });
}

export function changeStatusOnRead(id: string) {
  const message = document.getElementById(`${id}`);
  if (message?.className.includes('sender-message')) {
    const statusDiv = message?.querySelector('.status');
    if (statusDiv) statusDiv.textContent = 'прочитано';
  }
}

export function changeStatusOnEdit(id: string, text: string) {
  const message = document.getElementById(`${id}`);
  const messageText = message?.querySelector('.message');
  if (messageText) messageText.textContent = text;
  const editDiv = message?.querySelector('.edit');
  if (editDiv) editDiv.textContent = 'изменено';
}

export function deleteMessage(id: string) {
  document.getElementById(`${id}`)?.remove();
}
