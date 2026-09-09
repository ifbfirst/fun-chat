type ElOptions = {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElOptions = {},
  ...children: Array<Node | string>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) {
    node.className = options.className;
  }
  if (options.text) {
    node.textContent = options.text;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }
  children.forEach((child) => node.append(child));
  return node;
}

export function icon(markup: string): HTMLSpanElement {
  const node = el('span', { className: 'icon' });
  node.innerHTML = markup;
  return node;
}

export function initials(login: string): string {
  return login.slice(0, 2).toUpperCase();
}

export function avatarHue(login: string): number {
  return Array.from(login).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDay(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  }
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export const ICONS = {
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.4 20.6v-6.2L14.2 12 3.4 9.6V3.4L22 12z"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.5A8.5 8.5 0 1 0 20.5 12 8.51 8.51 0 0 0 12 3.5zm.8 12.3h-1.6v-5h1.6zm0-6.4h-1.6V7.8h1.6z"/></svg>',
  logout:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 21H5V3h5V1H3v22h7zm3.6-5.4 1.4 1.4L21 12l-6-5-1.4 1.4L17.2 11H8v2h9.2z"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 4.6 7 13l8.4 8.4 1.4-1.4L9.8 13l7-7z"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm8.2 11.1-3-3 1.4-1.4 3 3z"/></svg>',
};
