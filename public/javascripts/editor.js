console.log("I'm in UR code, editing UR stuff");
var socket = io.connectWithSession('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("Saw a route change: " + data.route)
  location.href = '/' + data.project + '/output?route=' + data.route
})
