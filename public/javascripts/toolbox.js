// connect websockets. We'll be doing a lot of broadcasting.
var socket = io.connectWithSession('http://local.dev');

// select tool
$('ul.toolbar li').on('click',function(e) {
  var toolName = e.target.attributes['data-tool'].value
  selectTool(toolName)
})
var selectedTool = null
var lastBorder = null;
/**
 * Select, as in pick, a tool. Which can be the "select" tool.
 * Oh, that's confusing.
 * @param toolName
 */
var selectTool = function(toolName) {
  if (selectedTool) {
    $('#tool-'+selectedTool).css('border',lastBorder)
  }
  var btn = document.getElementById('tool-'+toolName);
  var plugin = btn.attributes['data-plugin'].value
  lastBorder = $(btn).css('border')
  $(btn).css('border','1px solid blue')
  selectedTool = toolName
  socket.emit('controller-action-in',{
    "controller": "editor",
    "action": "toolSelected",
    "toolName": toolName,
    "toolPlugin": plugin
  })
}

// start with select tool
selectTool('select');

// the escape key will end the current tool and switch back to select
$('html').keyup(function(e) {
  if (e.keyCode == 27) { // esc
    selectTool('select')
  }
});