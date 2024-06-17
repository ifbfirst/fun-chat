export interface Users {
  id: string;
  type: string;
  payload: {
    users: [];
  };
}

export interface User {
  id: string;
  type: string;
  payload: {
    user: {
      login: string;
      password: string;
    };
  };
}

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: {
    isDelivered: boolean;
    isReaded: boolean;
    isEdited: boolean;
  };
}

export interface Dialog {
  id: string;
  type: string;
  payload: {
    messages: [];
  };
}

export interface CommonInterface {
  id: string;
  type: string;
  payload: {
    error: string;
  };
}
