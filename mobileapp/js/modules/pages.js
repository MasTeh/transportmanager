
app.f7.onPageBeforeAnimation('users_admin', function(page) {

    var container = $(page.container);
    socket.get({action: 'get_users'}, function (users) {


        myapp.all_users = arrayIndexById(users);

        app.renderPage(container, users, "Нет никого");

    });

});

app.f7.onPageInit('add_user', function(page) {

    var container = $(page.container);


    if (page.query.id != undefined)
        setTimeout(function () {

            let id = Number(page.query.id);

            app.f7.formFromData('#add_user', myapp.all_users[id]);

            container.find('input[name=is_update]').val(id);
            container.find('.submit-btn').html('Сохранить');
            container.find('input[name=login]').attr('disabled', 'disabled');

        }, 200);

});


app.f7.onPageBeforeAnimation('transport_admin', function(page) {

    var container = $(page.container);
    socket.get({action: 'get_admin_transports'}, function (transport) {

        console.log(transport);

        myapp.all_transports = arrayIndexById(transport);

        app.renderPage(container, transport, "Нет транспорта");

    });

});

app.f7.onPageBeforeAnimation('drivers_admin', function(page) {

    var container = $(page.container);
    socket.get({action: 'get_drivers'}, function (drivers) {

        console.log(drivers);

        myapp.all_drivers = arrayIndexById(drivers);

        app.renderPage(container, drivers, "Нет транспорта");

    });

});

app.f7.onPageInit('add_driver', function(page) {

    var container = $(page.container);


    if (page.query.id != undefined)
        setTimeout(function () {

            let id = Number(page.query.id);

            app.f7.formFromData('#add_driver', myapp.all_drivers[id]);

            container.find('input[name=is_update]').val(id);
            container.find('.submit-btn').html('Сохранить');
            container.find('input[name=login]').attr('disabled', 'disabled');

        }, 200);

});

app.f7.onPageInit('add_transport', function(page) {

    var container = $(page.container);



    socket.get({action: 'get_transport_companies'}, function (companies) {
        $.each(companies, function (i, item) {
            let sel_item = '<option value="'+item.id+'">'+item.name+'</option>';
            container.find('select[name=company_id]').append(sel_item);
        });
    });

    socket.get({action: 'get_drivers'}, function (drivers) {
        $.each(drivers, function (i, item) {
            let dr_item = '<option value="'+item.id+'">' +item.name+ ' ' +item.fam+ '</option>';
            container.find('select[name=driver_id]').append(dr_item);
        });
    });

    if (page.query.id != undefined)
    setTimeout(function () {

        let id = Number(page.query.id);

        app.f7.formFromData('#add_transport', myapp.all_transports[id]);

        container.find('input[name=is_update]').val(id);
        container.find('.submit-btn').html('Сохранить');

    }, 200);

});


app.f7.onPageInit('add_order', function(page) {

	var form = $(page.container);


    if (page.query.id == undefined)
    setTimeout(function () {


        form.find('.phone_mask').inputmask("mask", {"mask": "9(999) 999-99-99"});

        form.find('select[name=order_num]').val(page.query.order_num);
        form.find('select[name=transport_id]').val(page.query.tr_id);
        form.find('input[name=date]').val(page.query.date);


    }, 250);

	socket.get({action: 'get_companies'}, function (companies) {

		myapp.clients_companies = arrayIndexById(companies);


		$.each(companies, function (i, item) {

			let select_item = '<option value="'+item.id+'">'+item.name+'</option>';
			form.find('select[name=company_id]').append(select_item);

        });

    });

    socket.get({action: 'get_transports'}, function (transports) {

        console.log(transports);

        myapp.transports = arrayIndexById(transports);


        $.each(transports, function (i, item) {

            let select_item = '<option value="'+item.id+'">'+item.number+'</option>';
            form.find('select[name=transport_id]').append(select_item);

        });

    });

    socket.get({action: 'get_drivers'}, function (companies) {

        myapp.drivers = arrayIndexById(companies);


        $.each(companies, function (i, item) {

            let select_item = '<option value="'+item.id+'">'+item.name+' '+item.fam+'</option>';
            form.find('select[name=driver_id]').append(select_item);

        });

    });

    setTimeout(function () {
        if (page.query.id != undefined) {

            socket.get({action: 'get_order', id: page.query.id}, function (order) {

                console.log(order);

                $('input[name=is_update]').val(page.query.id);
                $('.submit-btn').html('Сохранить');

                app.f7.formFromData('#add_order', order);

                myapp.current_transport_selected =  order.transport_id;
                myapp.current_date_selected =       order.date;
                myapp.current_order_num_selected =  order.order_num;


            }, true);
        }
    }, 500);




});


app.f7.onPageBeforeAnimation('order', function(page) {

    if (myapp.user.type == 1)
        setTimeout(function () {
        $('.manager-block').show();
    }, 300);
    else
        setTimeout(function () {
            $('.manager-block').remove();
        }, 300);



    if (page.query.id != undefined) {

		setTimeout(function () {




            if (Number(myapp.user.type) == 2) {



                $(page.container).find('.driver-zone').show();
                $(page.container).find('.manager-zone').hide();
            }

            if (Number(myapp.user.type) == 1) {

                $(page.container).find('.driver-zone').hide();
                $(page.container).find('.manager-zone').show();
            }

        }, 300);

        socket.get({action: 'get_order', id: page.query.id}, function (order) {

            console.log(order);

        	app.renderPage('#order', order, 'Заявка не найдена');

        	$(page.container).find('.navbar-text').html('Заявка № '+order.id);

        	myapp.photos_view = [];


            socket.get({action: 'get_photos', order_id: page.query.id}, function (photos) {
                $.each(photos, function (i, photo) {
                    myapp.photos_view.push(photo.photo);
                    $('.order_images').append(
                        '<div photo-id="'+ photo.id +'" style="float: left; margin-top: 20px">' +
                        '<a href="'+photo.photo+'" photo-id="'+ i +'" class="order-photo"><img src="'+ photo.photo500 +'"></a>' +
                        '<br><a href="#" photo-id="'+photo.id+'" class="button remove_photo">Удалить фото</a></div>');
                });

                var photoBrowser = app.f7.photoBrowser({
                    photos: myapp.photos_view
                });

                $('.order-photo').click(function () {
                    photoBrowser.open($(this).attr('photo-index'));
                });

            }, true);

        }, true);

    }

});

$(document)

.on('click', '.remove_photo', function () {

    let photo_id = $(this).attr('photo-id');

    let elem = $(this);

    socket.get({action: 'remove_photo', photo_id: photo_id});

    $('.order_images').find('div[photo-id='+photo_id+']').remove();

});