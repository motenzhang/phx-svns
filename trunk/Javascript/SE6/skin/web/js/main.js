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
		if (!se6api.sid) {
			var ie6 = $.browser.msie && $.browser.version < 7;
			ie6 ? $('#tip').show() : $('#tip').slideDown();
			$('.login').hide();
		}
		User.update();
		window.user_update_tt = setInterval(User.update, 1000);
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
		return false;
	});
	$('.sort').live('click', function(){
		var sortby = $(this).attr('sortby');
		router.sortby = sortby || '';
		router.navigate(router.path + '/' + router.sortby, {trigger:true});
	});
	$('.showdetail').live('click', function(){
		router.navigate('detail/' + $(this).attr('key'), {trigger:true});
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
		List.init();
		Detail.init();
	},
	showIndex: function(sort) {
		sort = sort || this.sortby;
		$('.router,.sort').removeClass('cur');
		$('.router[path=home],[sortby=' + sort + ']').addClass('cur');
		
		List.show('all', sort);
	},
	showClassic: function(sort) {
		sort = sort || this.sortby;
		$('.router,.sort').removeClass('cur');
		$('.router[path=classic],[sortby=' + sort + ']').addClass('cur');

		List.show('classic', sort);
	},
	showDetail:function (id) {
		Detail.show(id);
	},
	defaultRoute:function (actions) {
		this.navigate('home', {trigger:true});
	}
});

var User = {
	update: function(){
		se6api.IsLogin(function(islogin){
			if (islogin) {
                clearInterval(user_update_tt);
				se6api.GetUserName(function(username){
					$('.username').html(username.substr(0, 15));
				});
                se6api.GetUserHeadUrl(function(url){
                    $('.headface').attr('src', url);
                });
                User.updateHistory();
				$('.unlogin').hide();
				$('.logined').show();
			} else {
				$('.unlogin').show();
				$('.logined').hide();
			}
		});
	},
    updateHistory: function(){
        se6api.GetQT(function(){
            $.getJSON('skin/?ac=history&ucq=' + encodeURIComponent(se6api._qt[0]) + '&uct=' + encodeURIComponent(se6api._qt[1]), function(ret){
                if (ret && ret.skinids) {
                    var arr = ret.skinids.slice(0, 5);
                    if (List.SkinData) {
                        User.showHistory(arr);
                    } else {
                        $.getJSON('cf/order_all_use.html', function(ret){
                            List.SkinData = ret;
                            User.showHistory(arr);
                        });
                    }
                }
            });
        });
    },
    showHistory: function(arr){
        $('.myskin').empty();
        $.each(arr, function(i, id){
            var item = List.SkinData[id];
            var el = _.template($('#myskin-item').html())(item);
            $('.myskin').append(el);
        });
    }
};

var List = {
	SkinData:null,
	init: function(){
		$('.install-skin').live('click', function(){
			if (!se6api.IsSE6()) {
				window.open('http://se.360.cn/v6');
				return false;
			}
			$(this).hide().next().show();
			$(this).prevAll('.num').hide();
			$(this).prevAll('.error').html('加载中...').addClass('normal').show();
			var id = $(this).attr('key');
			var skinversion = $(this).attr('ver');
			var skinurl = $(this).attr('skinurl');
			se6api.InstallSkin(id, skinversion, skinurl, function(code, ret_id){
				if (ret_id)	id = ret_id;
				var btn = $('.install-skin[key='+id+']');
				switch (code) {
					case 1:
                        $.get('skin/?ac=use&sid=' + id + '&ucq=' + encodeURIComponent(se6api._qt[0]) + '&uct=' + encodeURIComponent(se6api._qt[1]), function(){
                            User.updateHistory();
                        });
						//btn.html('安装成功');
						btn.prevAll('.error').hide();
						btn.prevAll('.num').show();
						break;
					case 0:
						btn.prevAll('.error').removeClass('normal').html('安装失败');
						break;
					case -1:	// 取消
						btn.prevAll('.error').hide();
						btn.prevAll('.num').show();
						break;
					case -2:	// 超时
						btn.prevAll('.error').removeClass('normal').html('加载失败');
						break;
				}
				btn.show().next().hide();
			});
			return false;
		});
	},
	orderby: {'hot':'use', 'new':'dateline'},
	show: function(type, sort){
		$.getJSON('cf/order_' + type + '_' + this.orderby[sort] + '.html', function(ret){
			if (type == 'all') {
				List.SkinData = ret;
			}
			var arr = [];
			$.each(ret, function(i, item){
				arr.push(item);
			});
			arr.sort(function(x, y){
				switch(sort) {
					case 'hot':
						return parseInt(y.num) - parseInt(x.num);
						break;
					default:
						if (x.dateline < y.dateline) {
							return 1;
						} else if (x.dateline > y.dateline) {
							return -1;
						} else {
							return 0;
						}
						break;
				}
			});
			var list = $('#skin-list');
			list.empty();
			$.each(arr, function(i, item){
				//console.log(item);
				var el = _.template($('#skin-item').html())(item);
				list.append(el);
				if (!se6api.IsSE6()) {
					$('.install-skin').addClass('notse6');
				}
			});
		});
	}
};

var Detail = {
	init: function(){
		$('.dialog-bg, #closed-btn').live('click', function(){
			$('.dialog-bg').hide();
			$('.dialog').removeAttr("style");
			router.navigate(router.path + '/' + router.sortby, {trigger:true});
		});
	},
	show: function(id) {
		if (List.SkinData) {
			Detail.render(id);
		} else {
			$.getJSON('cf/order_all_use.html', function(ret){
				List.SkinData = ret;
				Detail.render(id);
			});
		}
	},
	render: function(id) {
		var item = List.SkinData[id];
		$('.dialog-cont').html(_.template($('#skin-detail').html())(item));
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
	var top = Math.max($(window).scrollTop() + $(window).height() / 2, 282);
	//$dialogWarp.fadeOut();
	$dialogCont.hide();
	$clsBtn.hide();
	//$doc.css({"overflow":"hidden","margin-right":17});
	$dialogWarp.css({"height":maxH}).show();
	$dialog.delay(200).show().stop(true,true).animate({"width":w,"height":h,"margin-left":-posL,"margin-top":-posT, "top":top},"fast","swing",function(){
		$dialogCont.show();
		$clsBtn.show();
	});
	/*$clsBtn.click(function(){
		$dialog.removeAttr("style");
		$doc.removeAttr("style");
		$dialogWarp.removeAttr("style").hide();
	});
	$dialogWarp.click(function(){
		$dialog.removeAttr("style");
		$doc.removeAttr("style");
		$dialogWarp.removeAttr("style").hide();
	});*/
};