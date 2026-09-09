import { ClientRequest, ConnectionStatus, ServerMessage } from './protocol';

function resolveWsUrl(): string {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'ws://127.0.0.1:4000';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

const WS_URL = resolveWsUrl();
const RECONNECT_DELAY = 2000;

export class SocketClient {
  private socket: WebSocket | null = null;

  private queue: string[] = [];

  private reconnectTimer: number | null = null;

  private shouldReconnect = true;

  private messageListeners = new Set<(message: ServerMessage) => void>();

  private statusListeners = new Set<(status: ConnectionStatus) => void>();

  connect(): void {
    this.shouldReconnect = true;
    this.open();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnect();
    this.socket?.close();
    this.socket = null;
  }

  onMessage(listener: (message: ServerMessage) => void): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onStatus(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  send(request: ClientRequest): void {
    const payload = JSON.stringify(request);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }
    this.queue.push(payload);
  }

  private open(): void {
    this.clearReconnect();
    this.emitStatus('connecting');
    const socket = new WebSocket(WS_URL);
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.socket !== socket) {
        return;
      }
      this.emitStatus('open');
      this.queue.splice(0).forEach((item) => socket.send(item));
    });

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(String(event.data)) as ServerMessage;
        this.messageListeners.forEach((listener) => listener(data));
      } catch {
        // ignore malformed frames
      }
    });

    socket.addEventListener('close', () => {
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      this.emitStatus('closed');
      this.scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      socket.close();
    });
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer !== null) {
      return;
    }
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, RECONNECT_DELAY);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emitStatus(status: ConnectionStatus): void {
    this.statusListeners.forEach((listener) => listener(status));
  }
}
