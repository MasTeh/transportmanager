var ws;

var ws_server = "ws://zbt.masterstvo.info";

function we_online() {
    $('.online-status').find('div').removeClass('offline');
    $('.online-status').find('div').addClass('online');

    socket.status = 1;
}

function we_offline() {
    $('.online-status').find('div').removeClass('online');
    $('.online-status').find('div').addClass('offline');

    socket.status = 0;
}


var socket = {

    status: 0,

    try_limit: 20,

    query_stack: {},

    getUniqRand: function() {

        let rand_num = randNum(0, 1000);

        if (socket.query_stack[rand_num] == undefined) return rand_num;
        else socket.getUniqRand();
    },

    get: function(params = {}, callback, force_action = false, silent = true, try_id = 0) {


        if (socket.status==0) {
            if (force_action) {
                if (!silent) app.loaderShow();
                setTimeout(function () {
                    let cur_try = try_id + 1;

                    if (cur_try > socket.try_limit) {
                        console.log('Нет ответа от сервера, запрос:');
                        console.log(params);

                        app.f7.alert("Нет связи с Интернет, может скоро появится, попробуем еще раз", "Пропала связь", function () {
                            socket.get(params, callback, force_action, silent, 0);
                        });
                    }
                    else {
                        console.log('socket попытка ' + cur_try);
                        socket.get(params, callback, force_action, silent, cur_try);
                    }

                }, 300);
            }
        }
        else {

            app.loaderHide();

            console.log('api query: '+params.action);
            console.log(params);

            var sock_send = {};
            sock_send.params = params;
            sock_send.type = 'query_send';

            let rand_num = socket.getUniqRand();

            sock_send.qid = rand_num;

            ws.send(JSON.stringify(sock_send));

            socket.query_stack[rand_num] = {status: 'wait'};

            //console.log("QUERY STACK"); console.log(socket.query_stack);

            socket.setResponseListener(rand_num, callback);

        }

    },

    setResponseListener: function (id, action) {

        if (socket.query_stack[id].status == 'ok') {
            action(socket.query_stack[id].data);
            delete(socket.query_stack[id]);
        }
        else setTimeout(function () {
            socket.setResponseListener(id, action);
        }, 50);
    }


};


// setInterval(function () {
//     socket.get({'action':'get_users'}, function (result) {
//         console.log(result);
//     })
// }, 1000);


function connectWebSocket(websocketServerLocation, onopen, onmessage){

    ws = new WebSocket(websocketServerLocation);

    ws.onopen = function(evt) {
        we_online();
        if (onopen) onopen(evt);
    };

    ws.onmessage = function(evt) {
        if (onmessage) onmessage(evt);
    };

    ws.onclose = function(){
        we_offline();
        setTimeout(function(){connectWebSocket(websocketServerLocation, onopen, onmessage)}, 500);
    };
}


var $$ = Dom7;



var app = new App({
	platform: $('body').attr('platform'),
    station: $('body').attr('station'),
	app_name:'ЗБТ Логистика',
	api_url: 'http://zbt.masterstvo.info/',
	api_query: 'http://zbt.masterstvo.info/app_api.php',
});



var user = new User();
var photos = new Photos();
var orders = new Orders();




var myapp = {

    last_ping: parseInt(new Date().getTime()),

    desk: [],

    active_order: 0,

    init: function () {

        myapp.desk_template = $('.slide-template').html();
        $('.slide-template').remove();

        user.autologin();






    },

    pingListener: function () {

        setInterval(function () {
            let stamp = parseInt(new Date().getTime());
            let ping_interval = stamp - myapp.last_ping;

            if (ping_interval > 500) {
                console.log('Да бля! Нет связи...');
                we_offline();
            }
            else we_online();
        }, 500);
    }

};

connectWebSocket(ws_server,
    function (evt) {
        console.log('socket is open');
    },
    function (evt) {
        // console.log(evt.data);

        var response = JSON.parse(evt.data);


        if (response.type == 'query_send') {

            console.log(response);

            let q_id = response.qid;
            response.status = 'ok';

            if (socket.query_stack[q_id].status == 'wait')
                socket.query_stack[q_id] = response;
        }

        if (response.type == 'console') {

            console.log(response.message);
        }

        if (response.type == 'ping') {

            myapp.last_ping = parseInt(new Date().getTime());
        }

        if (response.type == 'server-event') {

            console.log('SERVER-SIDE event');
            console.log(response);

            if (response.action == 'update_desk') {
                if (myapp.user.type == 1)

                    if (app.station == 'desktop')
                        orders.getOrdersDesktop();
                    else
                        orders.getOrders();
            }

            if (response.action == 'update_driver') {
                if (myapp.user.type == 2)
                    orders.getDriverOrders();
            }
        }
    });





