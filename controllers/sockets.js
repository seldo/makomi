exports.start = function(socketServer) {
  socketServer.on('sconnection', function (client,session) {

    client.on('routechange-in', function (data) {
      console.log("Route selected: " + data.route);
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