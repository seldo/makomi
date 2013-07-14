console.log("I'm in the DOM pane");
var socket = io.connectWithSession('http://local.dev');
socket.on('routechange-out',function(data) {
  console.log("DOM saw route change: " + data.route)
  location.href = '/' + data.project + '/context/dom?route=' + data.route
})
var selectedId = null
socket.on('element-selected-out',function(data) {
  var mkId = data['makomi-id']
  console.log("Element to select in DOM: " + mkId)
  unSelect(selectedId)
  select(mkId)
})

var lastBorder = null
var unSelect = function(mkId) {
  if (mkId) {
    var el = findByMkId(mkId);
    $(el).css('border',lastBorder)
  }
}
var select = function(mkId) {
  var el = findByMkId(mkId)
  var lastBorder = $(el).css('border')
  $(el).css('border','1px solid red')
}
var findByMkId = function(mkId) {
  return $("[makomi-id='" + mkId + "']")
}