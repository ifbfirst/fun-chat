import { Footer } from '../component/component/footer';
import { Header } from '../component/component/header';
import { chooseUser, searchUsers } from '../component/statement-client';
import { createTag, createTagInput } from '../component/tag-creator';
import './style-main.css';
import './mobile-style.css';

export class MainPage {
  private tagResult: HTMLElement;

  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor(login: string) {
    this.tagResult = createTag('div', document.body, '', 'wrapper');
    const chatWrapper = createTag('div', this.tagResult, '', 'chat-wrapper');
    this.tagResult.append(
      new Header(login).getResultTag(),
      chatWrapper,
      new Footer().getResultTag(),
    );
    this.createUserSection(chatWrapper);
    this.createMessagesSection(chatWrapper);
  }

  createUserSection(chatWrapper: HTMLElement) {
    const leftSection = createTag('section', chatWrapper, '', 'left-section');
    const search = createTagInput(leftSection, 'search', 'поиск...', 'search');
    const users = createTag('section', leftSection, '', 'users-section');

    search.autocomplete = 'off';
    search.onchange = () => {
      searchUsers();
    };
    search.onkeydown = () => {
      searchUsers();
    };
    users.onclick = (e) => {
      chooseUser(e);
    };
  }

  createMessagesSection(chatWrapper: HTMLElement) {
    const messagesWrapper = createTag(
      'section',
      chatWrapper,
      '',
      'messages-section',
    );
    const userDialogInfo = createTag(
      'div',
      messagesWrapper,
      '',
      'user-dialog-info',
    );
    createTag('p', userDialogInfo, '', 'receiver');
    createTag('p', userDialogInfo, '', 'receiver-status');
    const dialogWrapper = createTag(
      'div',
      messagesWrapper,
      '',
      'dialog-wrapper',
    );
    const dialog = createTag('div', dialogWrapper, '', 'dialog');
    createTag(
      'p',
      dialog,
      'Выберите пользователя и начните диалог',
      'dialog-intro',
    );
    const newMessage = createTag(
      'form',
      messagesWrapper,
      '',
      'form-new-message',
    );
    createTagInput(
      newMessage,
      'text',
      'Сообщение...',
      'text',
      'text-message disabled',
    );
    createTagInput(newMessage, 'submit', '', '', 'btn-send-message disabled');
  }
}
