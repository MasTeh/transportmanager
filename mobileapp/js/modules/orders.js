'use strict';

class Orders {

	constructor(params) {

	    this.weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб','Вс'];

	}

	
	addOrder() {

		var form_data = app.f7.formToData('#add_order');
		var error = '';

		if (form_data.company_name == '') error += 'Нет названия компании заказчика<br>';
        if (form_data.load_address == '') error += 'Нет адреса загрузки<br>';
        if (form_data.unload_address == '') error += 'Нет адреса выгрузки<br>';
        if (form_data.load_phone == '') error += 'Нет телефона места загрузки<br>';
        if (form_data.unload_phone == '') error += 'Нет телефона места выгрузки<br>';
        if (form_data.cargo_type == '') error += 'Не указан тип груза<br>';
        if (form_data.cargo_desc == '') error += 'Не указан состав груза<br>';
        
        if (error != '') {
        	
        	app.alert(error);
        	//$('#add_order').find('.error').html(error).show();
        	
        	return false;
		}


        var self = this;

        form_data.manager_id = myapp.user.id;

        var order_keydata_changed = false;

        if (myapp.current_transport_selected != form_data.transport_id) order_keydata_changed = true;
        if (myapp.current_date_selected      != form_data.date)         order_keydata_changed = true;
        if (myapp.current_order_num_selected != form_data.order_num)    order_keydata_changed = true;

        console.log(form_data);

        socket.get({
                action: 'check_order_exist',
                date: form_data.date,
                transport_id: form_data.transport_id,
                order_num: form_data.order_num
            },
            function (exist) {

                if (exist == true && order_keydata_changed == true) {

                    app.alert('Место заявки либо занято, либо на эту машину и на эту дату уже поставлено 4 заявки. Не расстраивайтесь...');

                }
                else {

                    socket.get({action: 'add_order', order: form_data}, function (insertId) {
                        console.log(insertId);

                        app.mainView.router.back();

                        delete(myapp.current_transport_selected);
                        delete(myapp.current_date_selected);
                        delete(myapp.current_order_num_selected);

                        self.getOrders();

                    }, true);
                }

            }, true);



	}

	changePage(direction) {


        var self = this;


        let current_date = $('#current_date').val();
        let next_date = '';
        let prev_date = '';


        current_date = moment(current_date).format('x');

        let increment = 1000*60*60*24;

        if (app.station == 'desktop') increment = increment*7;

        prev_date = Number(current_date) - increment;
        next_date = Number(current_date) + increment;

        let new_date1 = new Date(Number(prev_date));
        let new_date2 = new Date(Number(next_date));
        let cur_date = new Date(Number(current_date));

        let new_date1_str = moment(new_date1).format('YYYY-MM-DD');
        let new_date2_str = moment(new_date2).format('YYYY-MM-DD');

        let new_date_now_str = moment(cur_date).format('YYYY-MM-DD');

        if (direction == 'back') {

            $('#current_date').val(new_date1_str);
            if (app.station != 'desktop') $('#day_of_week').html(new_date1.toLocaleString('ru', {weekday: 'long'}));

            self.loadDesk(new_date1_str, 'middle', function () {
                if (app.station == 'desktop')
                    self.getOrdersDesktop();
                else
                    self.renderOrders();
            });
        }

        if (direction == 'forward') {

            $('#current_date').val(new_date2_str);
            if (app.station != 'desktop') $('#day_of_week').html(new_date2.toLocaleString('ru', {weekday: 'long'}));

            self.loadDesk(new_date2_str, 'middle', function () {
                if (app.station == 'desktop')
                    self.getOrdersDesktop();
                else
                    self.renderOrders();
            });
        }

	}

