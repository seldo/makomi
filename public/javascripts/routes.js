var socket = io.connectWithSession('http://local.dev');
$('#routes a').click(function(e) {
  e.preventDefault();
  socket.emit('controller-action-in',{
    "controller": "editor",
    "action": "routeSelected",
    "route": e.target.attributes['data-route'].value
  })
})
