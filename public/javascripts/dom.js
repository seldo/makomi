console.log("I'm in the DOM pane");
var socket = io.connectWithSession('http://local.dev');
socket.on('sourcemap-ready',function(data) {
  console.log("Source maps delivered: ")
  console.log(data)
  ready()
})
socket.on('routechange-out',function(data) {
  console.log("DOM saw route change: " + data.route)
  location.href = '/' + data.project + '/output?route=' + data.route
})

socket.on('controller-ready',function(data) {
  console.log("Controller delivered")
  console.log(data.controller)
  ready()
})
var needed = 2;
var ready = function() {
  needed--
  if (needed == 0) {
    window.location
  }
}