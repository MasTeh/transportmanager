var db = require('./db').db;
var md5 = require('md5');
var salt = 'zbt';

var Managers = {

    getByHash: function(user_id, hash, callback)  {
        

        db.query("SELECT * FROM managers WHERE id=? AND password=?", [user_id, hash], function(err, result) {

            
            if (err) throw err;

            //console.log(JSON.stringify(result));

            callback(result);

        });
    },

    login: function(phone, password, callback) {

        //let crypt_password = md5(password+salt);

        let crypt_password = password;

        db.query("SELECT * FROM managers WHERE phone=? AND password=? LIMIT 1", [phone, crypt_password], function(err, result) {
            
            if (err) throw err;

            console.log(JSON.stringify(result));

            callback(result);
        });
    },

    getById: function(id, callback)  {
        if (id==undefined) { console.log('user_id undefined'); return; }

        db.query("SELECT * FROM managers WHERE id=?", [id], function(err, result) {

            if (err) throw err;

            callback(result);

        });
    }

};

module.exports.managers = Managers;