var io = require('socket.io');

exports.start = function(socketServer) {
  socketServer.sockets.on('connection', function (socket) {
    socket.on('routechange-in', function (data) {
      console.log("Route selected: " + data.route);
      socketServer.sockets.emit('routechange-out', {
        route: data.route
      })
    });

    socket.on('disconnect', function () {
      socketServer.sockets.emit('user disconnected');
    });
  });
}