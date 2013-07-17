var fs = require('fs'),
  _ = require('underscore')

var arr = [1,2,3,4,5,6,7,8,9]

var count = arr.length
var complete = function() {
  count--
  if (count == 0) {
    console.log("Array now: ")
    console.log(arr)
  }
}

// this works as expected. Your output is:
// [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ]

arr.forEach(function(element,index) {
  fs.stat('/tmp',function(er,stats) {
    console.log(index)
    arr[index] = arr[index] + 1
    complete()
  })
})

var obj = {"a": 1,"b": 2,"c": 3,"d": 4,"e": 5,"f": 6,"g": 7,"h": 8,"i": 9}

var count2 = 9
var complete2 = function() {
  count2--
  if (count2 == 0) {
    console.log("Object now: ")
    console.log(obj)
  }
}

// fucks up completely. Output is:
// { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 18 }

for (var index in obj) {
  fs.stat('/tmp',function(er,stats) {
    console.log(index)
    obj[index] = obj[index] + 1
    complete2()
  })
}

var obj2 = {"a": 1,"b": 2,"c": 3,"d": 4,"e": 5,"f": 6,"g": 7,"h": 8,"i": 9}

var count3 = 9
var complete3 = function() {
  count3--
  if (count3 == 0) {
    console.log("Object 2 now:")
    console.log(obj2)
  }
}

// underscore fixes it! Output is:
// { a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8, h: 9, i: 10 }

_.each(obj2,function(element,index,obj) {
  fs.stat('/tmp',function(er,stats) {
    console.log(index)
    obj2[index] = obj2[index] + 1
    complete3()
  })
})