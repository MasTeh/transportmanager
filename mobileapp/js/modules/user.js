'use strict';

class User {

    constructor(params) {

        this.logged = false;
        this.data = {};
        this.id = null;


    }



    login(user, callback) {

        this.user_id = user['id'];
        this.data = user;

        window.localStorage.setItem('hash', user.password);
        window.localStorage.setItem('user_id', user.id);

        this.onesignal_turn_on();

        $('.lk-hidden').show();

        this.logged = true;

        if (callback) callback();


    }


    logout() {
        this.user_id = 0;
        this.data = {};
        this.logged = false;

        this.onesignal_turn_off();

        window.localStorage.removeItem('user_id');
        window.localStorage.removeItem('hash');

        $('.lk-hidden').hide();


        location.reload();

    }

    onesignal_turn_on() {

    }

    onesignal_turn_off() {

    }

    autologin(callback) {

        if (window.localStorage.getItem('user_id')!=null)
        {
            var _id = window.localStorage.getItem('user_id');
            var _pas= window.localStorage.getItem('hash');

            if (_id == 'undefined') this.logout();


            console.log('login action: '+_id+' hash: '+_pas);

            let self = this;

            socket.get({action: 'get_user_by_hash', user_id: _id, hash: _pas}, function (result) {

				console.log(result);

                let output;
                if (typeof(result) == 'object')
                    output = result;
                else
                    output = JSON.parse(result);

                console.log(output);

                if (output.response == 'denied') {
                    console.log('access denied');
                    self.logout();
                    self.autologin();
                }

                else if (output.response == 'ok') {
                    console.log('auth soccess');

                    self.login(output.user, function () {
                        console.log('logged user:');
                        console.log(self.data);

                        self.afterLogin();

                        if (callback) callback();
                    });
                }
            }, true, false);


        }
        else {
            this.onLoginButton();
        }

    }

    onLoginButton() {

        console.log('login');
    	app.f7.popup('.login');


    }

    loginAction() {

        let login = $('#login_form').find('input[name=login]').val();
        let password = $('#login_form').find('input[name=password]').val();

        var self = this;

        socket.get({action: 'login', login: login, password: password}, function (result) {

            var output = JSON.parse(result);

            console.log(output);

            if (output.response == 'denied') {
                console.log('access denied');

                app.alert("Пользователь с данным номером телефона или паролем не найден.");
            }

            else if (output.response == 'ok') {
                console.log('auth soccess');

                self.login(output.user, function () {
                    console.log('logged user:');
                    console.log(self.data);

                    window.localStorage.setItem('hash', output.user.password);
                    window.localStorage.setItem('user_id', output.user.id);

                    self.afterLogin();

                    app.f7.closeModal();
                });
            }
        }, true, false);
    }

    afterLogin() {

        $('.lk-hidden').show();

        myapp.user = user.data;


        if (Number(user.data.type) == 2) {

            Template7.global = {
                is_manager: false
            };

            $('.subnavbar').hide();
            $('.toolbar').hide();
            $('.desk-zone').hide();

            $('.driver-zone').show();
            $('.add-order-button').hide();

            $('.manager-button').remove();



            orders.getDriverOrders();


        }

        if (Number(user.data.type) == 1) {

            Template7.global = {
                is_manager: true
            };



            if (app.station == 'desktop')
                orders.getOrdersDesktop();
            else
                orders.getOrders();

            $('.driver-zone').hide();
        }

	}

    onProfileButton() {

        if (this.logged) {
            if (app.platform == 'ios') app.mainView.router.load({url: 'profile.ios.html'});
            else app.mainView.router.load({url: 'profile.html'});
        }
        else {
            this.onLoginButton();
        }
    }


    updateProfile() {

        let form_data = app.f7.formToData($('#profile_form'));

        form_data.phone = normalizePhone2(form_data.phone);

        if (form_data.password1 != '') {
            if (form_data.password1 != form_data.password2) {
                app.alert("Новый пароль не совпадает с проверочным");
                return false;
            }
            else {
                form_data.password = form_data.password1;
            }
        }

        delete(form_data.password1);
        delete(form_data.password2);

        var self = this;

        socket.get({action: 'update_profile', user_id: user.user_id, user: form_data}, function (result) {
            console.log(result);

            self.autologin();

            app.alert("Профайл успешно обновлен");
        });

        console.log(form_data);


    }


    forgotButton(params = {})
    {

        app.f7.prompt('Введите ваш E-Mail или номер телефона', 'Восстановление доступа', function(login) {

            $.get(app.api_query, {'action':'restore_password', 'login':login},
                function(result) {
                    console.log(result);

                    if (result.status=='ok')
                        app.f7.alert("Новый пароль прислан SMS-сообщением и на ваш E-Mail", "Пароль изменён");
                    else
                        app.f7.alert("Пользователь с такими данными не найден", "Восстановление доступа");
                }, 'html');
        });

    }

    addUser() {

        let data = app.f7.formToData('#add_user');

        if (data.login.length < 5) {
            app.alert('Логин не менее 5 символов в длинну');
            return false;
        }

        if (data.password.length < 5) {
            app.alert('Пароль не менее 5 символов в длинну');
            return false;
        }

        data.type = 1;

        socket.get({action: 'add_user', user: data}, function () {

        });

        app.mainView.router.back();

        console.log(data);

    }

}