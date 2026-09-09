import { ChatApi } from './api';
import { translateError } from './errors';
import { ServerMessage, UserInfo } from './protocol';
import { clearSession, loadSession, saveSession } from './session';
import { SocketClient } from './socket';
import { Store } from './store';
import { ChatPage } from './ui/chat-page';
import { LoginPage } from './ui/login-page';
import { ABOUT_TEXT, Modal } from './ui/modal';

export class App {
  private readonly store = new Store();

  private readonly socket = new SocketClient();

  private readonly api = new ChatApi(this.socket);

  private page: LoginPage | ChatPage | null = null;

  private pendingAuth: { login: string; password: string } | null = null;

  private activeUsers: UserInfo[] = [];

  private inactiveUsers: UserInfo[] = [];

  start(): void {
    const session = loadSession();
    if (session) {
      this.pendingAuth = session;
      this.api.login(session.login, session.password);
    }
    this.socket.onMessage((message) => this.onServerMessage(message));
    this.socket.onStatus((status) => {
      this.store.setConnection(status);
      if (status === 'open' && this.store.getState().screen === 'chat') {
        const current = loadSession();
        if (current) {
          this.api.login(current.login, current.password);
        }
      }
    });
    this.socket.connect();
    this.renderScreen();
    this.store.subscribe(() => this.renderScreen());
  }

  private renderScreen(): void {
    const { screen } = this.store.getState();
    if (screen === 'login' && !(this.page instanceof LoginPage)) {
      this.page?.destroy();
      this.page = new LoginPage(
        (credentials) => {
          this.pendingAuth = credentials;
          this.api.login(credentials.login, credentials.password);
        },
        () => {
          new Modal('О приложении', ABOUT_TEXT);
        },
      );
      this.page.mount();
      return;
    }
    if (screen === 'chat' && !(this.page instanceof ChatPage)) {
      this.page?.destroy();
      this.page = new ChatPage(this.store, this.api, () => this.logout());
      this.page.mount();
    }
  }

  private logout(): void {
    const session = loadSession();
    if (session) {
      this.api.logout(session.login, session.password);
    }
  }

  private onServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'ERROR':
        new Modal('Не получилось', translateError(message.payload.error));
        if (
          message.payload.error === 'incorrect password' ||
          message.payload.error ===
            'a user with this login is already authorized'
        ) {
          this.pendingAuth = null;
          clearSession();
        }
        break;
      case 'USER_LOGIN':
        this.onLogin(message.payload.user.login);
        break;
      case 'USER_LOGOUT':
        this.pendingAuth = null;
        clearSession();
        this.activeUsers = [];
        this.inactiveUsers = [];
        this.store.leaveChat();
        break;
      case 'USER_ACTIVE':
        this.activeUsers = message.payload.users;
        this.store.setUserLists(this.activeUsers, this.inactiveUsers);
        break;
      case 'USER_INACTIVE':
        this.inactiveUsers = message.payload.users;
        this.store.setUserLists(this.activeUsers, this.inactiveUsers);
        break;
      case 'USER_EXTERNAL_LOGIN':
      case 'USER_EXTERNAL_LOGOUT':
        this.store.upsertUser(message.payload.user);
        break;
      case 'MSG_FROM_USER':
        this.store.setHistory(message.payload.messages);
        break;
      case 'MSG_SEND':
        this.store.applyIncomingMessage(message.payload.message);
        break;
      case 'MSG_DELIVER':
        this.store.updateMessageStatus(message.payload.message.id, {
          isDelivered: message.payload.message.status.isDelivered,
        });
        break;
      case 'MSG_READ':
        this.store.updateMessageStatus(message.payload.message.id, {
          isReaded: message.payload.message.status.isReaded,
        });
        break;
      case 'MSG_DELETE':
        this.store.removeMessage(message.payload.message.id);
        break;
      case 'MSG_EDIT':
        this.store.updateMessageStatus(message.payload.message.id, {
          text: message.payload.message.text,
          isEdited: true,
        });
        break;
      default:
        break;
    }
  }

  private onLogin(login: string): void {
    const password =
      this.pendingAuth?.password ?? loadSession()?.password ?? '';
    if (password) {
      saveSession({ login, password });
    }
    this.pendingAuth = { login, password };
    const selected = this.store.getState().selectedLogin;
    this.store.enterChat(login);
    this.api.fetchUsers();
    if (selected) {
      this.api.fetchDialog(selected);
    }
  }
}

export default App;
