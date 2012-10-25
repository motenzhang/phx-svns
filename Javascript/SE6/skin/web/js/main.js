jQuery(function () {
	var URLCONF={webroot:"/"};
    var router;
    //fix url#hash.within ie||chrome.
    var url = document.location.href;
    url = url.split("#");
    var hash = url[1] || "";
    url = url[0];
	var webroot="";
    var paths;
    if (true || $.browser.msie||typeof history.pushState=="undefined") {
        url = url.split(URLCONF['webroot']);
		webroot=url[0];
		url=url[1];
        paths = url.split("/");
        if (paths.length == 2) {
            document.location.href = webroot+URLCONF['webroot']+"home#" + url;
        } else {
        }
        router = new Router();
        Backbone.history.start({ root:URLCONF['webroot']});
    } else {
		webroot=url.split(URLCONF['webroot'])[0];
        if (hash) {			
			document.location.href = webroot+URLCONF['webroot'] + hash;
        } else {
            router = new Router();
			Backbone.history.start({pushState:true, root:URLCONF['webroot']});
        }
    }
    window.router = router;    

	$('.router').live('click', function(){
		var path = $(this).attr('path');
		router.path = path || '';
		router.navigate(router.path + '/' + router.sortby, {trigger:true});
	});
	$('.sort').live('click', function(){
		var sortby = $(this).attr('sortby');
		router.sortby = sortby || '';
		router.navigate(router.path + '/' + router.sortby, {trigger:true});
	});


	$(function () {
		nav();
		$("#slides").slides({
			effect : 'fade',
			fadeEasing :'easeInOutSine'
		});
		//skinMutual();
	});
	
	$('.myskin>li').hover(function(){
		$(this).addClass('hover');
	}, function(){
		$(this).removeClass('hover');
	});
	
	/*function skinMutual() {
		var $skinList = $(".skin-lists li"),
		$aTarget = $skinList.find("p a");
		$skinList.each(function (idx) {
			$(this).click(function () {
				dialog("#dialog02");
			});
		});
		$aTarget.click(function (e) {
			e.stopPropagation();
		});
	};*/
		
	function nav() {
		var $liCur = $(".nav-box ul li.cur"),
			curP = $liCur.position().left,
			curW = $liCur.outerWidth(true),
			$slider = $(".nav-line"),
			$targetEle = $(".nav-box ul li:not('.last') a"),
			$navBox = $(".nav-box");
		$slider.stop(true, true).animate({
			"left" : curP,
			"width" : curW
		});
		$targetEle.mouseenter(function () {
			var $_parent = $(this).parent(),
			_width = $_parent.outerWidth(true),
			posL = $_parent.position().left;
			$slider.stop(true, true).animate({
				"left" : posL,
				"width" : _width
			}, "fast");
		});
		$navBox.mouseleave(function (cur, wid) {
			cur = curP;
			wid = curW;
			$slider.stop(true, true).animate({
				"left" : cur,
				"width" : wid
			}, "fast");
		});
	};
});

var Router = Backbone.Router.extend({
	path: 'home',
	sortby: 'hot',
	routes:{
		"home": 'showIndex',
		"classic": 'showClassic',
		"home/:sort": 'showIndex',
		"classic/:sort": 'showClassic',
		"detail/:app_key":"showDetail",
		"*actions":"defaultRoute"
	},
	initialize:function () {
	},
	showIndex: function(sort) {
		sort = sort || this.sortby;
		alert(['index', sort]);
		$('.router').removeClass('cur');
		$('.router[path=home]').addClass('cur');
	},
	showClassic: function(sort) {
		sort = sort || this.sortby;
		alert(['classic', sort]);
		$('.router').removeClass('cur');
		$('.router[path=classic]').addClass('cur');
	},
	showCategory:function (type) {
	},
	loadData: function(type) {
	},
	showDetail:function (app_key) {
	},
	defaultRoute:function (actions) {
		this.navigate('home', {trigger:true});
	}
});		