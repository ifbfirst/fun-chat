import { el } from '../dom';

export class Modal {
  private readonly root: HTMLElement;

  constructor(title: string, text: string) {
    const close = el('button', {
      className: 'modal-close',
      attrs: { type: 'button', 'aria-label': 'Закрыть' },
    }, '×');
    const dialog = el(
      'div',
      { className: 'modal', attrs: { role: 'dialog', 'aria-modal': 'true' } },
      el('h2', { className: 'modal-title', text: title }),
      el('p', { className: 'modal-text', text }),
      close,
    );
    this.root = el('div', { className: 'modal-backdrop' }, dialog);
    close.addEventListener('click', () => this.close());
    this.root.addEventListener('click', (event) => {
      if (event.target === this.root) {
        this.close();
      }
    });
    document.body.append(this.root);
  }

  close(): void {
    this.root.remove();
  }
}

export const ABOUT_TEXT =
  'Fun Chat — учебный мессенджер курса JavaScript/Front-end 2023Q4, Rolling Scopes School. Автор: Kate Mashko.';
