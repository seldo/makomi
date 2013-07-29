var mkUtil = require('makomi-source-util'),
  fs = require('fs-extra'),
  util = require('util'),
  _ = require('underscore');

/**
 * Generate a working copy of the app from the original source
 */
exports.generateApp = function() {
  if (generating) return;
  generating = true

  // FIXME: hard-coding location
  var scratchSource = scratchDir + '.makomi/'
  var scratchApp = scratchDir + 'app/'
  console.log("from core: sourceDir reaches generateapp as " + sourceDir)

  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    fs.mkdirs(scratchSource,function() {
      mkUtil.generateWorkingCopy(sourceDir,scratchSource, function(newFileMap,newIdMap) {

        // we now have an id-ified version of the source, so call the engine
        // in dev mode to generate the actual app
        var engine = require(appDefinition.generators.base)
        engine.generate(scratchSource,scratchApp,"all",true,function() {

          // pass the data to the app in general
          fileMap = newFileMap
          idMap = newIdMap

          // unlock
          sourceDirty = false
          generating = false
          console.log("Generated app from " + scratchSource + " into " + scratchApp)
        })
      }) // means dev-mode, necessary for a working copy
    })
  })
}

/**
 * Update a single file in the working copy
 */
exports.updateView = function(mkId,newDom,cb) {
  if (generating) return;
  generating = true

  var fileToUpdate = mkUtil.getSrc(idMap,mkId)

  mkUtil.updateViewFile(scratchDir,fileToUpdate,newDom,function() {

    // update the ID map
    mkUtil.createIdMap(fileToUpdate,newDom,function(idMapFragment) {
      // update the global structures
      fileMap[fileToUpdate] = newDom
      _.extend(idMap,idMapFragment)
      sourceDirty = false
      generating = false
      console.log("Working copy of view updated")
      cb()
    })
  })
}

/**
 * A VERY DANGEROUS deep-clone that will really break shit if you use it
 * on an object with methods and stuff. Really only use if you are POSITIVE
 * that every leaf of your object is a string.
 * @param x
 * @returns {*}
 */
exports.deepClone = function(x) {
  var copy = _.clone(x);
  if (_.isObject(copy)) {
    _.each(copy,function(element,index) {
      copy[index] = exports.deepClone(element)
    })
  }
  return copy
}
