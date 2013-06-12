/**
 * Given a routing file's location and output location, parse the routes
 * and write a router file to disk
 */
exports.generate = function(routingFile,outputDir,cb){
    exports.read(routingFile,function(er,routerString) {
        exports.parse(routerString,function(er,routerObject) {
            exports.generator(routerObject,function(er,routingFiles) {
                // FIXME: actually only one file
                exports.write(routingFiles,outputDir,function(er) {
                    console.log("Generated router");
                    cb();
                })
            })
        })
    })
}

/**
 * File I/O! Yes I put it in its own method.
 * I dunno, maybe it'll be more complicated in future.
 * @param routingFile
 * @param cb
 */
exports.read = function(routingFile,cb) {
    var fs = require('fs');
    fs.readFile(routingFile, 'utf-8', cb);
}

/**
 * Also pretty dumb right now, since the format is JSON.
 * Later we'll probably be setting defaults and validating and shit in here.
 * @param routerString
 * @param cb
 */
exports.parse = function(routerString,cb) {
    var parsed = JSON.parse(routerString);
    // FIXME: catch errors, send them instead of always null
    var er = null;
    cb(er,parsed);
}

/**
 * This is the interesting bit. It generates the router, and also the controllers
 * referenced by that router. Writing javascript in javascript is pretty ugly.
 *
 * @param routerObject
 * @param cb
 */
exports.generator = function(routerObject,cb) {
    var output =
        "// AUTOMATICALLY GENERATED. DO NOT EDIT.\n" +
        "// The droid you're looking for is .makomi/routes.json\n" +
        "module.exports = function(app){\n";

    // map all the routes and build a list of active controllers
    var controllers = {};
    var routes = [];
    Object.keys(routerObject).forEach(function(path) {
        var route = routerObject[path];
        controllers[route.controller] = true;
        routes.push(
            "app.get('" + path + "', " + route.controller + "." + route.action + ");"
        )
    });

    // get array of controllers
    var uniqueControllers = [];
    for(var controller in controllers) {
        uniqueControllers.push(controller);
    }

    // output the controllers
    output += "  var " + uniqueControllers.map(function(controller) {
        return controller + " = require('./controllers/" + controller + "')"
    }).join("\n    , ") + ";\n"

    // output the routes
    routes.forEach(function(route) {
        output += "  " + route + "\n";
    })

    output += "}\n"

    cb(
        null, // FIXME: catch errors, put 'em here
        {
        name: "router.js",
        body: output
        }
    )
}

/**
 * Given an array of file locations and contents, write them all to disk.
 * We may need some logic here to handle wacky/erroneous output locations/names.
 * FIXME: there's actually only ever one router file, so there's no point to this.
 * @param routingFiles
 * @param outputDir
 * @param cb
 */
exports.write = function(routingFiles,outputDir,cb) {
    // handle trivial case
    if (! (routingFiles instanceof Array)) {
        routingFiles = [routingFiles]
    }

    var counter = routingFiles.length;
    var er = null; // TODO: populate this with any errors

    var fs = require('fs');
    routingFiles.forEach( function(file){
        var path = outputDir + file.name
        fs.writeFile(path, file.body, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Wrote " + path);
                // call back when all files are written
                counter--
                if (counter == 0) cb(er);
            }
        });
    });
}