console.log("I'm in UR code, editing UR stuff");
var socket = io.connect('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("Saw a route change: " + data.route)
  location.href = "/hello-2/output?route=" + data.route
})