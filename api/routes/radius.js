"use strict";

module.exports = (app) => {
  const radius = require("../controllers/radius");

  app
    .route("/check")
    .get(radius.check);

  app
    .route("/auth")
    .get(radius.auth);

  app
    .route("/accounting")
    .post(radius.accounting);

  app
    .route("/users")
    .get(radius.list_all_users)
    .post(radius.create_user);

  app
    .route("/users/:userID")
    .put(radius.update_user)
    .delete(radius.remove_user);

  app
    .route("/profiles")
    .get(radius.list_all_profiles)
    .post(radius.create_profile);

  app
    .route("/profiles/:profileID")
    .put(radius.update_profile)
    .delete(radius.remove_profile);

  // Динамическое получение всех маршрутов
  app
    .route("/api")
    .get((req, res) => {
      const routes = [];
      
      app._router.stack.forEach(middleware => {
        if (middleware.route) {
          // Маршруты без параметров
          const path = middleware.route.path;
          const methods = Object.keys(middleware.route.methods);
          
          routes.push({
            path: path,
            methods: methods.map(m => m.toUpperCase()),
            description: getRouteDescription(path)
          });
        } else if (middleware.name === 'router') {
          // Маршруты с параметрами
          middleware.handle.stack.forEach(handler => {
            if (handler.route) {
              const path = handler.route.path;
              const methods = Object.keys(handler.route.methods);
              
              routes.push({
                path: path,
                methods: methods.map(m => m.toUpperCase()),
                description: getRouteDescription(path)
              });
            }
          });
        }
      });

      res.json({
        message: "FreeRADIUS REST API",
        version: "1.0.0",
        endpoints: routes
      });
    });
};

// Функция для получения описания маршрута
function getRouteDescription(path) {
  const descriptions = {
    '/check/:login': 'Проверка существования пользователя',
    '/auth/:login/:password': 'Аутентификация пользователя',
    '/accounting/:login': 'Учет использования сервиса',
    '/users': 'Управление пользователями (получение списка/создание)',
    '/users/:userID': 'Управление конкретным пользователем (обновление/удаление)',
    '/profiles': 'Управление профилями (получение списка/создание)',
    '/profiles/:profileID': 'Управление конкретным профилем (обновление/удаление)',
    '/api': 'Получение списка всех доступных маршрутов API'
  };
  
  return descriptions[path] || 'Нет описания';
}
