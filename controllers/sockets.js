exports.start = function(socketServer) {
  socketServer.on('sconnection', function (client,session) {

    // route all controller-action events as if they happened to a real controller
    client.on('controller-action-in', function(data) {
      socketServer.sockets.emit('controller-action-out',data)
      var controllerName = data.controller
      var action = data.action
      var controller = require('./'+controllerName+'/'+action)
      controller(session,data)
    });

    client.on('element-selected-in', function(data) {
      socketServer.sockets.emit('element-selected-out',data)
    });

    client.on('routechange-in', function (data) {
      socketServer.sockets.emit('routechange-out', {
        route: data.route,
        project: session['project']
      })
    });

    client.on('disconnect', function () {
      socketServer.sockets.emit('user disconnected');
    });
  });
}