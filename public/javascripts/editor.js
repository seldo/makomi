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
  $(e.target).css('border','1px solid blue');
  var outHandler = function(e2) {
    $(e.target).css('border',oldStyle)
    $(this).unbind(event)
  }
  $(e.target).bind('mouseout',outHandler)
})

// click to select an element.
var lastSelected = null
$('html').on('click',function(e) {
  e.preventDefault();
  var el = e.target
  // stop any in-progress changes on other elements
  if (el != lastSelected) {
    endInProgress();
  }
  // emit a message so the other panes know what we did
  socket.emit('element-selected-in',{
    "makomi-id": el.attributes['makomi-id'].value
  })
  console.log("Emitting " + el.attributes['makomi-id'].value)
  lastSelected = el
})

// tracker of currently ongoing events.
// tools add callbacks to this array that safely end they do.
var inProgress = []
// if we select an element, we cancel anything in-progress on other elements
var endInProgress = function() {
  var f = inProgress.pop()
  while(f) {
    f()
    f = inProgress.pop()
  }
}

// double-click to edit. Action taken depends on node type. Only not yet.
var editableElement = null
$('html').on('dblclick',function(e) {
  e.preventDefault(); // whatever that is
  var el = e.target;
  console.log("Editing " + el.tagName)
  // TODO: if the element doesn't have text, don't let us edit
  el.contentEditable = true;
  editableElement = el
  // how to end editing
  inProgress.push(function() {
    if (editableElement && editableElement.contentEditable) {
      editableElement.contentEditable = false
      // emit a message so the other panes know what we did
      // ATM we use the first child of the element, assumed to be a text node
      // that's probably not a very smart idea
      socket.emit('controller-action-in',{
        "controller": "editor",
        "action": "contentEdited",
        "makomi-id": editableElement.attributes['makomi-id'].value,
        "tagName": editableElement.tagName,
        "content": editableElement.childNodes[0].nodeValue
      })
      editableElement = null
    }
  })
})


// the escape key will also end anything in progress
$('html').keyup(function(e) {
  if (e.keyCode == 27) { // esc
    endInProgress();
  }
});