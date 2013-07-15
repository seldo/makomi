/**
 * Tab switcher
 */
var oldTabName = 'structure'
$('#context-tabs').on('click',function(e) {
  var newTabName = e.target.getAttribute('data-tab')
  console.log(newTabName)
  $('#tab-'+oldTabName).removeClass('selected')
  $('#tab-'+newTabName).addClass('selected')
  $('#frame-'+oldTabName).css('visibility','hidden')
  $('#frame-'+newTabName).css('visibility','visible')
  oldTabName = newTabName
})