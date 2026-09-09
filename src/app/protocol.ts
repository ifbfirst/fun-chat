export type ConnectionStatus = 'connecting' | 'open' | 'closed';

export type MessageStatus = {
  isDelivered: boolean;
  isReaded: boolean;
  isEdited: boolean;
};

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: MessageStatus;
};

export type UserInfo = {
  login: string;
  isLogined: boolean;
};

export type ClientRequest =
  | {
      id: string;
      type: 'USER_LOGIN' | 'USER_LOGOUT';
      payload: { user: { login: string; password: string } };
    }
  | {
      id: string;
      type: 'USER_ACTIVE' | 'USER_INACTIVE';
      payload: null;
    }
  | {
      id: string;
      type: 'MSG_FROM_USER';
      payload: { user: { login: string } };
    }
  | {
      id: string;
      type: 'MSG_SEND';
      payload: { message: { to: string; text: string } };
    }
  | {
      id: string;
      type: 'MSG_READ' | 'MSG_DELETE';
      payload: { message: { id: string } };
    }
  | {
      id: string;
      type: 'MSG_EDIT';
      payload: { message: { id: string; text: string } };
    };

export type ServerMessage =
  | { id: string | null; type: 'ERROR'; payload: { error: string } }
  | { id: string | null; type: 'USER_LOGIN'; payload: { user: UserInfo } }
  | { id: string | null; type: 'USER_LOGOUT'; payload: { user: UserInfo } }
  | { id: string | null; type: 'USER_ACTIVE'; payload: { users: UserInfo[] } }
  | { id: string | null; type: 'USER_INACTIVE'; payload: { users: UserInfo[] } }
  | { id: string | null; type: 'USER_EXTERNAL_LOGIN'; payload: { user: UserInfo } }
  | { id: string | null; type: 'USER_EXTERNAL_LOGOUT'; payload: { user: UserInfo } }
  | { id: string | null; type: 'MSG_FROM_USER'; payload: { messages: ChatMessage[] } }
  | { id: string | null; type: 'MSG_SEND'; payload: { message: ChatMessage } }
  | {
      id: string | null;
      type: 'MSG_DELIVER';
      payload: { message: { id: string; status: { isDelivered: boolean } } };
    }
  | {
      id: string | null;
      type: 'MSG_READ';
      payload: { message: { id: string; status: { isReaded: boolean } } };
    }
  | {
      id: string | null;
      type: 'MSG_DELETE';
      payload: { message: { id: string; status?: { isDeleted: boolean } } };
    }
  | {
      id: string | null;
      type: 'MSG_EDIT';
      payload: {
        message: { id: string; text?: string; status?: { isEdited: boolean } };
      };
    };

export function requestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isCurrentDialog(
  message: ChatMessage,
  me: string,
  selected: string,
): boolean {
  return (
    (message.from === me && message.to === selected) ||
    (message.from === selected && message.to === me)
  );
}
