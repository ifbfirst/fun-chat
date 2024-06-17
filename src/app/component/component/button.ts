import { createTag } from '../tag-creator';

export class Button {
  private tagResult: HTMLElement;

  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor(
    className: string,
    text: string,
    parent: HTMLElement,
    handler: Function,
  ) {
    this.tagResult = createTag('button', parent, text, className);
    this.tagResult.onclick = () => handler();
  }
}
