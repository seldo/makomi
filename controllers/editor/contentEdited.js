var mkSrc = require('makomi-source-util'),
  util = require('util')

/**
 * An element has been edited. Find the element in the source, set
 * its content to the new value, and save that back to the source.
 * @param data
 */
module.exports = function(session,data) {
  var mkId = data['makomi-id'];
  var newContent = data.content;
  console.log("Edited element " + mkId + " which is a " + data.tagName)
  //console.log("New value should be " + newContent)
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);

  var changeContent = function(element,cb) {
    console.log("Element to be changed is")
    //console.log(element)
    // we look for a text element and change that.
    // FIXME: probably need a more solid heuristic than "element 0", huh...
    element.children[0].raw = newContent
    element.children[0].data = newContent
    cb(element);
  }

  //console.log("Tree before change is ")
  //console.log(util.inspect(domTree,{depth:null}))
  mkSrc.findElementAndApply(domTree,mkId,changeContent,function(newDom){
    //console.log("Found element " + mkId + " and changed it to ")
    //console.log(util.inspect(newDom,{depth:null}))
    mkSrc.removeIds(newDom,function(strippedDom) {
      //console.log("In-memory representation updated. Save to disk!")
      //console.log(util.inspect(strippedDom,{depth:null}))
      var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)
      mkSrc.writeHtml(writePath,strippedDom,function(html) {
        sourceDirty = true
        console.log("Wrote to " + writePath + ": " + html)
      })
    })
  })
}