myapp.init();
myapp.pingListener();




$(document)

.on('click', '[onPress]', function() {
	
	eval($(this).attr('onPress'));

})

.on('change', '[onChange]', function() {
	
	eval($(this).attr('onChange'));

})

.on('click', '.slide-menu a', function() {

	app.f7.closePanel();
})

    .on('click' ,'.phonelink', function() {

        href = $(this).attr('href');

        if (app.station == 'desktop') {

            app.alert(href.replace('tel:',''));
        } else {
            cordova.InAppBrowser.open(href, '_system');
        }
    })


.on('click', '.open-popup', function() {
	
	myapp.externalPopup($(this).attr('href'));
})

.on('change', 'select[name=company_id]', function() {

    let id = $(this).val();

    if (Number(id) == 0) {
        $('#add_order').find('input[name=company_name]').val('');
        //$('#add_order').find('input[name=load_address]').val('');
        //$('#add_order').find('input[name=unload_address]').val('');
        //$('#add_order').find('input[name=load_phone]').val('');

        return false;
    }

    $('#add_order').find('input[name=company_name]').val(myapp.clients_companies[id].name);
    //$('#add_order').find('input[name=load_address]').val(myapp.clients_companies[id].address);
    //$('#add_order').find('input[name=load_phone]').val(myapp.clients_companies[id].phone);

})

.on('click', '.remove-item', function () {

    var owner = $(this).attr('owner');
    var item_id = $(this).attr('item-id');

    var elem = $(this);

    app.f7.confirm('Точно?', 'Подтверждение', function () {

        if (owner == 'drivers' || owner == 'users' || owner == 'transport') {

            elem.parent().parent().remove();
            orders.removeItem(owner, item_id, function () {
            });
        }

        if (owner == 'orders') {
            orders.removeItem(owner, item_id, function () { });
            app.mainView.router.back();
        }
    });
})

.on('change', '.file_upload', function (event) {

    let input = event.target;
    let file = input.files[0];
    let order_id = $(this).attr('order-id');

    if (window.File && window.FileReader && window.FileList && window.Blob) {

        function handleFileSelect(evt) {
            var files = evt.target.files;
            for (var i = 0, f; f = files[i]; i++) {
                // Only process image files.
                if (!f.type.match('image.*')) {
                    continue;
                }
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (function (theFile) {
                    return function (e) {
                        $('.photo_loader_preloader').html('Загрузка фото...');
                        socket.get({action: 'add_photo', base64data: e.currentTarget.result, order_id: order_id},
                            function (photo) {


                                myapp.photos_view.push(photo.photo);
                                let new_photo_index = Number(myapp.photos_view+1);
                                $('.file_upload').val('');
                                $('.photo_loader_preloader').html('');
                                $('.order_images').append(
                                    '<div photo-id="'+ photo.id +'" style="float: left; margin-top: 20px">' +
                                    '<a href="'+photo.photo+'" photo-id="'+ i +'" class="order-photo"><img src="'+ photo.photo500 +'"></a>' +
                                    '<br><a href="#" photo-id="'+photo.id+'" class="button remove_photo">Удалить фото</a></div>');

                            });
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            }
        }

        handleFileSelect(event);

    } else {
        alert('File API не поддерживается данным браузером');
    }

    console.log(file);

})

.on('keyup', '.check_user', function () {

    let login = $(this).val();

    var elem = $(this);

    socket.get({action: 'check_user_exist', login: login}, function (result) {

        console.log(result);

        if (result == true) {
            elem.addClass('error_input');
            $('.submit-btn').addClass('disabled');
            $('.user_exist_label').show();
        }
        else {
            elem.removeClass('error_input');
            $('.submit-btn').removeClass('disabled');
            $('.user_exist_label').hide();
        }
    }, true);

})


;
