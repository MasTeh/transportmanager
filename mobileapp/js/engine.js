'use strict';

class App {
	constructor(params) {
		
		console.log('Starting F7, platform '+params.platform);

		if (params.platform == 'android')
			this.f7 = new Framework7({
				material: true,
				swipePanelThreshold: 300,
				swipePanel: 'left',
				animateNavBackIcon: true,
                swipePanelOnlyClose: true,
                swipePanelNoFollow: true,
				pushState: false
			});

		if (params.platform == 'ios')
			this.f7 = new Framework7({
				animateNavBackIcon: true,
				swipePanelOnlyClose: true,
				// swipePanelThreshold: 250,
				// swipePanel: 'left',
				pushState: false
			});

		this.platform = params.platform;
		this.station = params.station;

		this.mainView = this.f7.addView('.view-main', {
			dynamicNavbar: true,
			domCache: true
		});

		this.app_name 	= params.app_name;
		this.api_url 	= params.api_url;
		this.api_query 	= params.api_query;
		this.ajaxTimeout= 10000;


	}

	externalPopup(params = {})
	{

		let href = params.url;
		let self = this;

		$.get(href, {}, function(html) {
			console.log(this);
			self.f7.popup(html, true);
		});

	}


    applyTemplate(source, direction, data)
    {
        var template = $(source).html();
        var compiledTemplate = Template7.compile(template);
        var html = compiledTemplate(data);
        $(direction).html(html);
    }

    renderPage(container, data, empty_text)
    {

        if (data.length == 0) {

            $(container).find('content').html(empty_text);
        }
        else {
            var template = $(container).find('template').html();
            var compiledTemplate = Template7.compile(template);
            var html = compiledTemplate(data);
            $(container).find('content').html(html);
        }
    }



	loaderShow()
	{
		this.f7.showIndicator();
	}

	loaderHide()
	{
		this.f7.hideIndicator();
	}	

	alert(text)
	{
		this.f7.alert(text, this.app_name);
	}

	exit()
	{
		navigator.app.exitApp();
	}
}
