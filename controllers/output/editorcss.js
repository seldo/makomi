var fs = require('fs-extra');

module.exports = function (req, res) {
  fs.readFile('./public/stylesheets/output/editor.css','utf-8',function(er,data) {
    res.setHeader('Content-type','text/css')
    res.send(data)
  })
}