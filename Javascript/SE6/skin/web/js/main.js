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

	se6api.GetSID(function(){
		User.update();
		$('.login-btn').live('click', function(){
			se6api.Login(function(){
				User.update();
			});
		});
	});

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
	$('.showdetail').live('click', function(){
		Detail.show($(this).attr('key'));
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
		var $liCur = $(".nav-box>ul>li.cur"),
			curP = $liCur.position().left,
			curW = $liCur.outerWidth(true),
			$slider = $(".nav-line"),
			$targetEle = $(".nav-box>ul>li:not('.last')"),
			$navBox = $(".nav-box");
		$slider.stop(true, true).animate({
			"left" : curP,
			"width" : curW
		});
		$targetEle.mouseenter(function () {
			var $_parent = $(this);//.parent(),
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
		$('.router').removeClass('cur');
		$('.router[path=home]').addClass('cur');
		
		DataSource.get('all', sort);
	},
	showClassic: function(sort) {
		sort = sort || this.sortby;
		$('.router').removeClass('cur');
		$('.router[path=classic]').addClass('cur');

		DataSource.get('classic', sort);
	},
	showDetail:function (id) {
	},
	defaultRoute:function (actions) {
		this.navigate('home', {trigger:true});
	}
});

var User = {
	update: function(){
		se6api.IsLogin(function(islogin){
			if (islogin) {
				se6api.GetUserName(function(username){
					$('.username').html(username);
					//alert(username);
					// 加载我试用过的皮肤
				});
				$('.unlogin').hide();
				$('.logined').show();
			} else {
				$('.unlogin').show();
				$('.logined').hide();
			}
		});
	}
};

var DataSource = {
	get: function(type, sort){
		$.getJSON('ajax/skin_' + type + '_' + sort + '.txt', function(ret){
			alert(ret)
		});
	}
};

var Detail = {
	show: function(id) {
		dialog('#dialog02');
	}
}

function dialog(id){
	if( !$(".dialog-bg").length && !$(id).length){
		return ;
	}
	var $doc = $("body",document),
		$dialogWarp = $(".dialog-bg"),
		$dialog = $(id),
		$dialogCont = $(".dialog-cont"),
		$clsBtn = $("#closed-btn"),
		maxH = $doc.height(),
		posL = 425,
		posT = $(".dialog-cont").height()/2,
		w = 850, 
		h = $(".dialog-cont").height();
	//$dialogWarp.fadeOut();
	$dialogCont.hide();
	$clsBtn.hide();
	//$doc.css({"overflow":"hidden","margin-right":17});
	$dialogWarp.css({"height":maxH}).show();
	$dialog.delay(200).show().stop(true,true).animate({"width":w,"height":h,"margin-left":-posL,"margin-top":-posT},"fast","swing",function(){
		$dialogCont.show();
		$clsBtn.show();
	});
	$clsBtn.click(function(){
		$dialog.removeAttr("style");
		$doc.removeAttr("style");
		$dialogWarp.removeAttr("style").hide();
	});
	$dialogWarp.click(function(){
		$dialog.removeAttr("style");
		$doc.removeAttr("style");
		$dialogWarp.removeAttr("style").hide();
	});
};