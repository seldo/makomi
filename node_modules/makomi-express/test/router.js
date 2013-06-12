var test = require('tape');
var generator = require('../generators/router.js');
var fs = require('fs');

test('generate routing file', function (t) {

    t.plan(1);

    var routingFile = "./test/data/testapp/routes.json"
    var expectedOutputFile = "./test/data/expected.router.js"

    generator.read(routingFile,function(er,routerString) {
        generator.parse(routerString,function(er,routerObject) {
            generator.generator(routerObject,function(er,routerFile) {
                // compare to expected output
                fs.readFile(expectedOutputFile, 'utf-8', function(er,body) {
                    t.equal(routerFile.body,body)
                });
            })
        })
    })

});