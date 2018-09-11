$(document)



.on('click', '.logout_link', function() {
	
	fr7.closePanel();
	mainView.router.back();
	myapp.logout();


})

.on('click', '.login_button', function() {

	var login = $('#login_form').find('input[name=login]').val();
	var password = $('#login_form').find('input[name=password]').val();

	if (login == '' || password == '') return false;

	  $.ajax({
	      type: 'GET',
	      url: app.api_query,
	      data: {'action':'login', 'login':login, 'password':password},
	      success: function(result)
	      {  

	      	if (result != '0')
	      	{

	      		myapp.login(result, function() {

					fr7.closeModal();

	      		});
					      		

			}
			else {
				
				console.log('password incorrect');
				app.alert('Некорректный номер или пароль');
				
			}

	      },
	      error: function(xmr, msg) {
			
			console.log('ajax error: '+msg);
	      	app.alert('Нет связи с Интернет');	      	
	          
	      }
	   });

})

.on('click', '.profile-link', function() {

	if (myapp.logged) { 

		if (platform_name=='ios')
			mainView.router.load({url: 'profile.ios.html'});
		else
			mainView.router.load({url: 'profile.html'});
	}
	else fr7.popup('.login');
})



.on('click', '.add-photo-button1', function() {

	app.choosePhoto("camera");

})

.on('click', '.add-photo-button2', function() {

	app.choosePhoto("album");

})





.on('click', '.register_next_button0', function() {

	console.log('To step 2');


	myapp.registerSwiper.slideNext();

	$('#register').find('.prev-slide').show();

})


.on('click', '.reg_step0', function() {


	myapp.registerSwiper.slideNext();

})

.on('click', '.reg_step1', function() {

	$('#register').find('.error').html('').hide();


	var user_spec = $('#register').find('input[name=user_spec]:checked').val();

	if (user_spec == undefined)
	{
		$('#register_form1').find('.error').html('Выберите хотя бы одну специализацию').show();
		return false;
	}
	else		
	{
		$('#register_form1').find('.error').html('').hide();
		myapp.registerSwiper.slideNext();
	}

})

.on('click', '.reg_step2', function() {

	$('#register').find('.error').html('').hide();

	var error = '';
	var password1 = $('#register_form2').find('input[name=password1]').val();

    var email = $('#register_form2').find('input[name=email]').val();

    if(email != '') {
        var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
        if(!pattern.test(email)) 
        {
            error = 'E-Mail некорректен<br>';
        }
    } else {
        error = 'E-Mail не указан<br>';
    }	

	var phone = $('#register_form2').find('input[name=phone]').val();

	if (phone == '') error += 'Необходим номер телефона<br>';
	if (phone.length < 7) error += 'Номер телефона некорректен<br>';

	if (password1 == '') error += 'Необходим пароль<br>';

	if (password1.length < 8) error += 'Пароль не менее 8 символов<br>';
	
	if (password1 != $('#register_form2').find('input[name=password2]').val())
		 error += 'Пароли не совпадают<br>';

	if ($('#register_form2').find('input[name=fam]').val() == '') error += 'Необходимо указать фамилию<br>';
	if ($('#register_form2').find('input[name=name]').val() == '') error += 'Необходим указать имя';

	if (error=='')
		myapp.registerSwiper.slideNext();
	else
		$('#register_form2').find('.error').html(error).show();

})


.on('click', '.register_final_button', function() {

	$('#register').find('.error').html('').hide();


	var formData = fr7.formToData('#register');

	if (formData.no_organization.length > 0) formData.is_person = 1;
	else formData.is_person = 0;

	delete(formData.no_organization);
	console.log(formData);

	$.post(app.api_query, formData, 
		function(data) {

			if (data != 0)
			{
				myapp.login(data);
				fr7.closeModal();
				fr7.alert('Учётная запись создана. При последующих входах она будет активироваться автоматически.','Добро пожаловать', 
					function() {
						mainView.router.back();
					});

			}
			else
			{
				console.log(data);
				console.log('Register aborted');
				app.alert('Указанный вами E-Mail или номер телефона уже есть в базе');
			}
		}
	);


})

.on('click', '.slide-menu a', function() {

	fr7.closePanel();
})

