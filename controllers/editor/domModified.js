var mkSrc = require('makomi-source-util'),
  util = require('util'),
  core = require('../../core.js')

/**
 * The DOM has been modified. Elements can be added, deleted, or replaced.
 * @param data
 */
module.exports = function(session,data) {
  var mkId = data['target-makomi-id'];
  var domAction = data['dom-action'];
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);
  var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)

  switch(domAction) {
    case 'insert-before':
      var newContent = data['content'] // htmlparser-style DOM tree
      mkSrc.insertBefore(domTree,mkId,newContent,function(newDom) {
        mkSrc.writeStrippedHtml(writePath,newDom,function(html) {
          console.log("Inserted new content before " + mkId)
          sourceDirty = true  // set flag
          core.generateApp(); // trigger regeneration
          console.log("Wrote to " + writePath + ": " + html)
        })
      })
      break;
    default:
      console.log("DomModified: Unknown DOM action " + domAction)
  }

}