	getOrdersDesktop() {

        var self = this;

        myapp.desk = [];


        let current_date = $('#current_date').val();

        let now = new Date();


        if (current_date=='') {

            current_date = now.toISOString().substring(0, 10);
        }


        let week_days = [];

        let stamp = Number(moment(current_date).format('x'));

        let weekday = new Date(stamp).getDay();

        for (let i = weekday-1; i >= 0; i--) {

            let new_stamp = stamp - Number(1000*60*60*24*i);

            week_days.push(new_stamp);

        }

        for (let i = 1; i <= 7 - weekday; i++) {

            let new_stamp = Number(stamp) + Number(1000*60*60*24*i);

            week_days.push(new_stamp);
        }

        let week_dates = [];
        for (let i = 0; i <= 6; i++) {
            let new_date = new Date(Number(week_days[i]));
            new_date = moment(new_date).format('YYYY-MM-DD');

            let str_date = moment(new_date).format('DD.MM') + ' ' + this.weekdays[i];

            week_dates.push({
                    'date1' : new_date,
                    'date2' : str_date
                });
        }

        console.log(week_dates);


        let cur_date = moment(current_date).format('YYYY-MM-DD');


        $('#current_date').val(cur_date);

        var desks = [];

        $.each(week_dates, function (i, item) {

            self.loadDesk(item.date1, 'middle', function () {


                desks.push(myapp.desk[0]);

            });

            if (i == (week_dates.length -1)) {

                myapp.desks = desks;

                console.log('DEEEEEEEEEEEEEEEEEEEEEEEEEEESK');
                console.log(desks);

                setTimeout(function () {
                    self.renderDesktopOrders();
                }, 500);

            }

        });



    }

    renderDesktopOrders() {

        var slides_html = '';
        var self = this;

        console.log(myapp.desks);
        let compiledTemplate = Template7.compile(myapp.desk_template);
        let html = compiledTemplate(myapp.desks);
        slides_html = html;

        $('.desk-zone').html(slides_html);

    }

	getOrders() {

		var self = this;

        myapp.desk = [];


		let current_date = $('#current_date').val();
		let next_date = '';
		let prev_date = '';
        let now = new Date();


		if (current_date=='') {

            current_date = now.toISOString().substring(0, 10);
        }


        current_date = moment(current_date).format('x');

        prev_date = Number(current_date) - 1000*60*60*24;
        next_date = Number(current_date) + 1000*60*60*24;

        let new_date1 = new Date(Number(prev_date));
        let new_date2 = new Date(Number(next_date));
        let cur_date = new Date(Number(current_date));



        let new_date1_str = moment(new_date1).format('YYYY-MM-DD');
        let new_date2_str = moment(new_date2).format('YYYY-MM-DD');

        let new_date_now_str = moment(cur_date).format('YYYY-MM-DD');


		console.log('DATES');
		console.log(new_date1_str);
        console.log(new_date_now_str);
        console.log(new_date2_str);

		$('#current_date').val(new_date_now_str);
		$('#day_of_week').html(cur_date.toLocaleString('ru', {weekday: 'long'}));


        self.loadDesk(new_date_now_str, 'middle', function () {
			self.renderOrders();
        });


	}

	loadDesk(date, side = 'middle', callback) {

		var self = this;


        socket.get({action: 'get_orders', date: date}, function (orders) {

            console.log('orders JSON');
            console.log(orders);

            //return false;

            var desk = [];

            $.each(orders, function (date, slide) {

                var date_arr = date.split('/');
                var new_slide = slide;



                $.each(slide, function (car_number, car_insets) {

                    let insets = [];
                    for (let m=0; m < 4; m++) {

                            let inset = {
                                is_empty: true,
                                date: date_arr[3]+'-'+date_arr[2]+'-'+date_arr[1],
                                transport_id: car_insets.transport.id,
                                transport_name: car_insets.transport.number
                            };
                            insets.push(inset);


                    }

                    for (let m=0; m < 4; m++) {
                        if (car_insets.items[m] != undefined) {
                            let inset = car_insets.items[m];
                            inset.is_empty = false;

                            insets[inset.order_num] = inset;

                        }
                    }



                    new_slide[car_number].insets = insets;

                    
                    $.each(new_slide, function (car_num, item) {

                        if (item.items.length == 0) delete(new_slide[car_num]);
                        
                    });


                });

                let desk_item = {date:date_arr, slide: new_slide};


                myapp.desk = [desk_item];
                //if (side == 'left') 	myapp.desk.pop(desk_item);
                //if (side == 'right') 	myapp.desk.push(desk_item);


            });


			if (callback) callback();


        }, true);
	}

	renderOrders() {

		var slides_html = '';
		var self = this;

		$.each(myapp.desk, function (i, slide) {

            let compiledTemplate = Template7.compile(myapp.desk_template);
            let html = compiledTemplate(slide);
            slides_html += html;

            if (i == (myapp.desk.length-1)) {

                $('.desk-zone').html(slides_html);

                myapp.swiper_index = 0;

			}

        });

	}

