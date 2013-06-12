/**
 * Yes, we're testing that reading files works, because I was learning how to use tape.
 * Fuck you, I'm still new to all of this.
 */
var test = require('tape');
var generator = require('../generators/router.js');
var fs = require('fs');

test('read file', function (t) {

    var expected = "CONTENTS\nOF\nFILE"

    t.plan(1);

    generator.read('./test/data/file.txt',function(er,file) {
        t.equal(file,expected)
    })

});

test('parse file', function (t) {

    t.plan(1);

    var expected = {
        "/": {
            "controller": "index"
        },
        "/users": {
            "controller": "users/list"
        }
    }

    generator.read('./test/data/basic.json',function(er,basicString) {
        generator.parse(basicString,function(er,parsedData) {
            t.deepEqual(parsedData,expected);
        })
    })

});

test('write single file', function (t) {

    t.plan(1);

    var outputDir = "/tmp/";
    var file1 = {
        name: "file1.txt",
        body: "Contents of file 1"
    }

    generator.write(file1,outputDir,function() {
        fs.readFile(outputDir+file1.name, 'utf-8', function(er,body) {
            t.equal(body,file1.body)
        });
    });

});

test('write array of files', function (t) {

    t.plan(4);

    var outputDir = "/tmp/";
    var files = [
        {
            name: "mfile1.txt",
            body: "Contents of file 1"
        },
        {
            name: "mfile2.txt",
            body: "Contents of file 2"
        },
        {
            name: "mfile3.txt",
            body: "Contents of file 3"
        },
        {
            name: "mfile4.txt",
            body: "Contents of file 4"
        }
    ]

    // order of files written isn't guaranteed because node is awesome that way
    generator.write(files,outputDir,function() {
        files.forEach(function(file) {
            fs.readFile(outputDir+file.name, 'utf-8', function(er,body) {
                t.equal(body,file.body)
            });
        })
    });

});