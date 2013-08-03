var mkSrc = require('makomi-source-util'),
  util = require('util'),
  core = require('../../core.js')

/**
 * CSS properties for an element have changed. Modify the master stylesheet.
 * @param data
 */
module.exports = function(session,data) {
  var cssPath = session['sourceDir'] + 'public/stylesheets/layout.css'
  var id = data['target-dom-id'];
  var properties = data['properties']
  mkSrc.css.parse(cssPath,function(css) {
    console.log("Updating rule for " + id + " with properties ")
    console.log(properties)
    var newCss = mkSrc.css.insertOrModifyId(css,id,properties)
    mkSrc.css.write(cssPath,newCss,function(rawCss) {
      console.log("Updated CSS file successfully")
      console.log(rawCss)
      core.updateCss(newCss,function() {
        // eh?
      })
    })
  })
}