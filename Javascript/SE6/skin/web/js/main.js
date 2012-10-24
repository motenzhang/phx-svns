(function ($) {
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
	
	/*function dialog(id) {
		if (!$(".dialog-bg").length && !$(id).length) {
			return;
		}
		var $doc = $('body',document),
			$win = $(window),
			$dialogWarp = $(".dialog-bg"),
			$dialog = $(id),
			$dialogCont = $(".dialog-cont"),
			$clsBtn = $("#closed-btn"),
			maxH = $doc.height(),
			w = 850,
			h = 646,
			posL =  w/2,
			posT =$win.height()/2 - $win.scrollTop() ;
			$dialogWarp.fadeOut();
			$dialogCont.hide();
			$clsBtn.hide();
		$doc.css({"overflow":"hidden","margin-right":17});
		$doc.unbind("scroll");
		$dialogWarp.css({
			"height" : maxH
		}).show();
		$dialog.delay(200).show().stop(true, true).animate({
			"width" : w,
			"height" : h,
			"margin-left" : -posL,
			"margin-top" : -posT
		}, "fast", "swing", function () {
			$dialogCont.show();
			$clsBtn.show();
		});
		$clsBtn.click(function () {
			
			$dialog.stop(true, false).animate({
				"width" : 0,
				"height" : 0,
				"margin-left" : 0,
				"margin-top" : 0
			},function(){
				$(this).removeAttr("style");
			});
			$dialogCont.hide();
			$clsBtn.hide();
			$doc.removeAttr("style");
			$dialogWarp.removeAttr("style").hide();
			
		});
		$dialogWarp.click(function () {
			$dialog.stop(true, false).animate({
				"width" : 0,
				"height" : 0,
				"margin-left" : 0,
				"margin-top" : 0
			},function(){
				$(this).removeAttr("style");
			});
			$dialogCont.hide();
			$clsBtn.hide();
			$doc.removeAttr("style");
			$dialogWarp.removeAttr("style").hide();
		});
	};*/
	
	
		
})(jQuery);