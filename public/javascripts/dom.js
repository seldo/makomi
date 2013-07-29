var $ = require('jquery-browserify');
  // io = require('socket.io-client') // not until we fix sessions
var handlers = {}

var socket = io.connectWithSession('http://local.dev');
socket.on('controller-action-out',function(data) {
  var controller = data.controller
  var action = data.action
  if (handlers[controller] && handlers[controller][action]) {
    handlers[controller][action](data)
  }
})

/**
 * If they look at a different route, change with them
 * @param data
 */
handlers['editor'] = {}
handlers['editor']['routeSelected'] = function(data) {
  console.log("DOM saw route change: " + data.route)
  location.href = '/' + data.project + '/context/dom?route=' + data.route
}
handlers['dom'] = {}
handlers['dom']['treeModified'] = function(data) {
  console.log("Refresh tree?")
  location.reload()
}

/**
 * Reflect changes to editor in our view
 */

// when a new element is selected, unselect the previous one and select a new one
var selectedId = null
var lastBorder = null
handlers['editor']['elementSelected'] = function(data) {
  var mkId = data['makomi-id']
  console.log("Element to select in DOM: " + mkId)
  unSelect(selectedId)
  select(mkId)
}

var unSelect = function(mkId) {
  if (mkId) {
    var el = findByMkId(mkId);
    $(el).css('border',lastBorder)
  }
}
var select = function(mkId) {
  var el = findByMkId(mkId)
  lastBorder = $(el).css('border')
  $(el).css('border','1px solid blue')
  selectedId = mkId
}
var findByMkId = function(mkId) {
  return $("[makomi-id='" + mkId + "']")
}

// when the dom is modified, represent those changes in our tree
handlers['editor']['domModifiedComplete'] = function(data) {
  console.log("Server modified DOM; it looks different now:")
}