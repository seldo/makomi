var $ = require('jquery-browserify');
  // io = require('socket.io-client') // not until we fix sessions

/**
 * Connect websockets and listen for events
 * @type {*}
 */
io.connectWithSession = function(){
  var socket = io.connect.apply(io, arguments);
  socket.on('connect', function(){
    this.emit('connect_with_session', {__sid:CONNECT_SID});
  });
  return socket;
};

var socket = io.connectWithSession('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("DOM saw route change: " + data.route)
  location.href = '/' + data.project + '/context/dom?route=' + data.route
})

/**
 * Reflect changes to editor in our view
 */

var selectedId = null
var lastBorder = null
// when a new element is selected, unselect the previous one and select a new one
socket.on('element-selected-out',function(data) {
  var mkId = data['makomi-id']
  console.log("Element to select in DOM: " + mkId)
  unSelect(selectedId)
  select(mkId)
})

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