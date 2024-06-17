import { createTag } from '../tag-creator';

export class Modal {
  private tagResult: HTMLElement;

  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor(text: string) {
    this.tagResult = createTag('div', document.body, '', 'modal-bg');
    const modal = createTag('div', this.tagResult, text, 'modal');
    const closeModal = createTag('span', modal, '', 'close-modal');
    closeModal.innerHTML = '&times;';
    closeModal.addEventListener('click', () => {
      this.tagResult.remove();
    });
  }
}
