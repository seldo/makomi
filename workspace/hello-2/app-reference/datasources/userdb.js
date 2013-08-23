// load the adapter and configuration, and connect
var adapter = require('makomi-adapter-mysql')

// every datasource has an initialize function
exports.initialize = function(cb) {

  // convert datasource.params into connection params obj
  adapter.initialize({
    "host": mkSrc.config.getSync('mysql.host'),
    "source": mkSrc.config.getSync('mysql.user'),
    "password": mkSrc.config.getSync('mysql.pass'),
    "dbname": mkSrc.config.getSync('mysql.dbname'),
    "port": "3306"
  })

}

exports.queries = {}
exports.queries['get user by id'] = function(req,cb) {

  var params = {
    ":id": req.params.id // TODO: do some kind of validation per instructions here
  }

  adapter.begin(function(transaction) {

    transaction.query(
      "select * from users where id = :id",
      params
    )

  })

}

exports.queries['list all users'] = function(req,cb) {

  var params = {
    ":pagesize": req.params.pagesize || 10, // TODO: validation
    ":pagenumber": req.params.pagenumber || 1, // TODO: validation
    ":offset": adapter.generate

  }

  adapter.begin(function(transaction) {

    transaction.query(
      "select * from users limit :pagesize,:offset",
      translatedParams
    )

  })

}