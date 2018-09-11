var db = require('./db').db;
var dateFormat = require('dateformat');
dateFormat.i18n = {
    dayNames: [
        'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб',
        'воскресение', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'
    ],
    monthNames: [
        'Янв', 'Фев', 'Мар', 'Апр', 'Мая', 'Июн', 'Июл', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек',
        'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
    ],
    timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
};

var base64 = require('./base64').base64;



var Orders = {

    loadPhoto: function(base64data, order_id, callback) {

        var filename = base64.makeid()+'.jpg';
        base64.decode(base64data, filename, function() {

            base64.resize(filename, '500', function() {

                let path_filename1 = 'http://zbt.masterstvo.info/photos/'+filename;
                let path_filename2 = 'http://zbt.masterstvo.info/photos/500x500/'+filename;

                db.query("INSERT INTO photos SET order_id=?, photo=?", [order_id, filename], function(err, res) {

                    callback({
                        'photo':path_filename1,
                        'photo500':path_filename2,
                        'filename':filename,
                        'id':res.insertId
                    });

                });

                
            });


        });

    },

    get_photos: function(order_id, callback) {
        db.query("SELECT * FROM photos WHERE order_id=?", order_id, function(err, photos) {
            if (err) throw err;

            for (let key in photos) {
                let filename = photos[key].photo;
                photos[key].photo500 = 'http://zbt.masterstvo.info/photos/500x500/'+filename;
                photos[key].photo = 'http://zbt.masterstvo.info/photos/'+filename;
                
            }

            callback(photos);

        });
    },

    remove_photo: function(photo_id) {
        db.query("SELECT * FROM photos WHERE id=?", photo_id, function(err, photo) {
            if (err) throw err;

            let filename = photo[0].photo;
            base64.deletefile(filename);
            
            db.query("DELETE FROM photos WHERE id=?", photo_id);
        })
    },

    update_desk: function() {
        for (var session in clients) 
            clients[session].send(JSON.stringify({
                'type':'server-event', 
                'action':'update_desk'
            }));
    },

    update_driver: function() {
        for (var session in clients) 
            clients[session].send(JSON.stringify({
                'type':'server-event', 
                'action':'update_driver'
            }));
    },

    add_company: function(company_name, order_id) {
        db.query("SELECT * FROM companies WHERE name = ?", company_name, function(err, result) {
            if (err) throw err;

            if (result.length==0) {
                db.query("INSERT INTO companies SET name=?, type='client'", company_name, function(err, result) {
                    if (err) throw err;

                    db.query("UPDATE orders SET company_id=? WHERE id=?", [result.insertId, order_id], 
                        function(err, result) {

                            if (err) throw err;

                        });

                });
            } 
        });
    },

    check_order_exist: function(date, transport_id, order_num, callback) {

        var exist = false;
        var overflow = false;

        db.query("SELECT * FROM orders WHERE date=? AND transport_id=? AND order_num=?", [date, transport_id, order_num],
        function(err, results) {

            if (err) throw err;

            if (results.length > 0) exist = true;
            
            db.query("SELECT * FROM orders WHERE date=? AND transport_id=?", [date, transport_id],
            function(err, res) {

                if (err) throw err;

                if (res.length >= 4) overflow = true;

                
                if (exist || overflow) 
                    callback(true);
                else 
                    callback(false);
                    

            });

        });

    },

    add_order: function(order, callback) {


        var update_id = Number(order.is_update);
        delete(order.is_update);

        if (update_id > 0) {
            db.query("UPDATE orders SET ? WHERE id=?", [order, update_id], function(err, result) {
                if (err) throw err;
                var insertId = result.insertId;

                Orders.update_desk();
                Orders.update_driver();
                Orders.add_company(order.company_name, insertId);

                callback(result);
            });
        }
        else
        {
            db.query("INSERT INTO orders SET ?", order, function(err, result) {
                
                if (err) throw err;

                var insertId = result.insertId;

                Orders.update_desk();
                Orders.update_driver();
                Orders.add_company(order.company_name, insertId);                      

                callback(result);
                
            });
        }


    },

    get_order: function(id, callback) {

        db.query("SELECT * FROM orders WHERE id=?", id, function(err, orders) {
            
            if (err) throw err;

            let order = orders[0];

            db.query("SELECT * FROM transport WHERE id=?", order.transport_id, function(err, transport) {

                db.query("SELECT * FROM drivers WHERE id=?", order.driver_id, function(err, driver) {

                    if (err) throw err;

                    order.transport = transport[0];
                    
                    order.date =  dateFormat(order.date, 'yyyy-mm-dd');
                    order.date_label =  dateFormat(order.date, 'dd.mm.yyyy');
                    order.driver = driver[0];

                    if (order.status==0) order.is_setted = true; else order.is_setted = false;
                    if (order.status==1) order.is_started = true; else order.is_started = false;
                    if (order.status==2) order.is_done = true; else order.is_done = false;
                    if (order.status==3) order.is_cancel = true; else order.is_cancel = false;

                    callback(order);

                });
            });

            

            
        });
    },

    get_companies: function(callback) {
        db.query("SELECT * FROM companies WHERE type='client' ORDER BY id", function(err, results) {
            
            if (err) throw err;

            callback(results);

        });
    },

    get_transport_companies: function(callback) {
        db.query("SELECT * FROM companies WHERE type='own' OR type='service' ORDER BY id", function(err, results) {
            
            if (err) throw err;

            callback(results);

        });
    },

    remove_item: function(owner, id, callback) {
        let query = "DELETE FROM "+owner+" WHERE id="+id;
        console.log(query);
        db.query(query, function(err, results) {
            
            if (err) throw err;

            if (owner == 'drivers') {
                db.query("DELETE FROM users WHERE driver_id=?", id, function(err, res) {
                    if (err) throw err;
                });
            }

            if (owner == 'orders') {
                Orders.update_desk();
            }


        });
    },

    change_order_sum: function(order_id, price, callback) {

        db.query("UPDATE orders SET order_price=? WHERE id=?", [price, order_id], function(err, res) {
            if (err) throw err;
            callback();
        });
    },

    change_order_price: function(order_id, price, callback) {

        db.query("UPDATE orders SET hour_price=? WHERE id=?", [price, order_id], function(err, res) {
            if (err) throw err;
            callback();
        });
    },

    check_user_exist: function(login, callback) {

        db.query("SELECT * FROM users WHERE login=?", login, function(err, res) {

            if (err) throw err;

            let found = false;
            if (res.length > 0) found = true;


            callback(found);
        });
    },

    add_transport: function(transport, callback) {

        var is_update = Number(transport.is_update);
        delete(transport.is_update);



        if (is_update > 0) {
            console.log('update');
            db.query("UPDATE transport SET ? WHERE id=?", [transport, is_update], function(err, results) {
                                
                if (err) throw err;
              
                callback(results);
                

            });

        }
        else {
            
            db.query("INSERT INTO transport SET ?", transport, function(err, results) {
                
                if (err) throw err;
                
                callback(results);
                
            });
        }
    },

    add_driver: function(driver, user, callback) {

        var is_update = Number(driver.is_update);
        delete(driver.is_update);


        if (is_update > 0) {
            console.log('update');
            db.query("UPDATE drivers SET ? WHERE id=?", [driver, is_update], function(err, results) {
                
                if (err) throw err;

                let login = user.login;
                let new_password = user.password;
                delete(user.login);

                db.query("UPDATE users SET password=? WHERE login=?", [new_password, login], function(err, res) {
                    if (err) throw err;
                    callback(results);
                });

                callback(results);

            });

        }
        else {
            
            db.query("INSERT INTO drivers SET ?", driver, function(err, results) {
                
                if (err) throw err;

                let new_user = user;
                new_user.driver_id = results.insertId;

                console.log(new_user);

                db.query("INSERT INTO users SET ?", new_user, function(err, res) {
                    if (err) throw err;                   

                    callback(results);
                });

            });
        }
    },

    get_company: function(id, callback) {
        db.query("SELECT * FROM companies WHERE id=?", id, function(err, result) {
            
            if (err) throw err;

            callback(result);

        });
    },

    get_transport: function(callback) {
        db.query("SELECT * FROM transport WHERE active=1", function(err, result) {
            
            if (err) throw err;

            callback(result);

        });
    },

    get_drivers: function(callback) {
        db.query("SELECT d.*, u.login, u.password FROM drivers d LEFT JOIN users u ON u.driver_id=d.id", function(err, result) {
            
            if (err) throw err;

            callback(result);

        });
    },


    get_transport_admin: function(callback) {
        db.query("SELECT t.*, c.name as company_name FROM transport t LEFT JOIN companies c ON c.id=t.company_id", function(err, result) {
            
            if (err) throw err;

            callback(result);

        });
    },

    get_orders: function(input_date, callback) {


        db.query("SELECT o.*, t.number as transport_name FROM orders o LEFT JOIN transport t ON t.id=o.transport_id WHERE date = ?",  
        [input_date],
        function(err, results) {

            if (err) throw err;

            db.query("SELECT * FROM transport WHERE active=1 ORDER BY type", function(err, transports) {

                if (err) throw err;

                let all_orders = [];
                let sorted_orders = {};

                for (var key in transports) {
                    if (transports[key].type==2) transports[key].is_rent = true; else transports[key].is_rent = false;
                }

                let date_sector = dateFormat(input_date, 'dddd/dd/mm/yyyy');

                for (var key in results) {
                    let item = results[key];
                    let date = input_date;
                    item.date = dateFormat(date, 'dd.mm.yyyy');
                    item.subdate = dateFormat(date, 'dd.mm');
                    item.datesector = dateFormat(date, 'dddd/dd/mm/yyyy');
                    item.dateinput = dateFormat(date, 'yyyy-mm-dd');
                    item.weekday = dateFormat(date, 'dddd');
                    
                    item.timestamp = new Date(dateFormat(date, 'yyyy-mm-dd 00:00:00')).getTime();

                    if (item.status==0) item.is_setted = true; else item.is_setted = false;
                    if (item.status==1) item.is_started = true; else item.is_started = false;
                    if (item.status==2) item.is_done = true; else item.is_done = false;
                    if (item.status==3) item.is_cancel = true; else item.is_cancel = false;

                    all_orders.push(item);
                    
                }
                console.log('1');

                for (var key in all_orders) {
                    let item = all_orders[key];

                    if (sorted_orders[item.datesector] == undefined) sorted_orders[item.datesector] = [];
                    
                    sorted_orders[item.datesector].push(item);
                }
                console.log('2');

                for (var key in sorted_orders) {
                    let items = sorted_orders[key];
                    let tr_orders = {};

                    for (var key2 in items) {
                        let item = items[key2];
                        

                        for (var key3 in transports) {
                            let tr = transports[key3];

                            if (tr_orders[tr.number] == undefined) {
                                
                                tr_orders[tr.number] = {'transport':tr, 'items':[]};
                            }

                            if (item.transport_id==tr.id) tr_orders[tr.number].items.push(item);

                        }
                    }

                    

                    sorted_orders[key] = tr_orders;

                }
                console.log('3');

                for (var order_date in sorted_orders) {
                    for (var trans in sorted_orders[order_date]) {
                        if (sorted_orders[order_date][trans].items.length == 0)
                            delete(sorted_orders[order_date][trans]);
                    }
                }

                if (results.length == 0) {
                    
                    let tr_orders = {};

                    for (var key in transports) {
                        let tr = transports[key];
 
                            tr_orders[tr.number] = {'transport':tr, 'items':[]};

                    }

                    let output = {};

                    output[date_sector] = tr_orders;

                    callback(output);
                    return false;
                }

                

                callback(sorted_orders);

            });
            
    

        });
    },

    get_driver_orders: function(driver_id, callback) {

        db.query("SELECT * FROM transport WHERE driver_id=? LIMIT 1", driver_id, function(err, transports) {

            var transport = transports[0];
            var transport_id = transport.id;

            db.query("SELECT o.*, t.number as transport_name FROM orders o LEFT JOIN transport t ON t.id=o.transport_id WHERE o.driver_id = ? AND o.date >= NOW() - INTERVAL 2 DAY ORDER BY o.date", 
            driver_id, function(err, orders) {
    
                if (err) throw err;
    
                var sorted_orders = {};
                var transport_name = '';
                for (var key in orders) {
                    let item = orders[key];
                    let date = dateFormat(item.date, 'dd mmm');
                    let weekday = dateFormat(item.date, 'dddd');
    
                    let datesector = date+'<br><span style="font-size:12px">'+weekday+'</span>';
    
                    
                    if (item.status==0) item.is_setted = true; else item.is_setted = false;
                    if (item.status==1) item.is_started = true; else item.is_started = false;
                    if (item.status==2) item.is_done = true; else item.is_done = false;
                    if (item.status==3) item.is_cancel = true; else item.is_cancel = false;
    
                    if (sorted_orders[datesector]==undefined) sorted_orders[datesector] = [];
    
                    sorted_orders[datesector].push(item);
    
                    transport_name = item.transport_name;
                }
    
                
                callback({transport_name: transport_name, items: sorted_orders});
    
            });


        });

        
        
    },

    startOrder: function(id, callback) {

        db.query("UPDATE orders SET status=1, problem='' WHERE id=?", id, function(err, result) {
            if (err) throw err;

            for (var session in clients) 
            clients[session].send(JSON.stringify({
                'type':'server-event', 
                'action':'update_desk'
            }));

            callback();

        });
    },

    endOrder: function(id, callback) {

        db.query("UPDATE orders SET status=2, problem='' WHERE id=?", id, function(err, result) {
            if (err) throw err;

            for (var session in clients) 
            clients[session].send(JSON.stringify({
                'type':'server-event', 
                'action':'update_desk'
            }));

            callback();

        });
    },

    problemOrder: function(id, problem, callback) {

        db.query("UPDATE orders SET status=3, problem=? WHERE id=?", [problem, id], function(err, result) {
            if (err) throw err;

            for (var session in clients) 
            clients[session].send(JSON.stringify({
                'type':'server-event', 
                'action':'update_desk'
            }));

            callback();

        });
    },

    findInArray: function(arr, key, value) {
        for (var key_name in arr) {
            if (key_name == key && arr[key_name] == value) return true;
        }

        return false;
    }

};

module.exports.orders = Orders;