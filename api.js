
var managers = require('./managers').managers;
var orders = require('./orders').orders;
var users = require('./users').users;
var db = require('./db').db;


function action(query, callback) {

    var result = query;
    var action = query.params.action;
    var params = query.params;


    console.log('API action: '+action);

    if (action == 'login') {

        users.login(params.login, params.password, function(res) {
            let item = {};
            result.onesided = false;
            if (res.length == 0) {
                item.response = "denied";
                result.data = JSON.stringify(item);
                
                callback(result);
            }
            else {
                item.response = "ok";
                item.user = res[0];
                
                result.data = JSON.stringify(item);
                
                callback(result);
            }
            
        });
    }


    if (action == 'get_user_by_hash') {

        users.getByHash(params.user_id, params.hash, function(res) {
            let item = {};
            result.onesided = false;

            if (res.length == 0) {
                item.response = "denied";
                result.data = item;
                
                callback(result);
            }
            else {
                item.response = "ok";
                item.user = res[0];
                
                result.data = item;
                
                //console.log(JSON.stringify(result));
              

                callback(result);
                
            }
            
            
        });
    }




    if (action == 'add_order') {

        orders.add_order(params.order, function(insert_id) {
            result.data = insert_id;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_orders') {

        orders.get_orders(params.date, function(orders) {
            result.data = orders;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'check_order_exist') {

        orders.check_order_exist(params.date, params.transport_id, params.order_num, function(exist) {
            result.data = exist;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_driver_orders') {

        orders.get_driver_orders(params.driver_id, function(orders) {
            result.data = orders;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_transports') {

        orders.get_transport(function(transport) {
            result.data = transport;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_drivers') {

        orders.get_drivers(function(drivers) {
            result.data = drivers;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_admin_transports') {

        orders.get_transport_admin(function(transport) {
            result.data = transport;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'get_order') {

        orders.get_order(params.id, function(order) {
            result.data = order;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }

    if (action == 'start_order') {

        orders.startOrder(params.id, function() {
            
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }    
    
    if (action == 'end_order') {

        orders.endOrder(params.id, function() {
            
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }    

    if (action == 'problem_order') {

        orders.problemOrder(params.id, params.problem, function() {
            
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
        
    }  


    if (action == 'get_companies') {
        orders.get_companies(function(items) {
            result.data = items;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'check_user_exist') {
        orders.check_user_exist(params.login, function(found) {
            result.data = found;
            result.status = 1;
            result.onesided = false;
            
            callback(result);
        });
    }

    if (action == 'add_transport') {
        orders.add_transport(params.transport, function(items) {
            result.data = items;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'add_driver') {
        orders.add_driver(params.driver, params.user, function(items) {
            result.data = items;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'add_user') {
        users.add_user(params.user, function() {
            result.status = 1;
            result.onesided = true;
            callback(result);
        });
    }

    if (action == 'get_users') {
        users.get_users(function(items) {
            result.data = items;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'remove_item') {
        orders.remove_item(params.owner, params.item_id, function() {
            result.onesided = true;
            callback(result);
        });
    }

    if (action == 'change_order_sum') {
        orders.change_order_sum(params.order_id, params.price, function() {
            result.data = [];
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'change_order_price') {
        orders.change_order_price(params.order_id, params.price, function() {
            result.data = [];
            result.onesided = false;
            callback(result);
        });
    }

    
    if (action == 'get_transport_companies') {
        orders.get_transport_companies(function(items) {
            result.data = items;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'get_company') {
        orders.get_company(params.id, function(data) {
            result.data = data;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'add_photo') {
        orders.loadPhoto(params.base64data, params.order_id, function(data) {
            result.data = data;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'remove_photo') {
        orders.remove_photo(params.photo_id, function(data) {
            result.data = data;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

    if (action == 'get_photos') {
        orders.get_photos(params.order_id, function(data) {
            result.data = data;
            result.status = 1;
            result.onesided = false;
            callback(result);
        });
    }

}


exports.action = action;