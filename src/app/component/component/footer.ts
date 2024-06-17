import { createTag, createTegA } from '../tag-creator';

export class Footer {
  private tagResult: HTMLElement;
  getResultTag(): HTMLElement {
    return this.tagResult;
  }

  constructor() {
    this.tagResult = document.createElement('footer');
    this.tagResult.className = 'footer';
    const school = createTag('p', this.tagResult);
    createTegA(school, 'https://rs.school/', 'RSSchool', 'link-school');
    const creator = createTag('p', this.tagResult);
    createTegA(creator, 'https://github.com/ifbfirst', 'Kate Mashko GitHub');
    const year = createTag('p', this.tagResult, '2024');
    this.tagResult.append(school, creator, year);
  }
}
