var $ = require('jquery-browserify'),
  shortid = require('short-id'),
  htmlparser = require('htmlparser');

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
    case "routeSelected":
      changeRoute(data)
      break;
    default:
      // nothing
  }

})

var changeRoute = function(data) {
  console.log("Saw a route change: " + data.route)
  location.href = '/' + data.project + '/output?route=' + data.route
}


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
 * Once selected, you can move or resize an element.
 * While in select mode, double-clicking a text element will allow you to
 * edit it.
 */
toolHandlers['select'] = function() {

  // cursor should be a pointer for most elements
  $('html').css('cursor','default')

  // highlight elements as we go over them
  var hoverHandler = function(e) {
    // ignore whatever else was gonna happen
    e.preventDefault();
    // capture the previous bg color and apply our own
    var oldBg = $(e.target).css('background-color');
    $(e.target).css('background-color','#eeffff');
    // when they mouse out again, restore the previous background color
    var outHandler = function(e2) {
      // remove the highlight
      $(e.target).css('background-color',oldBg)
      // and stop listening
      $(this).off(e2)
    }
    $(e.target).on('mouseout',outHandler)
  }
  $('html').on('mouseover',hoverHandler);

  // click to select an element.
  var lastSelected = null
  var oldBorder;
  var clickHandler = function(e) {
    e.preventDefault();
    var el = e.target
    // if it's already selected, don't do anything new
    if (el == lastSelected) {
      return; // already selected
    }
    // cancel anything in-progress on other elements
    endInProgress();
    // change border of selected element, and tell it how to revert later
    oldBorder = $(el).css('border');
    console.log("Captured border of " + oldBorder)
    $(el).css('border','1px solid #00f');
    inProgress.push(function() {
      console.log("Select is being cancelled, reverting to " + oldBorder)
      $(el).css('border',oldBorder)
    })

    // emit a message so the other panes know what we did
    socket.emit('controller-action-in',{
      "controller": "editor",
      "action": "elementSelected",
      "makomi-id": el.attributes['makomi-id'].value
    })
    console.log("Emitting editor/elementSelected for " + el.attributes['makomi-id'].value)
    console.log(el)
    lastSelected = el
  }
  $('html').on('click',clickHandler)

  // double-click to edit. Action taken depends on node type. Only not yet.
  var editableElement = null
  var dblClickHandler = function(e) {
    e.preventDefault();
    var el = e.target;
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
          "target-makomi-id": editableElement.attributes['makomi-id'].value,
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
  toolHandlers['tag']('h1')
}
toolHandlers['tag-div'] = function() {
  toolHandlers['tag']('div')
}
toolHandlers['tag-span'] = function() {
  toolHandlers['tag']('span')
}
// TODO: more refactoring
//
toolHandlers['tag'] = function(tag) {

  // cursor is crosshair
  $('html').css('cursor','crosshair')

  // lightly highlight potential insertion points as we hover
  var lastHovered = null
  var hoverHandler = function(e) {
    var el = e.target
    var lastBackground = $(el).css('background-color')
    $(el).css('background-color','#dee')
    lastHovered = el
    var outHandler = function(e2) {
      $(lastHovered).css('background-color',lastBackground)
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
  var selection = $('<'+tag+'>')
  selection.css('border','1px solid #00d6b2');
  var insertTarget = null;

  var mouseDownHandler = function(e) {

    // prevent other drag events, and stop highlighting stuff
    e.preventDefault();
    $('html').off('mouseover',hoverHandler);

    insertTarget = e.target;

    selection.css({
      'width':  0,
      'height': 0
    });
    selection.insertBefore(insertTarget);

    console.log("to be inserted before ")
    console.log(insertTarget)

    var selectionOffsets = $(selection).offset()
    console.log(selectionOffsets)
    var mouseMoveHandler = function(e) {
      var width = e.pageX - selectionOffsets.left,
        height = e.pageY - selectionOffsets.top;

      selection.css({
        'width': width,
        'height': height
      });

    }
    var mouseUpHandler = function(e) {
      console.log("select was " + selection.css('width') + " by " + selection.css('height'))
      var insertEl = $('<'+tag+'>')
      // give it a makomi-id
      insertEl.attr('makomi-id','c'+shortid.generate()) // prefix to avoid collisions between client and server
      // TODO: move these into a CSS file separate from the element
      insertEl.css('width',selection.css('width'))
      insertEl.css('height',selection.css('height'))
      insertEl.html('New Element')
      insertEl.insertBefore(insertTarget);
      // send it to the server to insert into the DOM
      serializeDom(insertEl,function(dom) {
        socket.emit('controller-action-in',{
          controller: 'editor',
          action: 'domModified',
          'target-makomi-id': $(insertTarget).attr('makomi-id'),
          'dom-action': 'insert-before',
          'content': dom
        })
      })
      endInProgress();
    }
    container.on('mousemove',mouseMoveHandler)
    container.on('mouseup', mouseUpHandler)

    inProgress.push(function() {
      console.log("Stopping drag")
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

jQuery.fn.outerHTML = function(s) {
  return (s)
    ? this.before(s).remove()
    : jQuery("<p>").append(this.eq(0).clone()).html();
}

var serializeDom = function(element,cb) {
  var handler = new htmlparser.DefaultHandler(function (error, dom) {
    cb(dom)
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete($(element).outerHTML());
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
    console.log("Keyup called from editor")
    endInProgress();
    applyToolHandlers('select')
  }
});

// select is the default tool
applyToolHandlers('select')