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
        var domCopy = core.deepClone(newDom) // otherwise it strips stuff!
        mkSrc.writeStrippedHtml(writePath,domCopy,function(html) {
          console.log("Inserted new content before " + mkId)
          sourceDirty = true  // set flag
          // update internal representation
          core.updateView(mkId,newDom,function() {
            console.log("Sending controller action out")
            socketServer.sockets.emit('controller-action-out',{
              controller: "dom",
              action: "treeModified"
            })
          });
        })
      })
      break;
    case 'insert-append':
      var newContent = data['content'] // htmlparser-style DOM tree
      mkSrc.insertAppend(domTree,mkId,newContent,function(newDom) {
        var domCopy = core.deepClone(newDom) // otherwise it strips stuff!
        mkSrc.writeStrippedHtml(writePath,domCopy,function(html) {
          console.log("Inserted new content inside of " + mkId)
          sourceDirty = true  // set flag
          // update internal representation
          core.updateView(mkId,newDom,function() {
            console.log("Sending controller action out")
            socketServer.sockets.emit('controller-action-out',{
              controller: "dom",
              action: "treeModified"
            })
          });
        })
      })
      break;
    case 'replace':
      var newContent = data['content'] // htmlparser-style DOM tree
      mkSrc.replace(domTree,mkId,newContent,function(newDom) {
        var domCopy = core.deepClone(newDom) // otherwise it strips stuff!
        mkSrc.writeStrippedHtml(writePath,domCopy,function(html) {
          console.log("Replaced content of " + mkId)
          sourceDirty = true  // set flag
          // update internal representation
          core.updateView(mkId,newDom,function() {
            console.log("Sending controller action out")
            socketServer.sockets.emit('controller-action-out',{
              controller: "dom",
              action: "treeModified"
            })
          });
        })
      })
      break;
    case 'move':
      var content = data['content']; // easier than cloning
      // we have *two* potential dom trees, because the target and
      // destination are not necessarily in the same file
      var targetMkId = mkId;
      var targetDomTree = mkSrc.getTree(idMap,fileMap,targetMkId)
      var targetWritePath = writePath;
      var destMkId = data['destination-makomi-id'];
      var destDomTree; // need to wait until remove op is complete
      var destWritePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,destMkId)
      // remove previous location
      mkSrc.remove(targetDomTree,targetMkId,function(newTargetDom) {
        var newTargetDomCopy = core.deepClone(newTargetDom)
        // write to the target file
        mkSrc.writeStrippedHtml(targetWritePath,newTargetDomCopy,function(targetHtml) {
          // insert new content
          destDomTree = mkSrc.getTree(idMap,fileMap,destMkId)
          mkSrc.insertBefore(destDomTree,destMkId,content,function(newDestDom) {
            var newDestDomCopy = core.deepClone(newDestDom)
            // write to the destination file
            mkSrc.writeStrippedHtml(destWritePath,newDestDomCopy,function(destHtml) {
              console.log("Moved content")
              sourceDirty = true
              // update internal reps of both files
              core.updateView(targetMkId,newTargetDom,function() {
                core.updateView(destMkId,newDestDom,function() {
                  // tell the DOM pane to refresh
                  socketServer.sockets.emit('controller-action-out',{
                    controller: "dom",
                    action: "treeModified"
                  })
                })
              })
            })
          })
        })
      })
      break;
    default:
      console.log("DomModified: Unknown DOM action " + domAction)
  }

}