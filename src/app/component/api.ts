import { Modal } from './component/modal';
import { handlerError } from './error-handler';

import {
  changeStatusOnDelivered,
  changeStatusOnEdit,
  changeStatusOnRead,
  checkUser,
  deleteMessage,
  setUserStatus,
} from './statement-response';
import { createMainPage, stopAccessToMainPage } from './statement-client';
import {
  dialogView,
  newMessageView,
  newUserView,
  usersView,
} from './view-response';

let socket = new WebSocket('ws://127.0.0.1:4000');

export function startWebSocket(): void {
  socket.onopen = function (): void {};
}

export function userAuthorization(login: string, password: string): void {
  const user = {
    id: login,
    type: 'USER_LOGIN',
    payload: {
      user: {
        login: login,
        password: password,
      },
    },
  };
  socket.send(JSON.stringify(user));
}

export function userLogout(): void {
  const login = sessionStorage.getItem('login-fun-chat');
  const user = {
    id: login,
    type: 'USER_LOGOUT',
    payload: {
      user: {
        login: login,
        password: sessionStorage.getItem('password'),
      },
    },
  };
  socket.send(JSON.stringify(user));
}

export function getUsers(userStatus: string): void {
  const users = {
    id: `user-${userStatus}`,
    type: `USER_${userStatus.toUpperCase()}`,
    payload: null,
  };
  socket.send(JSON.stringify(users));
}

export function sendMessage(text: string): void {
  const receiverDiv = <HTMLElement>document.querySelector('.receiver');
  const receiver = <string>receiverDiv.textContent;
  const textInput = <HTMLInputElement>document.querySelector('.text-message');
  textInput.value = '';
  document.querySelector('.dialog-intro')?.remove();
  const msg = {
    id: String(new Date().getTime()),
    type: 'MSG_SEND',
    payload: {
      message: {
        to: receiver,
        text: text,
      },
    },
  };
  if (text) {
    socket.send(JSON.stringify(msg));
  }
}

export function getDialog(receiver: string): void {
  const request = {
    id: String(new Date().getTime()),
    type: 'MSG_FROM_USER',
    payload: {
      user: {
        login: receiver,
      },
    },
  };
  socket.send(JSON.stringify(request));
}

export function changeStatusOnReaded(id: string): void {
  const request = {
    id: String(new Date().getTime()),
    type: 'MSG_READ',
    payload: {
      message: {
        id: id,
      },
    },
  };
  socket.send(JSON.stringify(request));
}

export function removeMessage(id: string): void {
  const request = {
    id: String(new Date().getTime()),
    type: 'MSG_DELETE',
    payload: {
      message: {
        id: id,
      },
    },
  };

  socket.send(JSON.stringify(request));
}

export function editMessage(id: string, text: string): void {
  const request = {
    id: String(new Date().getTime()),
    type: 'MSG_EDIT',
    payload: {
      message: {
        id: id,
        text: text,
      },
    },
  };

  socket.send(JSON.stringify(request));
}

socket.onmessage = (event) => {
  const data = event.data;
  const response = JSON.parse(data);
  switch (response.type) {
    case 'ERROR':
      handlerError(response);
      break;
    case 'USER_LOGIN':
      createMainPage(response);
      break;
    case 'USER_LOGOUT':
      stopAccessToMainPage();
      break;
    case 'USER_ACTIVE':
      usersView(response, 'user-active');
      break;
    case 'USER_INACTIVE':
      usersView(response, 'user-inactive');
      break;
    case 'USER_EXTERNAL_LOGOUT':
      setUserStatus(response, 'user-inactive', 'user-active');
      break;
    case 'USER_EXTERNAL_LOGIN':
      if (checkUser(response) === false) {
        newUserView(response);
      } else {
        setUserStatus(response, 'user-active', 'user-inactive');
      }
      break;
    case 'MSG_FROM_USER':
      dialogView(response);
      break;
    case 'MSG_SEND':
      newMessageView(response.payload.message);
      break;
    case 'MSG_DELIVER':
      changeStatusOnDelivered(response.payload.message.id);
      break;
    case 'MSG_READ':
      changeStatusOnRead(response.payload.message.id);
      break;
    case 'MSG_DELETE':
      deleteMessage(response.payload.message.id);
      break;
    case 'MSG_EDIT':
      changeStatusOnEdit(
        response.payload.message.id,
        response.payload.message.text,
      );
      break;
    default:
      '';
  }
};

socket.onclose = function (event) {
  if (!event.wasClean) {
    new Modal('Ошибка на сервере. Запускаем заново...');
  }
};
