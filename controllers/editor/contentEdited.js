var mkSrc = require('makomi-source-util'),
  util = require('util'),
  core = require('../../core.js')

/**
 * An element has been edited. Find the element in the source, set
 * its content to the new value, and save that back to the source.
 * @param data
 */
module.exports = function(session,data) {
  var mkId = data['target-makomi-id'];
  var newContent = data['content']
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);
  var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)

  console.log("Editing element " + mkId + " which is a " + data.tagName)

  mkSrc.setTextContent(domTree,mkId,newContent,function(newDom) {
    mkSrc.writeStrippedHtml(writePath,newDom,function(html) {
      sourceDirty = true  // set flag
      core.generateApp(); // trigger regeneration
      console.log("Wrote to " + writePath + ": " + html)
    })
  })
}