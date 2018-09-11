var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});;

var base64 = {

    test: function() {
        console.log(__dirname);
    },

    encode: function(filename){

        fs.readFile(path.join(__dirname,'/../www/photos/',filename),function(error,data){
            if(error){
            throw error;
            }else{
            var buf = Buffer.from(data);
            var base64 = buf.toString('base64');
            //console.log('Base64 of ddr.jpg :' + base64);
            return base64;
            }
        });

    },

    decode: function(base64str , filename, callback) {
        
        var _base64str = base64str.replace('data:image/jpeg;base64,','');

        var buf = Buffer.from(_base64str,'base64');

        fs.writeFile(path.join(__dirname,'/../www/photos/',filename), buf, function(error){
            if(error){
                throw error;
            } else  {
                console.log('File created from base64 string!');

                if (callback) callback();
                return true;
            }
        });

    },

    resize: function(filename, size, callback) {
        console.log('resizing '+filename);
        gm(path.join(__dirname,'/../www/photos/',filename))
            .resize(size, size, '^')
            .gravity('Center')
            .crop(size, size)
            .write(path.join(__dirname,'/../www/photos/'+size+'x'+size+'/',filename), function (err) {
                if (!err) console.log(' resized ');
                if (callback) callback();
            });
    },

    makeid: function() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 20; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
    },

    deletefile: function(filename) {
        
        let path1 = path.join(__dirname,'/../www/photos/',filename);
        let path2 = path.join(__dirname,'/../www/photos/500x500/',filename);

        if (fs.existsSync(path1))
        fs.unlink(path1, function(err, res) {
            if (err) throw err;
        });

        if (fs.existsSync(path2))
        fs.unlink(path2, function(err, res) {
            if (err) throw err;
        });
    
    }

}

exports.base64 = base64;