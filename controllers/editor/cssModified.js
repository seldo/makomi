var mkSrc = require('makomi-source-util'),
  util = require('util'),
  core = require('../../core.js')

/**
 * CSS properties for an element have changed. Modify the master stylesheet.
 * @param data
 */
module.exports = function(session,data) {
  /*
  var mkId = data['target-makomi-id'];
  var newContent = data['content']
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);
  var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)

  console.log("Editing element " + mkId + " which is a " + data.tagName)

  mkSrc.setTextContent(domTree,mkId,newContent,function(newDom) {
    var domCopy = core.deepClone(newDom) // otherwise it strips stuff!
    mkSrc.writeStrippedHtml(writePath,domCopy,function(html) {
      sourceDirty = true  // set flag
      console.log("Updated source in " + writePath + ": " + html)
      // update internal representation
      core.updateView(mkId,newDom,function() {
        // anything?
      });
    })
  })
  */
}