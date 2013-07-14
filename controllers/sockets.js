exports.start = function(socketServer) {
  socketServer.on('sconnection', function (client,session) {

    client.on('element-selected-in', function(data) {
      // echo
      console.log("received")
      console.log("element selected: " + data['makomi-id'])
      socketServer.sockets.emit('element-selected-out',data)
    });

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