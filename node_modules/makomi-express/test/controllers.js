var test = require('tape');
var generator = require('../generators/controllers.js');
var fs = require('fs');

test('list controller source files', function(t) {

  var controllerDir = "./test/data/testapp/controllers/"
  var expected = ['index.json','users.json']

  t.plan(expected.length)

  generator.findFiles(controllerDir,function(er,files){
    expected.forEach(function(expectedFile) {
      t.notEqual(
        files.indexOf(expectedFile),
        -1,
        "file " + expectedFile + " present in the list"
      )
    })
  })

});

test('generate controllers', function (t) {

  var controllerDir = "./test/data/testapp/controllers/"
  var outputDir = "/tmp/controllers/";
  var expectedFiles = ['index.js','users.js']

  t.plan(expectedFiles.length)

  // ensure our output directory exists
  fs.mkdir(outputDir,null,function() {

    generator.generate(controllerDir,outputDir,function() {

      expectedFiles.forEach(function(filename) {

        // get expected file
        fs.readFile(
          "./test/data/expected.controller." + filename,
          'utf-8',
          function(er,expectedBody) {
            // get actual file
            fs.readFile(outputDir + filename,'utf-8',function(er,actualBody) {
              t.equal(actualBody,expectedBody)
            })
          }
        )
      })
    });
  }) // FIXME: Y U SO DEEPLY NESTED

});