/*
 * The meta-structure of the templates for the current route
 * (not an actual DOM view)
 */

var MC = require('emcee'),
  mkRun = require('makomi-express-runtime'),
  mkSrc = require('makomi-source-util'),
  routesModel = require('../../models/makomi-routes'),
  sessionsModel = require('../../models/sessions'),
  util = require('util');

module.exports = function(req, res) {

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;

  var m = new MC();
  m.load('sessions', req, appConfig)
  m.end(function(er,models) {

    // if the app's not generated yet, wait until it is
    if(!fileMap || !idMap) {
      var layout = {
        source: "layouts/default",
        templates: {
          "body": {
            "source": "try-again"
          }
        }
      }
      mkRun.compile(layout,function(renderedView) {
        res.send(renderedView)
      });
      return;
    }

    // load the controller and combine it with the source map
    // TODO: make this a model
    var sourceDir = req.session['sourceDir']
    mkSrc.loadRoutes(sourceDir,function(routes) {
      var controllerName = routes[route].controller
      var actionName = routes[route].action
      mkSrc.loadController(sourceDir,controllerName,actionName,function(controller) {

        //console.log("Loaded controller for DOM mapping")
        //console.log(controller)

        createDomTree(controller.layout,fileMap,idMap,function(domTree) {

          //console.log("Got DOM tree top-level:")
          //console.log(util.inspect(domTree,{depth:null}))

          convertDomTreeToLayout(domTree,function(domTreeLayout) {

            console.log("Got domTree layout")
            console.log(util.inspect(domTreeLayout,{depth:null}));

            // this is the layout of the actual DOM pane itself
            var layout = {
              source: "layouts/default",
              context: {
                "title": controller.description,
                "project": models['sessions'].project,
                "styles": "<link rel='stylesheet' href='/stylesheets/context/dom.css' />"
              },
              templates: {
                "body": {
                  source: "context/dom",
                  context: {},
                  templates: {
                    "tree": domTreeLayout
                  }
                }
              }
            }

            mkRun.compile(layout,function(renderedView) {
              res.send(renderedView)
            });

          })

        })

      })

    })

  })

};

/**
 * Read DOM tree and convert into our layout on a per-type basis
 */
var convertDomTreeToLayout = function(domTree,cb,indexRef) {

  //console.log("Converting dom tree")
  //console.log(domTree)

  var layout = {
    source: "context/dom/list",
    context: {},
    templates: {}
  }
  var items = []

  var count = domTree.length
  var complete = function() {
    count--
    if(count == 0) {
      //console.log("Converted dom tree")
      //console.log(layout)
      if (items.length > 0) {
        layout.templates.items = items;
        console.log("items are ")
        console.log(items)
      }
      cb(layout,indexRef)
    }
  }

  domTree.forEach(function(element,index) {
    switch(element.type) {
      case 'text':
        // ignore text nodes(?)
        complete()
        break;
      case 'tag':
      default:
        var item = {
          source: "context/dom/item",
          context: {
            tagname: element.name,
            type: element.type
          },
          templates: {}
        }
        // the parentheses here are confusing model with view; bad Laurie!
        if (element.attribs && element.attribs.name) {
          item.context.name = ' (' + element.attribs.name + ')'
        }
        if (element.attribs && element.attribs['makomi-id']) {
          item.context['makomi-id'] = element.attribs['makomi-id']
        }
        if (element.children && element.children.length > 0) {
          convertDomTreeToLayout(element.children,function(childTree,returnedIndex) {
            item.templates.children = childTree
            items[returnedIndex] = item
            complete()
          },index)
        } else {
          items[index] = item
          complete()
        }
        break;
    }
  })
}

/**
 * Convert a template into the equivalent DOM tree from the filemap
 * Expand any sub-templates appropriately.
 * @param layout
 * @param fileMap
 * @param idMap
 * @param cb
 */
var createDomTree = function(layout,fileMap,idMap,cb) {
  //console.log("Creating DOM tree for layout ")
  //console.log(util.inspect(layout,{depth:null}))

  // get the structure of the template
  var sourceKey = '/' + layout.source+'.html'
  if (fileMap[sourceKey]) {
    // expand any leaves within it
    expandVars(fileMap,idMap,fileMap[sourceKey],layout.templates,function(domTree) {
      cb(domTree)
    })
  } else {
    console.log("Could not find source for " + layout.source)
    cb([])
  }
}

/**
 * Parse a domTree looking for m
 * @param domTree
 * @param cb
 */
var expandVars = function(fileMap,idMap,domTree,templates,cb) {

  //console.log("Expanding vars for ")
  //console.log(util.inspect(domTree,{depth:null}))

  if (!templates) templates = {} // tolerate

  var expanded = []

  var count = domTree.length
  var complete = function() {
    count--
    if (count==0) {
      //console.log("Expanded vars to ")
      //console.log(expanded)
      cb(expanded)
    }
  }

  domTree.forEach(function(element,index) {

    var handleChildren = function() {
      if (element.children && element.children.length > 0) {
        expandVars(fileMap,idMap,element.children,templates,function(newChildren) {
          element.children = newChildren
          complete()
        })
      } else {
        complete()
      }
    }

    if (element.type != 'tag') {
      // ignore non-tags
      expanded[index] = element
      complete()
    } else {
      //console.log("Handling tag " + element.name)
      if (tagHandlers[element.name]) {
        tagHandlers[element.name](fileMap,templates,element,function(newElement) {
          expanded[index] = newElement
          handleChildren()
        })
      } else {
        // ignoring un-special tag
        expanded[index] = element
        handleChildren()
      }
    }
  })
}

var tagHandlers = {}
/**
 * Replace one of the slots with a specified file
 * @param fileMap
 * @param templates
 * @param element
 * @param cb
 */
tagHandlers['makomi-target'] = function(fileMap,templates,element,cb) {
  // no flag no country
  if (!element.attribs || !element.attribs.name ) {
    console.log("Missing name for makomi-target")
    cb(element)
    return;
  }

  // nothing goes here
  var slotName = element.attribs.name
  if (!templates[slotName]) {
    console.log("No expansion specified for target " + slotName)
    cb(element)
    return;
  }

  // something goes here
  createDomTree(templates[slotName],fileMap,idMap,function(domTree) {
    element.children = domTree
    cb(element)
    return;
  })
}
/**
 * This tag expands into the source of another file.
 * I'm not really sure why I thought this would be useful.
 */
tagHandlers['makomi-include'] = function(fileMap,templates,element,cb) {
  if (!element.attribs || !element.attribs.src ) {
    console.log("Missing src for makomi-include")
    cb(element)
    return;
  }

  var sourceKey = '/' + element.attribs.src + '.html'
  if (fileMap[sourceKey]) {
    element.children = fileMap[sourceKey]
    cb(element)
    return;
  }

}