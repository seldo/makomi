var fs = require('fs')

module.exports = function(req,res,next,matches) {

  var projectName = matches[1];
  var filePath = scratchDir + 'app/public' + req.path;

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