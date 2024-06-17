import { createTag } from '../tag-creator';
import { changeTimestamp, contextMenu } from '../statement-client';

export class NewMessage {
  private tagResult: HTMLElement;
  text: string;
  user: string;
  time: string;
  status: string;
  edit: boolean;
  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor(
    text: string,
    className: string,
    user: string,
    time: number,
    status: string,
    id: string,
    edit: boolean,
  ) {
    this.tagResult = document.createElement('div');
    this.tagResult.className = className;
    this.tagResult.id = id;
    this.text = text;
    this.user = user;
    this.status = status;
    this.edit = edit;
    this.time = changeTimestamp(time);
    document.querySelector('.dialog')?.append(this.tagResult);
    const wrapperTopInfo = createTag(
      'div',
      this.tagResult,
      '',
      'wrapper-info-messages',
    );
    createTag('span', wrapperTopInfo, this.user, 'message-info');
    createTag('span', wrapperTopInfo, `${this.time}`, 'message-info');
    createTag('div', this.tagResult, this.text, 'message');
    const wrapperBottomInfo = createTag(
      'div',
      this.tagResult,
      '',
      'wrapper-info-messages',
    );
    createTag('span', wrapperBottomInfo, this.status, 'message-info status');
    if (className.includes('sender-message'))
      this.tagResult.oncontextmenu = (e) => contextMenu(e, this.tagResult);
    if (this.edit === true)
      createTag('span', wrapperBottomInfo, 'изменено', 'message-info edit');
    else {
      createTag('span', wrapperBottomInfo, '', 'message-info edit');
    }
    this.tagResult.scrollIntoView();
  }
}
