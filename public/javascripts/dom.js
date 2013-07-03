console.log("I'm in the DOM pane");
var socket = io.connectWithSession('http://local.dev');
/*
socket.on('connect',function() {
  console.log("Requested sourcemap")
  socket.emit('sourcemap-requested',{
    "no": "real data"
  })
});
*/
socket.on('sourcemap-ready',function(data) {
  console.log("Sourcemap delivered: ")
  console.log(data.sourceMap)
})
