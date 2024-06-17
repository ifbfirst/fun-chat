import { startWebSocket, userAuthorization } from './component/api';
import { formAuthorizationHandler } from './component/form-handlers';
import { LoginForm } from './pages/login';

import { createTag } from './component/tag-creator';
import { getInfo } from './component/statement-client';

export class App {
  public start(): void {
    startWebSocket();
    if (sessionStorage.getItem('login-fun-chat')) {
      setTimeout(
        () =>
          userAuthorization(
            sessionStorage.getItem('login-fun-chat') as string,
            sessionStorage.getItem('password') as string,
          ),
        100,
      );

      return;
    }
    new LoginForm();
    const btnInfo = createTag(
      'button',
      document.body,
      'Информация',
      'btn-info',
    );
    btnInfo.onclick = () => getInfo();
    formAuthorizationHandler();
  }
}

export default App;
