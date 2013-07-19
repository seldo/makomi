console.log("I'm in UR code, editing UR stuff");

// make socket connection
var socket = io.connectWithSession('http://local.dev');

// listen for generic socket events
socket.on('controller-action-out',function(data) {

  // we only listen for certain actions
  // TODO: generalize to allow loading functionality from plugins
  switch(data.action) {
    case "toolSelected":
      applyToolHandlers(data.toolName)
      break;
    default:
      // nothing
  }

})

var currentTool = null
var unbinders = []
var applyToolHandlers = function(toolName) {
  console.log("Tool selected: " + toolName)
  // is this a valid tool, and not the tool we're currently using?
  if (toolHandlers[toolName] && currentTool != toolName) {
    // call the un-binders for the previous tool
    var unbind;
    do {
      if (unbind) unbind()
    } while(unbind = unbinders.pop())
    // add the new handlers
    toolHandlers[toolName]()
    currentTool = toolName
  } else {
    console.log("No handler exists for " + toolName)
  }
}

/**
 * Tool handlers are a set of event handlers that get applied when
 * that tool is selected, and un-bound when something else is selected
 */
var toolHandlers = {}

/**
 * Selects an element (reflected in the structure pane) for further changes.
 * While in select mode, double-clicking a text element will allow you to
 * edit it.
 */
toolHandlers['select'] = function() {

  // cursor should be default
  $('html').css('cursor','auto')

  // highlight elements as we go over them
  var hoverHandler = function(e) {
    // ignore whatever else was gonna happen
    e.preventDefault();
    // capture the previous border state and apply our own
    var oldStyle = $(e.target).css('border');
    $(e.target).css('border','1px solid blue');
    // when they mouse out again, restore the previous border
    var outHandler = function(e2) {
      $(e.target).css('border',oldStyle)
      // and stop listening
      $(this).off(e2)
    }
    $(e.target).on('mouseout',outHandler)
  }
  $('html').on('mouseover',hoverHandler);

  // click to select an element.
  var lastSelected = null
  var clickHandler = function(e) {
    e.preventDefault();
    var el = e.target
    // if we select an element, we cancel anything in-progress on other elements
    if (el != lastSelected) {
      endInProgress();
    }
    // emit a message so the other panes know what we did
    socket.emit('element-selected-in',{
      "makomi-id": el.attributes['makomi-id'].value
    })
    console.log("Emitting element-selected for " + el.attributes['makomi-id'].value)
    lastSelected = el
  }
  $('html').on('click',clickHandler)

  // double-click to edit. Action taken depends on node type. Only not yet.
  var editableElement = null
  var dblClickHandler = function(e) {
    e.preventDefault(); // whatever that is
    var el = e.target;
    if (el != lastSelected) {
      endInProgress();
    }
    // TODO: if the element doesn't have text, don't let us edit
    el.contentEditable = true;
    editableElement = el

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
  }
  $('html').on('dblclick',dblClickHandler)

  // when a new tool is selected, also end anything in progress
  unbinders.push(function() {
    $('html').off('mouseover',hoverHandler)
    $('html').off('click',clickHandler)
    $('html').off('dblclick',dblClickHandler)
    endInProgress();
  })
}

/**
 * Inserts an H1 tag of the requested size at the specified insertion point.
 */
toolHandlers['tag-h1'] = function() {

  // cursor is crosshair
  $('html').css('cursor','crosshair')

  // lightly highlight potential insertion points as we hover
  var lastHovered = null
  var hoverHandler = function(e) {
    var el = e.target
    var lastBorder = $(el).css('border')
    $(el).css('border','1px solid #ccc')
    lastHovered = el
    var outHandler = function(e2) {
      $(lastHovered).css('border',lastBorder)
      $(this).off(e2)
    }
    $(el).on('mouseout',outHandler)
  }
  $('html').on('mouseover',hoverHandler)
  unbinders.push(function() {
    $('html').off('mouseover',hoverHandler)
  })

  // credit to http://stackoverflow.com/questions/8884803/jquery-drag-and-draw
  var container = $('html');
  var selection = $('<div>')
  selection.css('border','1px solid #00d6b2');
  selection.css('position','absolute')
  var insertTarget = null;

  var mouseDownHandler = function(e) {

    // prevent other drag events, and stop highlighting stuff
    e.preventDefault();
    $('html').off('mouseover',hoverHandler);

    insertTarget = e.target;

    var click_y = e.pageY;
    var click_x = e.pageX;

    selection.css({
      'top':    click_y,
      'left':   click_x,
      'width':  0,
      'height': 0
    });
    selection.appendTo(container);

    var mouseMoveHandler = function(e) {
      var move_x = e.pageX,
        move_y = e.pageY,
        width  = Math.abs(move_x - click_x),
        height = Math.abs(move_y - click_y),
        new_x, new_y;

      new_x = (move_x < click_x) ? (click_x - width) : click_x;
      new_y = (move_y < click_y) ? (click_y - height) : click_y;

      selection.css({
        'width': width,
        'height': height,
        'top': new_y,
        'left': new_x
      });

    }
    var mouseUpHandler = function(e) {
      console.log("select was " + selection.css('width') + " by " + selection.css('height'))
      console.log("to be inserted into ")
      console.log(insertTarget)
      endInProgress();
    }
    container.on('mousemove',mouseMoveHandler)
    container.on('mouseup', mouseUpHandler)

    inProgress.push(function() {
      // stop listening to mousemove, resume highlighting
      container.off('mousemove',mouseMoveHandler);
      container.off('mouseup',mouseUpHandler);
      $('html').on('mouseover',hoverHandler);
      selection.remove();
    })

  }
  $('html').on('mousedown',mouseDownHandler)

  unbinders.push(function() {
    $('html').off('mouseover',hoverHandler)
    $('html').off('mousedown',mouseDownHandler)
  })

}

// tracker of currently ongoing events.
// tools add callbacks to this array that safely end whatever they're doing.
var inProgress = []
var endInProgress = function() {
  var f = inProgress.pop()
  while(f) {
    f()
    f = inProgress.pop()
  }
}

// the escape key will end the current tool and switch back to select
// if you're in select already, it will also end any editing event
$('html').keyup(function(e) {
  if (e.keyCode == 27) { // esc
    endInProgress();
    applyToolHandlers('select')
  }
});

// old style: when user selects a new route, render that route
// FIXME: refactor into general method
socket.on('routechange-out',function(data) {
  console.log("Saw a route change: " + data.route)
  location.href = '/' + data.project + '/output?route=' + data.route
})

// select is the default tool
applyToolHandlers('select')