console.log("I'm in UR code, editing UR stuff");

// when user selects a new route, render that route
var socket = io.connectWithSession('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("Saw a route change: " + data.route)
  location.href = '/' + data.project + '/output?route=' + data.route
})

// highlight elements as we go over them
$('html').on('mouseover',function(e) {
  e.preventDefault();
  var oldStyle = $(e.target).css('border');
  $(e.target).css('border','1px solid red');
  var outHandler = function(e2) {
    $(e.target).css('border',oldStyle)
    $(this).unbind(event)
  }
  $(e.target).bind('mouseout',outHandler)
})

// emit a message when we click an element
$('html').on('click',function(e) {
  e.preventDefault();
  socket.emit('element-selected-in',{
    "makomi-id": e.target.attributes['makomi-id'].value
  })
  console.log("Emitting " + e.target.attributes['makomi-id'].value)
})
