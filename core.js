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
        console.log("working copy generated")

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
 * Update the CSS files in the working copy
 */
exports.updateCss = function(newCss,cb) {

  // FIXME: hard-coding location
  var scratchSource = scratchDir + '.makomi/'
  var scratchApp = scratchDir + 'app/'
  var cssPath = scratchSource + 'public/stylesheets/layout.css'
  var workingPath = scratchApp + 'public/stylesheets/layout.css'

  // write to the working copy source
  mkUtil.css.write(cssPath,newCss,function(rawCss) {
    // copy the CSS over to the generated app too
    fs.copy(cssPath,workingPath,function() {
      console.log("Working copy of CSS updated")
      cb(rawCss)
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
  // FIXME: hard-coding location
  var scratchSource = scratchDir + '.makomi/'
  var scratchApp = scratchDir + 'app/'

  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    mkUtil.updateViewFile(scratchDir,fileToUpdate,newDom,function() {

      // update the ID map
      mkUtil.createIdMap(fileToUpdate,newDom,function(idMapFragment) {
        // update the global structures
        fileMap[fileToUpdate] = newDom
        _.extend(idMap,idMapFragment)

        // call the view generator to update the templates from the source
        var viewEngine = require(appDefinition.generators.views)
        viewEngine.generate(scratchSource,scratchApp,"views",true,function() {
          sourceDirty = false
          generating = false
          console.log("Working copy of view updated; templated regenerated")
          cb()
        })
      })
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
