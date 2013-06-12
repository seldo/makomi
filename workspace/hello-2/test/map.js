var arr = ['x','y','z'];

var output = arr.map(function(item,index) {
    console.log(item);
    console.log(index);
    return item + "x";
})

console.log(output.join(','));
