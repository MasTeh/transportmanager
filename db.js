var mysql = require('mysql');

var con = mysql.createConnection({
  socketPath: "/var/run/mysqld/mysqld.sock",
  user: "c1840_zbt_masterstvo_info",
  password: "BoYsaGegxujak46",
  database: "c1840_zbt_masterstvo_info"
});


exports.db = con;
