var $ = require('jquery-browserify'),
  shortid = require('short-id'),
  htmlparser = require('htmlparser'),
  _ = require('underscore');

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

/**
 * Inprogress is a set of commands to release any listeners created within
 * the course of using a tool. It is called when a tool switches focus.
 */
var inProgress = []
var endInProgress = function() {
  console.log("ending in-progress")
  var f = inProgress.pop()
  while(f) {
    f()
    f = inProgress.pop()
  }
}

/**
 * Unbinders are a set of commands to release any listeners activated by
 * the previous tool. They are called when switching tools. endInProgress is
 * also called to end anything the tool was doing at the time of switch.
 */
var unbinders = []
var currentTool = null
var applyToolHandlers = function(toolName) {
  console.log("Tool selected: " + toolName)
  endInProgress();
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
  var oldBg;
  var hoverHandler = function(e) {
    // ignore whatever else was gonna happen
    e.preventDefault();
    // capture the previous bg color and apply our own
    oldBg = $(e.target).css('background-color');
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

  // change the cursor as we hover over this element
  var moveMode = false;
  var moveModeLock = false
  var selectedMouseMoveHandler = function(e) {
    var el = e.data.el
    var boundaryWidth = 10
    var elHeight = parseInt($(el).css('height'))
    var elWidth = parseInt($(el).css('width'))
    var offsets = $(el).offset()
    var pointerX = e.pageX - offsets['left'];
    var pointerY = e.pageY - offsets['top'];

    if (moveModeLock) {
      switch(moveMode) {
        case "ew-right":
          $(el).css('width',pointerX)
          break;
        case "ns-bottom":
          $(el).css('height',pointerY)
          break;
        case "bottom-right-resize":
          $(el).css('width',pointerX)
          $(el).css('height',pointerY)
          break;
        case "move":
          break;
        default:
          console.log("Move mode: " + moveMode);
      }
    } else {
      if(elWidth - pointerX < boundaryWidth && elHeight - pointerY < boundaryWidth) {
        moveMode = "bottom-right-resize"
        $(el).css('cursor','nwse-resize')
      } else if(elWidth - pointerX < boundaryWidth) {
        moveMode = "ew-right"
        $(el).css('cursor','ew-resize')
      // FIXME: need to distinguish flow direction for left-right resizes
      //} else if (pointerX < boundaryWidth) {
      //  moveMode = "ew-left"
      //  $(el).css('cursor','ew-resize')
      } else if (elHeight - pointerY < boundaryWidth) {
        moveMode = "ns-bottom"
        $(el).css('cursor','ns-resize')
      // FIXME: almost never makes sense to resize from top
      //} else if (pointerY < boundaryWidth) {
      //  moveMode = "ns-top"
      //  $(el).css('cursor','ns-resize')
      } else {
        moveMode = "move"
        $(el).css('cursor','move')
      }
    }

    if (moveMode != "move") {
      e.preventDefault()
    }

  }

  // while selected, dragging the element around shows where a move op would go
  var selectedDragStartHandler = function(e) {
    var el = e.data.el
    console.log("jQuery knows about dragstart")
    // TODO: complete
  }

  var selectedDragHandler = function(e) {
    // target is the original copy of the thing I'm dragging around
    //$(e.target).css('border','1px solid yellow')
  }

  var insertProxy = $('<div>');
  insertProxy.css('width','100px')
  insertProxy.css('height','4px')
  insertProxy.css('border-radius','4px')
  insertProxy.css('background-color','#9f9')
  insertProxy.css('position','absolute')
  var selectedDragEnterHandler = function(e) {
    // target is the thing I have dragged over
    var el = e.target
    $(insertProxy).insertBefore(el);
  }

  var selectedDragLeaveHandler = function(e) {
    // target is the thing I just dragged out of
  }


  var selectedDragOverHandler = function(e) {
    // target is the thing I am currently over
    // if you stop handling this, drop and end events stop working(?)
    e.preventDefault()
    e.stopPropagation()
  }

  var selectedDropHandler = function(e) {
    // target is the thing I have dropped on
    var el = e.data.el
    e.stopPropagation()
    $(insertProxy).detach()
    $(el).insertBefore(e.target)

    endInProgress();
    $(el).removeAttr('contentEditable')
    $(el).removeAttr('draggable')
    $(el).css('border','')
    $(el).css('background-color','')
    $(el).css('cursor','')

    // emit a message so the other app knows what we did
    serializeDom(el,function(dom) {
      socket.emit('controller-action-in',{
        "controller": "editor",
        "action": "domModified",
        "dom-action": "move",
        "target-makomi-id": $(el).attr('makomi-id'),
        "destination-makomi-id": $(e.target).attr('makomi-id'),
        "content": dom
      })
    })

  }

  var selectedDragEndHandler = function(e) {
    // target is the thing I dropped
    // if you don't stop these all sorts of random browser shit happens
    e.preventDefault()
    e.stopPropagation()
  }

  // start a resize/move operation
  var selectedMouseDownHandler = function(e) {
    if (moveMode != "move") {
      e.preventDefault()
    }
    var el = e.data.el
    // obey this movement mode until we complete it
    moveModeLock = true

    // moving is fucking complicated and involves a shit-ton of handlers
    if (moveMode == 'move') {
      el.draggable = true
      $(el).on('dragstart',{"el": el},selectedDragStartHandler)
      $(el).on('drag',{"el": el},selectedDragHandler)
      $('html').on('dragenter',{"el": el},selectedDragEnterHandler)
      $('html').on('dragleave',{"el": el},selectedDragLeaveHandler)
      $('html').on('dragover',{"el": el},selectedDragOverHandler)
      $('html').on('drop',{"el": el},selectedDropHandler)
      $('html').on('dragend',{"el": el},selectedDragEndHandler)
    }
  }

  // end a resize/move op
  var selectedMouseUpHandler = function(e) {
    var el = e.data.el
    if (moveMode != "move") {
      e.preventDefault()
    }
    console.log("Mouseup detected")
    moveModeLock = false
    $('html').css('cursor','default')

    var resizeModes = ["bottom-right-resize","ns-bottom","ew-right"]
    if (_.contains(resizeModes,moveMode)) {
      // give it an ID if it doesn't already have one
      if (!$(el).attr('id')) {
        $(el).attr('id','auto-' + shortid.generate())
      }

      // clear things we don't want anymore
      endInProgress();
      $(el).removeAttr('contentEditable')
      $(el).removeAttr('draggable')
      $(el).css('border','')
      $(el).css('background-color','')
      $(el).css('cursor','')

      // extract height/width from the tag; leave it there so it still works
      var newHeight = $(el).css('height');
      var newWidth = $(el).css('width');
      serializeDom(el,function(dom) {

        console.log("Serialized element: ")
        console.log(dom)

        socket.emit('controller-action-in',{
          "controller": "editor",
          "action": "domModified",
          "target-makomi-id": $(el).attr('makomi-id'),
          "dom-action": "replace",
          "content": dom
        })
        socket.emit('controller-action-in',{
          "controller": "editor",
          "action": "cssModified",
          "target-dom-id": $(el).attr('id'),
          "properties": {
            "height": newHeight + 'px',
            "width": newWidth + 'px'
          }
        })
      })
    }
  }

  // bind the delete key to removing elements
  var selectedDeleteHandler = function(e) {
    var el = e.data.el
    if (e.keyCode == 46) { // delete
      // delete the element!
      var deletedId = $(el).attr('makomi-id')
      $(el).remove()
      console.log("Element to delete: " + deletedId)

      // un-select everything, cause it doesn't exist
      endInProgress();

      // emit a message so the other panes know what we did
      socket.emit('controller-action-in',{
        "controller": "editor",
        "action": "elementDeleted",
        "target-makomi-id": deletedId
      })
    }
  }

  // while selected, the element should remove the listeners it applies on hover
  var selectedOutHandler = function(e) {
    var el = e.data.el
    $(el).css('cursor','')
  }

  // click to select an element.
  var clickHandler = function(e) {
    e.preventDefault();
    var el = e.target
    var oldBorder;
    var lastSelected = null

    // if it's already selected, don't do anything new
    if (el == lastSelected) {
      return;
    }
    // cancel anything in-progress on other elements
    endInProgress();

    // change border of selected element, and tell it how to revert later
    oldBorder = $(el).css('border');
    $(el).css('border','1px solid #00f');

    // listen for the delete key
    $('html').on('keyup',{"el": el},selectedDeleteHandler)

    // once selected, the element has additional hover functions that show
    // the user how they can move and resize the element
    $('html').on('mousemove',{"el": el},selectedMouseMoveHandler)
    $(el).on('mouseout',{"el": el},selectedOutHandler)
    $(el).on('mousedown',{"el": el},selectedMouseDownHandler);
    $('html').on('mouseup',{"el": el},selectedMouseUpHandler);
    // we're already over the element, so trigger the move handler
    e.data={}; e.data.el = el
    selectedMouseMoveHandler(e)


    // emit a message so the other panes know what we did
    socket.emit('controller-action-in',{
      "controller": "editor",
      "action": "elementSelected",
      "makomi-id": el.attributes['makomi-id'].value
    })

    // mark this as the selected element
    lastSelected = el

    // explain how to undo all of this stuff
    inProgress.push(function() {
      $(el).css('border',oldBorder)
      $(el).css('background-color',oldBg)
      $('html').off('keyup',selectedDeleteHandler)
      $('html').off('mousemove',selectedMouseMoveHandler)
      $(el).off('dragstart',selectedDragStartHandler)
      $(el).off('drag',selectedDragHandler)
      $('html').off('dragover',selectedDragOverHandler)
      $('html').off('dragenter',selectedDragEnterHandler)
      $('html').off('dragleave',selectedDragEnterHandler)
      $('html').off('drop',selectedDropHandler)
      $('html').off('dragend',selectedDragEndHandler)
      $(el).off('mouseout',selectedOutHandler)
      $(el).off('mousedown',selectedMouseDownHandler);
      $('html').off('mouseup',selectedMouseUpHandler);
      el.draggable = false
      selectedOutHandler({data:{el:el}})
      lastSelected = null
    })

  }
  $('html').on('click',clickHandler)

  // double-click to edit. Action taken depends on node type. Only not yet.
  var editableElement = null
  var dblClickHandler = function(e) {
    e.preventDefault();
    var el = e.target;

    // intercept single-clicks to prevent re-selection
    var editClickHandler = function(e) {
      e.stopPropagation();
      console.log("Click received during edit mode")
    }
    $(el).on('click',editClickHandler)

    // turn off the other handlers that usually apply to this element
    $('html').off('keyup',selectedDeleteHandler)
    $(el).off('mousemove',selectedMouseMoveHandler)
    $(el).off('dragstart',selectedDragHandler)

    // cursor to text editor
    $(el).css('cursor','text')

    // now set the element to be editable
    // TODO: if the element doesn't have text, don't let us edit
    el.draggable = false // this confuses shit mightily
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
      $(el).off('click',editClickHandler)
      $(el).css('cursor','')
    })
  }
  $('html').on('dblclick',dblClickHandler)

  // when a new tool is selected, also end anything in progress
  unbinders.push(function() {
    $('html').off('mouseover',hoverHandler)
    $('html').off('click',clickHandler)
    $('html').off('dblclick',dblClickHandler)
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