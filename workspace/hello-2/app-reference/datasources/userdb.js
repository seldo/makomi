// load the adapter and configuration, and connect
var adapter = require('makomi-adapter-mysql')

// convert datasource.params into connection params obj
adapter.connect({
  "host": mkSrc.config.getSync('mysql.host'),
  "source": mkSrc.config.getSync('mysql.user'),
  "password": mkSrc.config.getSync('mysql.pass'),
  "dbname": mkSrc.config.getSync('mysql.dbname'),
  "port": "3306"
})
