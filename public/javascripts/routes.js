var socket = io.connectWithSession('http://local.dev');
$('#routes a').click(function(e) {
  e.preventDefault();
  socket.emit('routechange-in',
    { route: e.target.attributes['data-route'].value });
})
