'use strict';

class Photos {

	constructor(params) {	  
	
		this.className = ' photos';
	  
	}

	choosePhoto(src_type) {
		function setChoosePhotoOptions(srcType) {
		    var options = {
		        quality: 100,
		        destinationType: Camera.DestinationType.FILE_URI,
		        // In this app, dynamically set the picture source, Camera or photo gallery
		        sourceType: srcType,
		        encodingType: Camera.EncodingType.JPEG,
		        mediaType: Camera.MediaType.PICTURE,
		        allowEdit: true,
		        correctOrientation: true  //Corrects Android orientation quirks
		    }
		    return options;
		}

		if (src_type=='camera')
		    var srcType = Camera.PictureSourceType.CAMERA;			
		if (src_type=='album')
		    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;

	    var options = setChoosePhotoOptions(srcType);

	    options.targetWidth = 1000;
	    options.targetHeight = 1000;


	    navigator.camera.getPicture(function cameraSuccess(imageUri) {

	        $('#form-loaded-image').html('<img src="'+imageUri+'" style="width:90%; padding:10px;" />');

	        $('.photo-remove').show();

	        $('#photo_loaded').val('1');

	    }, function cameraError(error) { 
	        
	        return false;

	    }, options);

	}

	uploadFile(fileURL, params, callback) {

	    var success = function (r) {
	        if (callback) callback();
	    }

	    var fail = function (error) {
	        app.alert("Загрузка фото не удалась, сервер недоступен. Попробуйте позже.");
	    }

	    var options = new FileUploadOptions();
	    options.fileKey = "image";
	    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
	    options.mimeType = "image/jpeg";


	    // alert(params.ad_id); alert(params.action); alert(params.user_id); 

	    options.params = params;

	    var ft = new FileTransfer();
	    // SERVER must be a URL that can handle the request, like
	    // http://some.server.com/upload.php
	    ft.upload(fileURL, encodeURI(app.api_query), success, fail, options);
	}

	loadUserPhoto(params, callback)
	{


		var file_url = $('.form-loaded-image').find('img').attr('src');

		app.uploadFile(file_url, params, function() {
		
			callback();

		});

	}

	addPhotoCamera(params = {}, callback)
	{
		let direction = params.direction;

		app.choosePhoto("camera", function(imageUri) {

	        $(direction).find('.form-loaded-image').html('<img src="'+imageUri+'" style="width:90%; padding:10px;" />');
	        $(direction).find('.photo-remove').show();
	        $(direction).find('.photo_loaded').val('1');
		});
	}

	clearPhotoCamera(params = {}, callback)
	{
		let direction = params.direction;

		$(direction).find('.form-loaded-image').html('');
		$(direction).find('.photo_loaded').val('0');

	}

	onPhotoAddButton(params = {})
	{
		var buttons = [
	        {
	            text: 'С фотокамеры'            
	        },
	        {
	            text: 'Из альбома'
	        }
	    ];

	    var button_cancel = [
	        {
	            text: 'Отмена',
	            color: 'red'
	        }
	    ];

	    app.f7.actions([buttons, button_cancel]);

	}

}