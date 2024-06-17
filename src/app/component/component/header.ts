import { userLogout } from '../api';
import { getInfo } from '../statement-client';
import { createTag } from '../tag-creator';
export class Header {
  private tagResult: HTMLElement;
  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor(login: string) {
    this.tagResult = createTag('header');
    this.tagResult.className = 'header';
    createTag('h2', this.tagResult, `Пользователь: ${login}`);
    createTag('h1', this.tagResult, 'Fun chat');
    const btnWrapper = createTag('div', this.tagResult);
    const btnLogout = createTag('button', btnWrapper, 'Выход', 'btn-logout');
    const btnInfo = createTag('button', btnWrapper, 'Информация', 'btn-info');
    btnLogout.onclick = () => userLogout();
    btnInfo.onclick = () => getInfo();
  }
}