	getDriverOrders() {

		if (myapp.driver_template == undefined) {
            myapp.driver_template = $('.driver-template').html();
            $('.driver-template').remove();
        }

		socket.get({action: 'get_driver_orders', driver_id: user.data.driver_id}, function (orders) {

			console.log(orders);

			$.each(orders.items, function (date, insets) {
				$.each(insets, function (i, insets2) {


					if (Number(insets2.status) == 1 || Number(insets2.status) == 3) {
                        myapp.active_order = insets2.id;
                        console.log('active order');
                        console.log(myapp.active_order);
                    }

                });
            });

            let compiledTemplate = Template7.compile(myapp.driver_template);
            let html = compiledTemplate(orders);

            $('.driver-zone').html(html);

        }, true);
	}

	addTransport() {

	    let data = app.f7.formToData('#add_transport');



        if (data.number == '') {
            app.alert('Не указан номер транспорта');
            return false;
        }

        if (data.model == '') {
            app.alert('Не указана модель');
            return false;
        }

	    data.active = 1;

	    socket.get({action: 'add_transport', transport: data}, function () {
           app.mainView.router.back();

        });

	    console.log(data);

    }

    addDriver() {

        let data = app.f7.formToData('#add_driver');

        let user = {login: data.login, password: data.password, type: 2};

        delete(data.login);
        delete(data.password);

        if (user.login.length < 5) {
            app.alert('Логин не менее 5 символов в длинну');
            return false;
        }

        if (user.password.length < 5) {
            app.alert('Пароль не менее 5 символов в длинну');
            return false;
        }

        if (data.phone == '') {
            app.alert('Не указан номер телефона');
            return false;
        }

        if (data.name == '') {
            app.alert('Имя не указано');
            return false;
        }


        socket.get({action: 'add_driver', driver: data, user:user}, function () {
            app.mainView.router.back();

        });

        console.log(data);

    }

    changePrice1(order_id) {

	    app.f7.prompt("Укажите новую цену (только цифры)", "Смена цены", function (text) {
            let price = Number(text);

            console.log(price);

            if (Number.isNaN(price)) {
                app.alert('Некорректное число, не надо писать лишние символы, только числа, мы же не хотим чтобы у нас база вылетела');
                return false;
            }

            if (text == '') { return false; }

            socket.get({action: 'change_order_sum', order_id:order_id, price: price}, function () {
                $('.hour_price_label').html(price+' руб');
            });
        });
    }

    changePrice2(order_id) {

        app.f7.prompt("Укажите новую цену (только цифры)", "Смена цены", function (text) {
            let price = Number(text);

            console.log(price);

            if (Number.isNaN(price)) {
                app.alert('Некорректное число, не надо писать лишние символы, только числа, мы же не хотим чтобы у нас база вылетела');
                return false;
            }

            if (text == '') { return false; }

            socket.get({action: 'change_order_price', order_id:order_id, price: price}, function () {
                $('.hour_price_label').html(price+' руб/час');
            });
        });
    }

    removeItem(owner, id, callback) {

	    socket.get({action: 'remove_item', owner: owner, item_id: id}, function () {
            if (callback) callback();
        });
    }

	start(id) {

		var self = this;

        if (myapp.active_order != 0) {
            app.alert('У вас сейчас не закрыта заявка № '+myapp.active_order);
            return false;
        }

		app.f7.confirm('Начать выполнение заявки?', 'Подтверждение', function () {


			socket.get({action: 'start_order', id: id},
				function(result) {

                	app.mainView.router.back();

                    self.getDriverOrders();


            }, true);
        });
	}

    finish(id) {

        var self = this;

        app.f7.confirm('Завершить выполнение заявки?', 'Подтверждение', function () {


            socket.get({action: 'end_order', id: id},
                function(result) {

                    app.mainView.router.back();

                    myapp.active_order = 0;

                    self.getDriverOrders();


                }, true);
        });
    }

    problem(id) {

        var self = this;

        app.f7.prompt('В чем возникла проблема?', 'Отчёт', function (text) {

            socket.get({action: 'problem_order', id: id, problem: text},
                function(result) {

                    app.mainView.router.back();

                    self.getDriverOrders();


                }, true);

        });

    }

}