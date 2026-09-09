import { ClientRequest, requestId } from './protocol';
import { SocketClient } from './socket';

export class ChatApi {
  constructor(private readonly socket: SocketClient) {}

  login(login: string, password: string): void {
    this.send({
      id: requestId(),
      type: 'USER_LOGIN',
      payload: { user: { login, password } },
    });
  }

  logout(login: string, password: string): void {
    this.send({
      id: requestId(),
      type: 'USER_LOGOUT',
      payload: { user: { login, password } },
    });
  }

  fetchUsers(): void {
    this.send({ id: requestId(), type: 'USER_ACTIVE', payload: null });
    this.send({ id: requestId(), type: 'USER_INACTIVE', payload: null });
  }

  fetchDialog(login: string): void {
    this.send({
      id: requestId(),
      type: 'MSG_FROM_USER',
      payload: { user: { login } },
    });
  }

  sendMessage(to: string, text: string): void {
    this.send({
      id: requestId(),
      type: 'MSG_SEND',
      payload: { message: { to, text } },
    });
  }

  markRead(id: string): void {
    this.send({
      id: requestId(),
      type: 'MSG_READ',
      payload: { message: { id } },
    });
  }

  deleteMessage(id: string): void {
    this.send({
      id: requestId(),
      type: 'MSG_DELETE',
      payload: { message: { id } },
    });
  }

  editMessage(id: string, text: string): void {
    this.send({
      id: requestId(),
      type: 'MSG_EDIT',
      payload: { message: { id, text } },
    });
  }

  private send(request: ClientRequest): void {
    this.socket.send(request);
  }
}
