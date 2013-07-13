console.log("I'm in the DOM pane");
var socket = io.connectWithSession('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("DOM saw route change: " + data.route)
  location.href = '/' + data.project + '/context/dom?route=' + data.route
})