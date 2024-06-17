export function createTegA(
  parent: HTMLElement,
  href: string,
  text?: string,
  className?: string,
): HTMLElement {
  const tag = document.createElement('a');
  tag.className = `${className}`;
  tag.textContent = `${text}`;
  tag.href = `${href}`;
  parent.append(tag);
  tag.setAttribute('target', '_blank');
  return tag;
}
export function createTag(
  tagName: string,
  parent?: HTMLElement,
  text?: string,
  className?: string,
): HTMLElement {
  const tag = document.createElement(`${tagName}`);
  if (className) tag.className = `${className}`;
  if (text) tag.textContent = `${text}`;
  if (parent) parent.append(tag);
  return tag;
}

export function createTagInput(
  parent: HTMLElement,
  type: string,
  placeholder: string,
  name?: string,
  className?: string,
): HTMLInputElement {
  const tag = document.createElement('input');
  tag.type = type;
  tag.placeholder = placeholder;
  parent.append(tag);
  if (className) tag.className = `${className}`;
  if (name) tag.name = name;
  return tag;
}
