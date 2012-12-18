(function($){
	$(function(){
		nav();
		bnrSilder();
		helpToggle();
		systole();
		slideImg();
		downM();
		ExtMutual();
		skinMutual();

		$('#slides').slides({
			container: '.slides-box ul'
		});
		listBox();
		goTop();
		$('#myextensions').click(function(){
			chrome.tabs.create({url: "chrome://myextensions/extensions", selected: true});
		});
	});
	
	function listBox(){
		var $liTarget = $('.list-box li');
		$liTarget.mouseenter(function(){
			$(this).children('dl').show().end().children('div').hide();
			$(this).siblings().children('dl').hide().end().children('div').show();
		});
	}
	function goTop(){
		var $goTop = $('#go-top'),sclTopVal;
		$(window).scroll(function(){
			 sclTopVal = $(this).scrollTop();
			 sclTopVal > 200 ? $goTop.fadeIn() : $goTop.fadeOut();
		});
		$goTop.click(function(){
			$('body,html').animate({scrollTop:0},300,'easeInOutCubic');
			return false;
		});
	}
	function nav(){
		var $liCur = $(".nav-box ul li.cur"),
			curP = $liCur.position().left,
			curW = $liCur.outerWidth(true),
			$slider = $(".nav-line"),
			$targetEle = $(".nav-box ul li:not('.last') a"),
			$navBox = $(".nav-box");
		$slider.stop(true,true).animate({"left":curP,"width":curW});
		$targetEle.mouseenter(function(){
			var $_parent = $(this).parent(),
				_width = $_parent.outerWidth(true), 
				posL = $_parent.position().left;
			$slider.stop(true,true).animate({"left":posL,"width":_width},"fast");
		});
		$navBox.mouseleave(function(cur,wid){
			cur = curP;
			wid = curW;
			$slider.stop(true,true).animate({"left":cur,"width":wid},"fast");
		});
	};

	function bnrSilder(){
		if( !$("#head").length && !$("#bnr").length ){
			return;
		}
		(function() {
			var sstag = document.createElement('script'); sstag.type = 'text/javascript'; sstag.async = true;
			sstag.src = 'script/SmoothScroll.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(sstag, s);
		})();
		$(window).scroll(function(){
			var bTop = $(this).scrollTop();
			$('.bnr-box').css({'margin-top':-bTop*0.48});
			$('.bnr-txt').css({'margin-top':-bTop*0.68});
			$('.bnr-btn').css({'margin-top':-bTop*0.68});
			$('.warper').css({"background-position":"50% "+bTop*0.2+"px"});
			if(bTop*1.5<300){
				$(".txt-warp").css({'margin-top':-bTop*1.5});
				$(".txt-nav-warp").removeAttr("style");
			}else{
				$(".txt-warp").css({'margin-top':-240});
				$(".txt-nav-warp").css({"position":"fixed","top":0,"left":0});
				$(".cont").css({"padding-top":"84px"});
			}
		});
	};
	
	function helpToggle(){
		if( !$(".help-cont dl dt a").length ){
			return;
		}
		var $targetEle = $(".help-cont dl dt a");
		$targetEle.toggle(function(){
				$(this).parent().css({"background-position":"0 -20px"}).siblings().slideDown();
				return false;
			},function(){
				$(this).parent().removeAttr("style").siblings().slideUp();
				return false;
		});
	};
	
	function systole(){
		if( !$(".history").length){
			return;
		}
		var $warpEle = $(".history-date"),
			$targetA = $warpEle.find("h2 a,ul li dl dt a"),parentH,eleTop= [];
		parentH = $warpEle.parent().height();
		$warpEle.parent().css({"height":59});
		setTimeout(function(){
			
			$warpEle.find("ul").children(":not('h2:first')").each(function(idx){
				eleTop.push($(this).position().top);
				$(this).css({"margin-top":-eleTop[idx]}).children().hide();
			}).animate({"margin-top":0},1600).children().fadeIn();
			$warpEle.parent().animate({"height":parentH},2600);
	
			$warpEle.find("ul").children(":not('h2:first')").addClass("bounceInDown").css({
				"-webkit-animation-duration": "2s",
				"-webkit-animation-delay":"0",
				"-webkit-animation-timing-function": "ease",
				"-webkit-animation-fill-mode": "both"
			}).end().children("h2").css({"position":"relative"});
		},600);
		
		$targetA.click(function(){
			$(this).parent().css({"position":"relative"});
			$(this).parent().siblings().slideToggle();
			$warpEle.parent().removeAttr("style");
			return false;
		});
		
	};
	
	function slideImg(){
		if( !$(".tab-img").length && !$(".tab-cont").length ){
			return false;
		}
		var $tabImg = $(".tab-img"), $slideImg = $tabImg.find(".img-slide"), $slideBox = $(".tab-img-slide"); $tabBtn = $(".tab-img-btn").find("a"), $tabContBox = $(".tab-cont-box");
		$tabBtn.toggle(function(){
			$(this).removeClass("pulse").addClass("btn flipInY");
			$slideImg.last().css({"left":$tabImg.width()}).show();
			$tabContBox.last().fadeIn("slow").end().first().hide();
			$slideBox.stop(true,true).animate({"margin-left":-$tabImg.width()},400,function(){
				$tabBtn.delay(1000).removeClass("flipInY");
				$slideImg.first().hide().end().last().css({"left":0});;
				$(this).css({"margin-left":0});
			});
			return false;
		},function(){
			$(this).removeClass("flipInY pulse").addClass("flipInY").removeClass("btn");
			$slideImg.first().css({"left":$tabImg.width()}).show();
			$tabContBox.first().fadeIn("slow").end().last().hide();
			$slideBox.stop(true,true).animate({"margin-left":-$tabImg.width()},400,function(){
				$tabBtn.delay(1000).removeClass("flipInY");
				$slideImg.last().hide().end().first().css({"left":0});
				$(this).css({"margin-left":0});
			});
			return false;
		}).parent().hover(function(){
			$(this).children().addClass("pulse");
		},function(){
			$(this).children().removeClass("pulse");
		});
	};
	
	function downM(){
		if( !$(".navi").length ){ return false;}
		var $targetBtn = $(".pos-box > span"), targetW;
		$targetBtn.click(function(){
			var posbox=$(this).parents(".pos-box");
			posbox.toggleClass("hover");			
			$(this).parents('td:first').prev().has('input').find('.pos-box').removeClass('hover');			
			targetW = $(this).parents("td").width()+1;
			$(this).siblings(".search-box").find("span").width(targetW);
		}).parent().mouseleave(function(){
			var posbox=$(this);
			if(!posbox.has('form').length){
				posbox.parents("td").children().removeClass("hover");
			}
		}).toggle(function(e){					
					$(this).find('.search-box input.sch-txt').focus();
				},function(e){					
					
				});
				$('.more-btn').click(function(e){
				console.log('more-btn.click',e)
				e.stopPropagation();
				});
	};
	
	function ExtMutual(){
		var $extList = $(".extend-list li"),$extBtn = $(".ext-btn");
		$extList.delay(1000).hover(function(){

			//$(this).find(".ext-logo").stop(true,true).delay(300).animate({"margin-top":-95},250);
		},function(){

			//$(this).find(".ext-logo").stop(true,true).animate({"margin-top":0},250);
		});
		$extList.each(function(idx) {
			$(this).click(function(){
				//dialog("#dialog01");
			});
		});
		$extBtn.each(function(index) {
			$(this).click(function(e){
				//e.stopPropagation();
			});
        });
	};
	
	function skinMutual(){
		var $skinList = $(".skin-lists li"),$aTarget = $skinList.find("p a");
		$skinList.each(function(idx) {
			$(this).click(function(){
				dialog("#dialog02");
			});
		});
		$aTarget.click(function(e){
			e.stopPropagation();
		});
	};

window.slides=slides2;
	function slides2($indexs,$pics){		
		console.log('slides');
		clearInterval(slides.t);
		var len = $pics.length,cur = 0,zIdex = 2,t,tmpArr = [],w = $pics.width(),effect = {};
		
		$indexs.eq(cur).addClass("current");
		$pics.parent().css({"width":3*w,"left":-w});
		$pics.hide();
		$pics.css({"left":w}).eq(cur).show().end().eq(cur+1).css({"left":2*w}).show();
		function nextCur(){
			//debugger;
			$pics.hide().eq(cur).show();
			//console.log(cur,len,$pics.parent().css('left'));
			cur = (cur+1) % len;
			//console.log('nextCur',len,cur);
			$indexs.removeClass("current").eq(cur).addClass("current");
			$pics.css({"left":w,"z-index":0}).eq(cur == len ? 0: cur).show().css({"left":2*w,"z-index":zIdex}).end().eq(cur-1<0?len-1:cur-1).show().css({"left":w,"z-index":0});//.eq(cur-1<0?len-1:cur-1).show();
			$pics.parent().stop(true,true).animate({"left":-2*w},function(){
				$(this).css({"left":-w});
				//console.log('cur:',cur);
				$pics.eq(cur).show().css({left:w})
			});
		};
		window.nextCur=nextCur;
		window.prevCur=prevCur;
		function prevCur(){
			console.log('prevCur',len);
			cur = (cur+1) % len;
			$indexs.removeClass("current").eq(cur).addClass("current");
			$pics.hide().css({"left":w,"z-index":0}).eq(cur-1 == -1 ? len-1 : cur-1).show().css({"left":0})
			.end().eq(cur).show().css({"left":w,"z-index":zIdex});
			$pics.parent().stop(true,true).animate({"left":0},function(){
				$(this).css({"left":-w});
				
			});
		};
		
		$indexs.find("a").each(function(idx) {
			$(this).click(function(){
				var thisIdx = $indexs.find('.current').index();
				cur = idx -1;
				if( idx == thisIdx ){ return;}
				idx < thisIdx ? prevCur() : nextCur();
			});
		});
		
		$indexs.hover(function(){
			clearInterval(slides.t);
		},function(){
			if(len>1){
				clearInterval(slides.t);
				slides.t = setInterval(function(){
			//	slides.t = setTimeout(function(){
					nextCur();
				},3000)
			}
		}).trigger("mouseleave");
		
	};
	function slides(eleId,targetEle){		
		console.log('slides');
		clearInterval(slides.t);
		if(!eleId && !targetEle){ return false;}
		var len = $(eleId).find(targetEle).length,cur = 0,zIdex = 2,t,tmpArr = [],w = $(eleId).find(targetEle).width(),effect = {};
		
		for(var i = 0; i < len; i+=1){
			tmpArr.push("<li><a href='#nogo' hideFocus>"+i+"</a></li>");
		}
		$("<ul class='pagination' />").html(tmpArr.join("")).appendTo(eleId);
		$(".pagination li").eq(cur).addClass("current");
		$(eleId).find(targetEle).parent().css({"width":3*w,"left":-w});
		$(eleId).find(targetEle).hide();
		$(eleId).find(targetEle).css({"left":w}).eq(cur).show().end().eq(cur+1).css({"left":2*w}).show();
		function nextCur(){
			console.log('nextCur',len);
			cur = (cur+1) % len;
			$(".pagination li").removeClass("current").eq(cur).addClass("current");
			$(eleId).find(targetEle).hide().css({"left":w,"z-index":0}).eq(cur+1 == len ? 0: cur+1).show().css({"left":2*w})
			.end().eq(cur).show().css({"left":w,"z-index":zIdex});
			$(eleId).find(targetEle).parent().stop(true,true).animate({"left":-2*w},function(){
				$(this).css({"left":-w});
			});
		};
		function prevCur(){
			console.log('prevCur',len);
			cur = (cur+1) % len;
			$(".pagination li").removeClass("current").eq(cur).addClass("current");
			$(eleId).find(targetEle).hide().css({"left":w,"z-index":0}).eq(cur-1 == -1 ? len-1 : cur-1).show().css({"left":0})
			.end().eq(cur).show().css({"left":w,"z-index":zIdex});
			$(eleId).find(targetEle).parent().stop(true,true).animate({"left":0},function(){
				$(this).css({"left":-w});
			});
		};
		
		$(".pagination li a").each(function(idx) {
			$(this).click(function(){
				var thisIdx = $(".pagination li.current").index();
				cur = idx -1;
				if( idx == thisIdx ){ return;}
				idx < thisIdx ? prevCur() : nextCur();
			});
		});
		
		$(eleId).hover(function(){
			clearInterval(slides.t);
		},function(){
			if(len>1){
				clearInterval(slides.t);
				slides.t = setInterval(function(){
					nextCur();
				},3000)
			}
		}).trigger("mouseleave");
		
	};

	window.dialog=dialog;
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
	
})(jQuery);

	function srollList(id,srlNum){
		if( id == ''){
			return;
		}
		
		var $prev = $("#prev"),
			$next = $("#next"),
			$btnList = $(".btn-list"),
			$ul = $btnList.find("ul"),
			$li = $btnList.find("li"),
			$clsBtn = $("#closed-btn"),
			maxLen = $li.length,
			liW = $li.outerWidth(true),
			next = "-=",
			prev = "+=",
			page = 1,
			i = srlNum,
			srollW = liW*i,
			filledW = srollW-((i - (maxLen%i))*liW) == 0 ? srollW : srollW-((i - (maxLen%i))*liW),
			posL ;
		$next.click(function(){
			var page_count = Math.ceil(maxLen/i);
			if( page == page_count){
				return;
			}
			
			page == page_count-1 && filledW > 0 ? srollW = filledW : srollW = $li.outerWidth(true)*i;
			move(next);
			page++;
			console.log(page);
		});
		$prev.click(function(){
			var page_count = Math.ceil(maxLen/i);
			if( page == 1){
				return;
			}
			page == page_count?srollW = filledW : srollW = $li.outerWidth(true)*i;
			
			move(prev);
			page--;
		});
		$li.click(function(){
			$(this).addClass("cur").siblings().removeClass("cur");
			
		});
		function move(path){
			$ul.stop(true,true).animate({"margin-left":path+srollW},300);	
		};
		$clsBtn.click(function(){
			page=1;
			$ul.removeAttr("style");
		});
	};		

	
function fixNav(){
	$('#category-type img').each(function(){
		var src = $(this).attr('src');
		if ($(this).parents('li:first').hasClass('cur')) {
			if (src.indexOf('_2.png') < 0) {
				$(this).attr('src', src.replace(/(.*?)\.([^.]*?)$/, '$1_2.$2'));
			}
		} else {
			if (src.indexOf('_2.png') > -1) {
				$(this).attr('src', src.replace(/_2\.png/, '.png'));
			}
		}
	});
}



