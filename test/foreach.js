var _ = require('underscore')

var x = []
x[0] = 'a'
x[1] = 'b'
x[10] = 'c'
x[11] = 'd'

console.log("length is " + x.length)
console.log("size is " + _.keys(x).length)

x.forEach(function(element,index) {
  console.log("element " + index + " is " + element)
})