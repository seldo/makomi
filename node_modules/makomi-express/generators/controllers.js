/**
 * Given a controller directory and output directory
 * Parse each controller description and output an equivalent controller
 */

exports.generate = function (controllerDir, outputDir, cb) {
  exports.findFiles(controllerDir, function (er, fileList) {

    // the controllers are independent so we can read them all in parallel,
    // parse them in parallel, and just say when we're done.
    var count = fileList.length;
    fileList.forEach(function (file) {
      exports.read(controllerDir + file, function (er, fileString) {
        exports.parse(fileString, function (er, fileObject) {
          exports.generator(fileObject, function (er, controllerFile) {
            exports.write(controllerFile, outputDir, function (er) {
              count--;
              if (count == 0) {
                console.log("Generated controllers")
                cb()
              }
            })
          })
        })
      })
    })
    // FIXME: this nesting kind of looks like a node parody. What am I doing wrong?

  })
}

/**
 * Get a list of all the controller file names in the controller directory.
 * @param controllerDir
 * @param cb
 */
exports.findFiles = function (controllerDir, cb) {

  var fs = require('fs');

  fs.readdir(controllerDir, function (er, files) {
    // FIXME: handle errors
    // TODO: filter things that are not JSON
    cb(er,files)
  })
}

/**
 * Read in the file. Maybe also validate it here in future.
 * @param routingFile
 * @param cb
 */
exports.read = function (file, cb) {
  var fs = require('fs');
  fs.readFile(file, 'utf-8', cb);
}

/**
 * Trivial to parse because it's JSON. Some validation a good idea in future.
 * @param routerString
 * @param cb
 */
exports.parse = function (fileString, cb) {
  var parsed = JSON.parse(fileString);
  // FIXME: catch errors, send them instead of always null
  var er = null;
  cb(er, parsed);
}

/**
 * This is the interesting bit. Given the instructions in the controller file,
 * write an Express-y controller script.
 *
 * @param routerObject
 * @param cb
 */
exports.generator = function (controllerObject, cb) {

  var controller = controllerObject.name

  var output =
    "// AUTOMATICALLY GENERATED. DO NOT EDIT (yet).\n" +
    "// The droid you're looking for is .makomi/controllers/" + controller + ".json\n" +
    "// Some day, we'll allow you to edit this file and import changes back to the source.\n\n"

  // TODO: in future we will need to handle data sources here, and be much cleverer in general

  controllerObject.actions.forEach(function(action) {
    output += "// " + action.description + "\n"
    output += "exports." + action.name + " = function(req,res){\n"
    output += "  res.render('" + action.view.name + "', " + JSON.stringify(action.view.params) + ");\n"
    output += "};\n\n"
  })

  cb(
    null, // FIXME: catch errors, put 'em here
    {
      name: controller + ".js",
      body: output
    }
  )
}

/**
 * Given a file "object", which contains a name and the file body, write that file
 * We are given the output dir for all these.
 * We may need some logic here to handle wacky/erroneous output locations/names.
 * @param fileObject
 * @param outputDir
 * @param cb
 */
exports.write = function (fileObject, outputDir, cb) {

  var fs = require('fs');

  var path = outputDir + fileObject.name
  fs.writeFile(path, fileObject.body, function (er) {
    if (er) {
      console.log(er);
    } else {
      console.log("Wrote " + path);
    }
    cb(er);
  });

}