var mkUtil = require('makomi-source-util'),
  fs = require('fs-extra'),
  util = require('util');

exports.generateApp = function() {
  if (generating) return;
  generating = true

  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    fs.mkdirs(scratchDir,function() {
      mkUtil.generateWorkingCopy(appDefinition,sourceDir,scratchDir, function(newFileMap,newIdMap) {
        // pass the data to the app in general
        fileMap = newFileMap
        idMap = newIdMap
        sourceDirty = false
        generating = false
        console.log("Working copy generated")
      },true) // means dev-mode
    })
  })

}


