var db = require('./db').db;
var md5 = require('md5');

var Users = {

    getByHash: function(user_id, hash, callback)  {
        

        db.query("SELECT * FROM users WHERE id=? AND password=?", [user_id, hash], function(err, result) {

            
            if (err) throw err;

            //console.log(JSON.stringify(result));

            callback(result);

        });
    },

    login: function(login, password, callback) {

        //let crypt_password = md5(password);

        let crypt_password = password;

        db.query("SELECT * FROM users WHERE login=? AND password=? LIMIT 1", [login, crypt_password], function(err, result) {
            
            if (err) throw err;

            console.log(JSON.stringify(result));

            callback(result);
        });
    },

    getById: function(id, callback)  {
        if (id==undefined) { console.log('user_id undefined'); return; }

        db.query("SELECT * FROM users WHERE id=?", [id], function(err, result) {

            if (err) throw err;

            callback(result);

        });
    },

    
    get_users: function(callback) {
        db.query("SELECT * FROM users WHERE type=1", function(err, result) {
            
            if (err) throw err;

            callback(result);

        });
    },

    add_user: function(user, callback) {

        var is_update = Number(user.is_update);
        delete(user.is_update);



        if (is_update > 0) {
            console.log('update user');
            db.query("UPDATE users SET ? WHERE id=?", [user, is_update], function(err, results) {
                                
                if (err) throw err;
              
                callback(results);
                

            });

        }
        else {
            
            db.query("INSERT INTO users SET ?", user, function(err, results) {
                
                if (err) throw err;
                
                callback(results);
                
            });
        }
    },

};

module.exports.users = Users;