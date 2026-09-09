const ERROR_TEXT: Record<string, string> = {
  'a user with this login is already authorized':
    'Пользователь с таким логином уже в сети',
  'incorrect password': 'Неверный пароль',
  'another user is already authorized in this connection':
    'В этом соединении уже есть авторизованный пользователь',
  'there is no user with this login': 'Пользователя с таким логином нет',
  'the user was not authorized': 'Пользователь не авторизован',
  'sender and recipient logins are the same':
    'Нельзя написать самому себе',
  'the user with the specified login does not exist':
    'Получатель не найден',
  'user not registered or not logged': 'Нужно войти в аккаунт',
  'incorrect message id': 'Сообщение не найдено',
  'user not recipient cannot be executed':
    'Статус прочтения может менять только получатель',
};

export function translateError(code: string): string {
  return ERROR_TEXT[code] ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.';
}
