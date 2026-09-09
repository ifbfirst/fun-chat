import {
  ChatMessage,
  ConnectionStatus,
  UserInfo,
  isCurrentDialog,
} from './protocol';

export type Screen = 'login' | 'chat';

export type ChatUser = {
  login: string;
  isOnline: boolean;
  unread: number;
};

export type AppState = {
  screen: Screen;
  connection: ConnectionStatus;
  currentUser: string | null;
  users: ChatUser[];
  selectedLogin: string | null;
  messages: ChatMessage[];
  search: string;
  editingId: string | null;
  historyLoading: boolean;
};

const initialState: AppState = {
  screen: 'login',
  connection: 'connecting',
  currentUser: null,
  users: [],
  selectedLogin: null,
  messages: [],
  search: '',
  editingId: null,
  historyLoading: false,
};

export class Store {
  private state: AppState = { ...initialState };

  private listeners = new Set<() => void>();

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private commit(next: AppState): void {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  setConnection(connection: ConnectionStatus): void {
    if (this.state.connection === connection) {
      return;
    }
    this.commit({ ...this.state, connection });
  }

  setSearch(search: string): void {
    this.commit({ ...this.state, search });
  }

  enterChat(login: string): void {
    this.commit({
      ...this.state,
      screen: 'chat',
      currentUser: login,
    });
  }

  leaveChat(): void {
    this.commit({
      ...initialState,
      connection: this.state.connection,
    });
  }

  setUserLists(active: UserInfo[], inactive: UserInfo[]): void {
    const unreadByLogin = new Map(
      this.state.users.map((user) => [user.login, user.unread]),
    );
    const me = this.state.currentUser;
    const merged = [...active, ...inactive]
      .filter((user) => user.login !== me)
      .reduce<ChatUser[]>((list, user) => {
        if (list.some((item) => item.login === user.login)) {
          return list;
        }
        list.push({
          login: user.login,
          isOnline: user.isLogined,
          unread: unreadByLogin.get(user.login) ?? 0,
        });
        return list;
      }, [])
      .sort((a, b) => {
        if (a.isOnline !== b.isOnline) {
          return a.isOnline ? -1 : 1;
        }
        return a.login.localeCompare(b.login, 'ru');
      });
    this.commit({ ...this.state, users: merged });
  }

  upsertUser(user: UserInfo): void {
    const me = this.state.currentUser;
    if (!me || user.login === me) {
      return;
    }
    const existing = this.state.users.find((item) => item.login === user.login);
    const nextUser: ChatUser = {
      login: user.login,
      isOnline: user.isLogined,
      unread: existing?.unread ?? 0,
    };
    const users = existing
      ? this.state.users.map((item) =>
          item.login === user.login ? nextUser : item,
        )
      : [...this.state.users, nextUser];
    users.sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      return a.login.localeCompare(b.login, 'ru');
    });
    this.commit({ ...this.state, users });
  }

  selectUser(login: string): void {
    this.commit({
      ...this.state,
      selectedLogin: login,
      messages: [],
      editingId: null,
      historyLoading: true,
      users: this.state.users.map((user) =>
        user.login === login ? { ...user, unread: 0 } : user,
      ),
    });
  }

  setHistory(messages: ChatMessage[]): void {
    this.commit({
      ...this.state,
      messages,
      historyLoading: false,
    });
  }

  applyIncomingMessage(message: ChatMessage): void {
    const me = this.state.currentUser;
    const selected = this.state.selectedLogin;
    if (!me) {
      return;
    }
    if (selected && isCurrentDialog(message, me, selected)) {
      const exists = this.state.messages.some((item) => item.id === message.id);
      this.commit({
        ...this.state,
        messages: exists
          ? this.state.messages.map((item) =>
              item.id === message.id ? message : item,
            )
          : [...this.state.messages, message],
      });
      return;
    }
    if (message.from === me) {
      return;
    }
    this.commit({
      ...this.state,
      users: this.state.users.map((user) =>
        user.login === message.from
          ? { ...user, unread: user.unread + 1 }
          : user,
      ),
    });
  }

  updateMessageStatus(
    id: string,
    patch: Partial<ChatMessage['status']> & { text?: string },
  ): void {
    this.commit({
      ...this.state,
      messages: this.state.messages.map((message) => {
        if (message.id !== id) {
          return message;
        }
        return {
          ...message,
          text: patch.text ?? message.text,
          status: {
            ...message.status,
            isDelivered: patch.isDelivered ?? message.status.isDelivered,
            isReaded: patch.isReaded ?? message.status.isReaded,
            isEdited: patch.isEdited ?? message.status.isEdited,
          },
        };
      }),
    });
  }

  removeMessage(id: string): void {
    this.commit({
      ...this.state,
      messages: this.state.messages.filter((message) => message.id !== id),
      editingId: this.state.editingId === id ? null : this.state.editingId,
    });
  }

  setEditing(id: string | null): void {
    this.commit({ ...this.state, editingId: id });
  }

  visibleUsers(): ChatUser[] {
    const query = this.state.search.trim().toLowerCase();
    if (!query) {
      return this.state.users;
    }
    return this.state.users.filter((user) =>
      user.login.toLowerCase().includes(query),
    );
  }
}
