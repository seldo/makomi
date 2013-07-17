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
  console.log("New value should be " + newContent)
  var domTree = mkSrc.getTree(idMap,fileMap,mkId);

  var changeContent = function(element,cb) {
    console.log("Element to be changed is")
    console.log(element)
    // we look for a text element and change that. Uh, the first one?
    element.children[0].raw = newContent
    element.children[0].data = newContent
    cb(element);
  }

  mkSrc.findElementAndApply(domTree,mkId,changeContent,function(newDom){
    mkSrc.removeIds(newDom,function(strippedDom) {
      console.log("In-memory representation correct. Save to disk!")
      console.log(util.inspect(strippedDom,{depth:null}))
      var writePath = session['sourceDir'] + 'views' + mkSrc.getSrc(idMap,mkId)
      mkSrc.writeHtml(writePath,strippedDom,function(html) {
        console.log("Wrote to " + writePath + ": " + html)
      })
      /*
       mkSrc.toHtml(newDom,function(er,html) {
       console.log("It will look like:")
       console.log(html)
       console.log(util.inspect(session,{depth:null}))
       })
       */
    })
  })
}