.on('click', '.profile_save_button', function() {

	$('#register').find('.error').html('').hide();

	var up_data = {'action':'update_profile'};

	if ($('#profile_form').find('input[name=no_organization]').is(":checked")) 
	up_data['is_person'] = 1;

	var name = $('#profile_form').find('input[name=name]').val();
	var email = $('#profile_form').find('input[name=email]').val();
	var phone = $('#profile_form').find('input[name=phone]').val();
	var password1 = $('#profile_form').find('input[name=password1]').val();
	var password2 = $('#profile_form').find('input[name=password2]').val();
	
	if (name=='' || email=='' || phone=='') {
		app.alert("Вы не указали одно из полей: имя, email, телефон");
		return false;
	}

	if (password1 != password2) {
		app.alert("Пароли не совпадают");
		return false;
	}


	if (password1 != '') {
		if (password1.length < 8) {
			app.alert('Пароль должен быть не менее 8 символов');
			return false;
		}		
		up_data['password'] = password1;
	}

	up_data['user_id'] = myapp.user.id;

	up_data['phone'] = $('#profile_form').find('input[name=phone]').val();
	up_data['email'] = $('#profile_form').find('input[name=email]').val();
	up_data['name'] = $('#profile_form').find('input[name=name]').val();
	up_data['otch'] = $('#profile_form').find('input[name=otch]').val();
	up_data['fam'] = $('#profile_form').find('input[name=fam]').val();

	up_data['company'] = $('#profile_form').find('input[name=company]').val();
	up_data['region'] = $('#profile_form').find('input[name=region]').val();
	up_data['inn'] = $('#profile_form').find('input[name=inn]').val();
	up_data['org_phone'] = $('#profile_form').find('input[name=org_phone]').val();
	up_data['site'] = $('#profile_form').find('input[name=site]').val();


	console.log(up_data);

	$.post(app.api_query, up_data, function() {
		app.alert('Данные обновлены');
		myapp.autologin();
	});

})


.on('click', '.cart-link', function() {

	if (myapp.logged) {
		app.applyTemplate('#profile_form', myapp.user);


		if (myapp.user.is_person=='1') 
			$('#profile_form').find('.input_for_org').hide();

		app.loadAjax({'action':'get_specs'}, function(specs) {
			app.applyTemplate('#profile_specs_form', specs);
		});

		app.openPage('#profile');
	}
	else
		app.openPage('#login');

})

.on('click', '.logout_button', function() {

	myapp.logout();
	fr7.closeModal();

})

.on('click', '.category-link', function() {

	var category_name = $(this).find('.item-title').html();
	var category_id = $(this).attr('category-id');

	app.loadAjaxContent({'action':'get_ads', 'category_id':$(this).attr('category-id')}, '#ads', function()
	{

	});
})

.on('click' ,'.phonelink', function() {
	href = $(this).attr('href');    
    cordova.InAppBrowser.open(href, '_system');
})




.on('click', '.clear-photo-button', function() {

	$('#form-loaded-image').html('');

})




.on('click', '.filter-clear-button', function() {

	$('#filter').find('select').val('0');

	delete(myapp.filter1['region']);
	delete(myapp.filter1['weight']);
	delete(myapp.filter1['type']);
	delete(myapp.filter2['region']);
	delete(myapp.filter2['weight']);
	delete(myapp.filter2['type']);

	console.log('filter clear action');
	console.log(myapp.filter1);
	console.log(myapp.filter2);

	myapp.update_list();

	fr7.closeModal();

})


.on('click', '.filter-button', function() {

	filter_data = fr7.formToData('#filter');

	$.each(filter_data, function(name, value) {

		myapp.filter1[name] = value;
		myapp.filter2[name] = value;
	});

	console.log('filter action');
	console.log(myapp.filter1);
	console.log(myapp.filter2);

	fr7.closeModal();

	myapp.update_list();

	//app.loadAjaxContent({'action':'get_public_transport'}, '#main_tab1');

})





.on('click', '.forgot_button', function() {

	fr7.prompt('Введите ваш E-Mail или номер телефона', 'Восстановление доступа', function(login) {
		
		$.get(app.api_query, {'action':'restore_password', 'login':login},
			function(result) {
				if (result.status=='ok')
					fr7.alert("Новый пароль прислан SMS-сообщением", "Пароль изменён");				
				else
					fr7.alert("Пользователь с такими данными не найден", "Восстановление доступа");
			});
	});
});