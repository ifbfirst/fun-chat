import { ChatApi } from '../api';
import {
  avatarHue,
  el,
  formatDay,
  formatTime,
  icon,
  ICONS,
  initials,
} from '../dom';
import { ChatMessage } from '../protocol';
import { ChatUser, Store } from '../store';
import { ABOUT_TEXT, Modal } from './modal';

export class ChatPage {
  readonly root: HTMLElement;

  private readonly usersList: HTMLElement;

  private readonly dialog: HTMLElement;

  private readonly receiverName: HTMLElement;

  private readonly receiverMeta: HTMLElement;

  private readonly composer: HTMLFormElement;

  private readonly composerInput: HTMLInputElement;

  private readonly composerHint: HTMLElement;

  private readonly connectionBar: HTMLElement;

  private readonly currentUserLabel: HTMLElement;

  private readonly unsubscribe: () => void;

  private lastUsersKey = '';

  private lastMessagesKey = '';

  private lastHeaderKey = '';

  private lastConnection = '';

  private readSent = new Set<string>();

  private menu: HTMLElement | null = null;

  private listMode = false;

  constructor(
    private readonly store: Store,
    private readonly api: ChatApi,
    private readonly onLogout: () => void,
  ) {
    this.usersList = el('div', { className: 'user-list' });
    this.dialog = el('div', { className: 'dialog', attrs: { role: 'log' } });
    this.receiverName = el('h2', { className: 'peer-name', text: 'Выберите диалог' });
    this.receiverMeta = el('p', { className: 'peer-meta', text: 'Список контактов' });
    this.composerHint = el('span', { className: 'composer-hint' });
    this.composerInput = el('input', {
      className: 'composer-input',
      attrs: {
        name: 'text',
        type: 'text',
        maxlength: '1000',
        autocomplete: 'off',
        placeholder: 'Напишите сообщение',
        enterkeyhint: 'send',
        autocapitalize: 'sentences',
      },
    });
    this.composer = el(
      'form',
      { className: 'composer is-disabled' },
      this.composerHint,
      this.composerInput,
      el(
        'button',
        {
          className: 'composer-send',
          attrs: { type: 'submit', 'aria-label': 'Отправить' },
        },
        icon(ICONS.send),
      ),
    );
    this.connectionBar = el('div', { className: 'connection-bar' });
    this.currentUserLabel = el('span', { className: 'brand-user' });

    const searchInput = el('input', {
      className: 'search-input',
      attrs: {
        type: 'search',
        placeholder: 'Найти пользователя',
        autocomplete: 'off',
      },
    });
    searchInput.addEventListener('input', () => {
      this.store.setSearch(searchInput.value);
    });

    const logoutButton = el(
      'button',
      { className: 'icon-btn', attrs: { type: 'button', title: 'Выход' } },
      icon(ICONS.logout),
    );
    const infoButton = el(
      'button',
      { className: 'icon-btn', attrs: { type: 'button', title: 'О приложении' } },
      icon(ICONS.info),
    );
    const backButton = el(
      'button',
      {
        className: 'icon-btn back-btn',
        attrs: { type: 'button', title: 'К списку' },
      },
      icon(ICONS.back),
    );

    logoutButton.addEventListener('click', () => this.onLogout());
    infoButton.addEventListener('click', () => {
      new Modal('Fun Chat', ABOUT_TEXT);
    });
    backButton.addEventListener('click', () => {
      this.listMode = true;
      this.root.classList.remove('is-dialog-open');
    });

    this.composer.addEventListener('submit', (event) => this.onComposerSubmit(event));
    this.composerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.store.getState().editingId) {
        this.store.setEditing(null);
        this.composerInput.value = '';
      }
    });

    const schoolLink = el('a', {
      className: 'footer-school',
      text: 'RS School',
      attrs: { href: 'https://rs.school/', target: '_blank', rel: 'noreferrer' },
    });

    this.root = el(
      'div',
      { className: 'chat-app' },
      this.connectionBar,
      el(
        'aside',
        { className: 'sidebar' },
        el(
          'div',
          { className: 'sidebar-head' },
          el(
            'div',
            { className: 'brand' },
            el('span', { className: 'brand-mark', text: 'FC' }),
            el(
              'div',
              {},
              el('strong', { className: 'brand-title', text: 'Fun Chat' }),
              this.currentUserLabel,
            ),
          ),
          el('div', { className: 'sidebar-actions' }, infoButton, logoutButton),
        ),
        el(
          'label',
          { className: 'search' },
          icon(ICONS.search),
          searchInput,
        ),
        this.usersList,
        el(
          'footer',
          { className: 'sidebar-footer' },
          schoolLink,
          el('a', {
            className: 'footer-link',
            text: 'Kate Mashko',
            attrs: {
              href: 'https://github.com/ifbfirst',
              target: '_blank',
              rel: 'noreferrer',
            },
          }),
          el('span', { text: '2024' }),
        ),
      ),
      el(
        'section',
        { className: 'conversation' },
        el(
          'header',
          { className: 'conversation-head' },
          backButton,
          el('div', { className: 'peer' }, this.receiverName, this.receiverMeta),
        ),
        el('div', { className: 'dialog-shell' }, this.dialog),
        this.composer,
      ),
    );

    document.addEventListener('click', this.onDocumentClick);
    this.unsubscribe = this.store.subscribe(() => this.sync());
    this.sync();
  }

  mount(): void {
    document.body.append(this.root);
  }

  destroy(): void {
    this.unsubscribe();
    document.removeEventListener('click', this.onDocumentClick);
    this.closeMenu();
    this.root.remove();
  }

  private onDocumentClick = (): void => {
    this.closeMenu();
  };

  private onComposerSubmit(event: Event): void {
    event.preventDefault();
    const state = this.store.getState();
    const text = this.composerInput.value.trim();
    if (!state.selectedLogin || !text) {
      return;
    }
    if (state.editingId) {
      this.api.editMessage(state.editingId, text);
      this.store.setEditing(null);
    } else {
      this.api.sendMessage(state.selectedLogin, text);
    }
    this.composerInput.value = '';
  }

  private sync(): void {
    const state = this.store.getState();
    this.currentUserLabel.textContent = state.currentUser
      ? `вы · ${state.currentUser}`
      : '';
    this.syncConnection(state.connection);
    this.syncUsers(this.store.visibleUsers(), state.selectedLogin);
    this.syncHeader(state.selectedLogin, state.users);
    this.syncMessages(
      state.messages,
      state.currentUser,
      state.selectedLogin,
      state.historyLoading,
    );
    this.syncComposer(state.selectedLogin, state.editingId, state.messages);
    this.markVisibleAsRead(state.messages, state.currentUser, state.selectedLogin);
    this.root.classList.toggle(
      'is-dialog-open',
      Boolean(state.selectedLogin) && !this.listMode,
    );
  }

  private syncConnection(status: string): void {
    if (this.lastConnection === status) {
      return;
    }
    this.lastConnection = status;
    this.connectionBar.classList.toggle('is-visible', status !== 'open');
    this.connectionBar.textContent =
      status === 'connecting'
        ? 'Подключаемся к серверу…'
        : 'Нет связи. Пробуем снова…';
  }

  private syncUsers(users: ChatUser[], selected: string | null): void {
    const key = `${selected ?? ''}|${users
      .map((user) => `${user.login}:${user.isOnline}:${user.unread}`)
      .join(';')}`;
    if (key === this.lastUsersKey) {
      return;
    }
    this.lastUsersKey = key;
    this.usersList.replaceChildren();
    if (users.length === 0) {
      this.usersList.append(
        el('p', {
          className: 'empty-note',
          text: 'Никого не найдено',
        }),
      );
      return;
    }
    users.forEach((user) => {
      const avatar = el('span', {
        className: 'avatar',
        text: initials(user.login),
      });
      avatar.style.background = `hsl(${avatarHue(user.login)} 28% 32%)`;
      const row = el(
        'button',
        {
          className: `user-row${selected === user.login ? ' is-active' : ''}${
            user.isOnline ? ' is-online' : ''
          }`,
          attrs: { type: 'button' },
        },
        avatar,
        el(
          'span',
          { className: 'user-copy' },
          el('span', { className: 'user-login', text: user.login }),
          el('span', {
            className: 'user-status',
            text: user.isOnline ? 'в сети' : 'не в сети',
          }),
        ),
      );
      if (user.unread > 0) {
        row.append(
          el('span', { className: 'unread', text: String(user.unread) }),
        );
      }
      row.addEventListener('click', () => {
        this.listMode = false;
        this.store.selectUser(user.login);
        this.readSent.clear();
        this.api.fetchDialog(user.login);
      });
      this.usersList.append(row);
    });
  }

  private syncHeader(selected: string | null, users: ChatUser[]): void {
    const peer = users.find((user) => user.login === selected);
    const key = `${selected ?? ''}:${peer?.isOnline ? '1' : '0'}`;
    if (key === this.lastHeaderKey) {
      return;
    }
    this.lastHeaderKey = key;
    if (!selected) {
      this.receiverName.textContent = 'Выберите диалог';
      this.receiverMeta.textContent = 'Список контактов';
      return;
    }
    this.receiverName.textContent = selected;
    this.receiverMeta.textContent = peer?.isOnline ? 'в сети' : 'не в сети';
    this.receiverMeta.classList.toggle('is-online', Boolean(peer?.isOnline));
  }

  private syncMessages(
    messages: ChatMessage[],
    me: string | null,
    selected: string | null,
    historyLoading: boolean,
  ): void {
    const key = `${historyLoading}:${messages
      .map(
        (message) =>
          `${message.id}:${message.text}:${message.status.isDelivered}:${message.status.isReaded}:${message.status.isEdited}`,
      )
      .join('|')}`;
    if (key === this.lastMessagesKey) {
      return;
    }
    const shouldStick =
      this.dialog.scrollHeight - this.dialog.scrollTop - this.dialog.clientHeight <
      80;
    this.lastMessagesKey = key;
    this.dialog.replaceChildren();

    if (!selected) {
      this.dialog.append(
        el('div', {
          className: 'dialog-placeholder',
          text: 'Выберите пользователя — и разговор начнётся здесь.',
        }),
      );
      return;
    }

    if (historyLoading) {
      this.dialog.append(
        el('div', {
          className: 'dialog-placeholder',
          text: 'Загружаем переписку…',
        }),
      );
      return;
    }

    if (messages.length === 0) {
      this.dialog.append(
        el('div', {
          className: 'dialog-placeholder',
          text: `Напишите первое сообщение для ${selected}`,
        }),
      );
      return;
    }

    let lastDay = '';
    messages.forEach((message) => {
      const day = formatDay(message.datetime);
      if (day !== lastDay) {
        lastDay = day;
        this.dialog.append(el('div', { className: 'day-chip', text: day }));
      }
      this.dialog.append(this.renderMessage(message, me === message.from));
    });

    if (shouldStick) {
      const last = this.dialog.lastElementChild;
      last?.scrollIntoView({ block: 'end' });
    }
  }

  private renderMessage(message: ChatMessage, mine: boolean): HTMLElement {
    const bubble = el('div', {
      className: `bubble${mine ? ' is-mine' : ''}`,
      attrs: { id: message.id },
    });
    const meta = el(
      'div',
      { className: 'bubble-meta' },
      el('span', { text: mine ? 'вы' : message.from }),
      el('span', { text: formatTime(message.datetime) }),
    );
    const text = el('p', { className: 'bubble-text', text: message.text });
    const foot = el('div', { className: 'bubble-foot' });
    if (mine) {
      foot.append(
        el('span', {
          className: `ticks${message.status.isReaded ? ' is-read' : ''}`,
          text: messageStatusLabel(message),
        }),
      );
    }
    if (message.status.isEdited) {
      foot.append(el('span', { className: 'edited', text: 'изменено' }));
    }
    bubble.append(meta, text, foot);
    if (mine) {
      const more = el(
        'button',
        {
          className: 'bubble-more',
          attrs: { type: 'button', 'aria-label': 'Действия' },
        },
        icon(ICONS.more),
      );
      more.addEventListener('click', (event) => {
        event.stopPropagation();
        this.openMenu(more, message);
      });
      bubble.append(more);
    }
    return bubble;
  }

  private openMenu(anchor: HTMLElement, message: ChatMessage): void {
    this.closeMenu();
    const edit = el('button', { className: 'menu-item', attrs: { type: 'button' } }, 'Изменить');
    const remove = el('button', { className: 'menu-item is-danger', attrs: { type: 'button' } }, 'Удалить');
    edit.addEventListener('click', (event) => {
      event.stopPropagation();
      this.store.setEditing(message.id);
      this.composerInput.value = message.text;
      this.composerInput.focus();
      this.closeMenu();
    });
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      this.api.deleteMessage(message.id);
      this.closeMenu();
    });
    this.menu = el('div', { className: 'msg-menu' }, edit, remove);
    anchor.closest('.bubble')?.append(this.menu);
  }

  private closeMenu(): void {
    this.menu?.remove();
    this.menu = null;
  }

  private syncComposer(
    selected: string | null,
    editingId: string | null,
    messages: ChatMessage[],
  ): void {
    const enabled = Boolean(selected);
    this.composer.classList.toggle('is-disabled', !enabled);
    this.composerInput.disabled = !enabled;
    if (editingId) {
      const current = messages.find((message) => message.id === editingId);
      this.composerHint.textContent = current
        ? `Редактирование · ${current.text.slice(0, 40)}`
        : 'Редактирование';
      this.composer.classList.add('is-editing');
    } else {
      this.composerHint.textContent = '';
      this.composer.classList.remove('is-editing');
    }
  }

  private markVisibleAsRead(
    messages: ChatMessage[],
    me: string | null,
    selected: string | null,
  ): void {
    if (!me || !selected) {
      return;
    }
    messages.forEach((message) => {
      if (
        message.from === selected &&
        !message.status.isReaded &&
        !this.readSent.has(message.id)
      ) {
        this.readSent.add(message.id);
        this.api.markRead(message.id);
      }
    });
  }
}

function messageStatusLabel(message: ChatMessage): string {
  if (message.status.isReaded) {
    return 'прочитано';
  }
  if (message.status.isDelivered) {
    return 'доставлено';
  }
  return 'отправлено';
}
