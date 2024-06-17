import {
  getUsers,
  getDialog,
  changeStatusOnReaded,
  removeMessage,
  editMessage,
} from './api';
import { Modal } from './component/modal';
import { formAuthorizationHandler, formMessageHandler } from './form-handlers';
import { User } from './interfaces';
import { LoginForm } from '../pages/login';
import { MainPage } from '../pages/main';
import { createTag } from './tag-creator';

export function getInfo() {
  new Modal(
    'Приложение Fun chat разработано в рамках курса JavaScript/Front-end 2023Q4. Aвтор Kate Mashko.',
  );
}

export function createMainPage(response: User): void {
  const login = response.payload.user.login;
  document.querySelector('form')?.remove();
  document.querySelector('.btn-info')?.remove();
  new MainPage(login);
  getUsers('active');
  getUsers('inactive');
}

export function stopAccessToMainPage(): void {
  document.querySelector('.wrapper')?.remove();
  new LoginForm();
  const btnInfo = createTag('button', document.body, 'Информация', 'btn-info');
  btnInfo.onclick = () => getInfo();
  formAuthorizationHandler();
}

export function chooseUser(e: Event): void {
  const receiverDiv = <HTMLElement>e.target;
  const receiver = receiverDiv.textContent;
  const receiverInfo = document.querySelector('.receiver');

  document.querySelector('.text-message')?.classList.remove('disabled');
  document.querySelector('.btn-send-message')?.classList.remove('disabled');

  if (!receiverDiv.closest('div')) return;
  if (receiverInfo && receiver) {
    receiverInfo.textContent = `${receiver}`;
    if (receiverDiv.classList.contains('user-active'))
      changeReceiverStatusInfo('в сети', 'user-inactive', 'user-active');
    if (receiverDiv.classList.contains('user-inactive'))
      changeReceiverStatusInfo('не в сети', 'user-active', 'user-inactive');
    formMessageHandler();
    getDialog(receiver);
  }
}

export function changeReceiverStatusInfo(
  status: string,
  previousClass: string,
  newClass: string,
): void {
  const receiverStatusInfo = document.querySelector('.receiver-status');
  if (!receiverStatusInfo) {
    return;
  }
  receiverStatusInfo.textContent = `${status}`;
  receiverStatusInfo.classList.remove(`${previousClass}`);
  receiverStatusInfo.classList.add(`${newClass}`);
}

export function checkReadingMessages(): void {
  const dialogWrapper = <HTMLElement>document.querySelector('.dialog-wrapper');
  const dialog = <HTMLElement>document.querySelector('.dialog');
  const messages = document.querySelectorAll('.receiver-message');
  const btnSendMessage = <HTMLElement>(
    document.querySelector('.btn-send-message')
  );

  dialogWrapper.onclick = (): void => {
    messages.forEach((message) => {
      changeStatusOnReaded(message.id);
    });
  };

  setTimeout(listenScroll, 500);
  function listenScroll(): void {
    dialog.addEventListener('scroll', function (): void {
      messages.forEach((message) => {
        changeStatusOnReaded(message.id);
      });
    });
  }

  btnSendMessage.onclick = () => {
    messages.forEach((message) => {
      changeStatusOnReaded(message.id);
    });
  };
}

export function searchUsers(): void {
  const input = <HTMLInputElement>document.querySelector('.search');
  const users = document.querySelectorAll('.user');
  const request = input.value;
  users.forEach((element) => {
    if (!element.textContent?.includes(request)) {
      element.classList.add('hidden');
    }
  });
  input.addEventListener('input', (e: Event) => {
    const inp = <HTMLInputElement>e.target;
    if (!inp.value) {
      users.forEach((element) => {
        element.classList.remove('hidden');
      });
    }
  });
}

export function contextMenu(e: Event, parent: HTMLElement): void {
  e.preventDefault();
  document.querySelector('.context-menu')?.remove();
  const menu = createTag('div', parent, '', 'context-menu');
  const changeOption = createTag('div', menu, 'Изменить');
  const removeOption = createTag('div', menu, 'Удалить');
  changeOption.onclick = () => changeMessage(parent);
  removeOption.onclick = () => removeMessage(parent.id);
  window.onclick = () => document.querySelector('.context-menu')?.remove();
}

function changeMessage(parent: HTMLElement): void {
  const input = <HTMLInputElement>document.querySelector('.text-message');
  let textDiv = parent.querySelector('.message');
  let text = textDiv?.textContent;
  if (input) input.value = `${text}`;
  const form = <HTMLFormElement>document.querySelector('.form-new-message');
  form.onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const newText = <string>formData.get('text');
    if (newText.length !== 0) {
      editMessage(parent.id, newText);
      input.value = '';
      if (textDiv) textDiv.textContent = newText;
    }
    formMessageHandler();
  };
}

export function changeTimestamp(time: number): string {
  return `${new Date(time).toTimeString().split(' ')[0]}`;
}
