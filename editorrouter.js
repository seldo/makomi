var fs = require('fs')

module.exports = function(req,res,next,matches) {

  console.log("I'M ROUTING " + req.path)

  var projectName = matches[1];

  var filePath = scratchDir + 'app/public' + req.path;

  console.log("Looking for file " + filePath)

  fs.stat(filePath,function(er,stats) {
    if (er) {
      next()
    } else {
      if (stats.isFile()) {
        res.writeHead(200, {
          'Content-Length': stats.size
        });

        var readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      } else {
        next()
      }
    }

  });



}