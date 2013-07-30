var mkSrc = require('makomi-source-util'),
  util = require('util'),
  core = require('../../core.js')

/**
 * An element has been deleted. Find and remove the element from the
 * dom tree, and update relevant views.
 * @param data
 */
module.exports = function(session,data) {
  var mkId = data['target-makomi-id'];
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);
  var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)

  console.log("Removing element " + mkId + " which is a " + data.tagName)

  mkSrc.remove(domTree,mkId,function(newDom) {
    var domCopy = core.deepClone(newDom) // otherwise it strips stuff!
    mkSrc.writeStrippedHtml(writePath,domCopy,function(html) {
      sourceDirty = true  // set flag
      console.log("Updated source in " + writePath + ": " + html)
      // update internal representation
      core.updateView(mkId,newDom,function() {
        // tell the DOM view to update itself
        socketServer.sockets.emit('controller-action-out',{
          controller: "dom",
          action: "treeModified"
        })
      });
    })
  })
}