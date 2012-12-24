/**
 * newpage main js
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
(function(host, undef){

  var CAPTURE_TIMEOUT = 10 * 1000,
  CAPTURE_ERRNO_TIMEOUT = 2,
  ANIMATE_EFFECT = false;


  var st = +new Date(),
  imgHeight;

  var ntpApis = new ChromeWebUIApis({
    methods: 'getMostVisited,setUserMostVisited,captureWebpage,blacklistURLFromMostVisited,removeURLsFromMostVisitedBlacklist,clearMostVisitedURLsBlacklist,onClickThumbnail',
    onerror: function(ev){
      console.log('error:', arguments);
    },
    onbefore: function(ev){
      console.log('before call:'+ev.methodName, ev.args);
    }
  });

  String.prototype.shorting = function(len, omiss){
    omiss = omiss || '...';
    if(this.length > len){
      return this.substr(0,len/2) + omiss + this.substr(this.length-len/2);
    }else{
      return this;
    }
  }

  var tileTmplStr = $('#tile-temp').html(),
  tileAddTempStr = $('#tile-add-temp').html(),
  tileEmptyTempStr = $('#tile-empty-temp').html();


  function saveSetting(type, value, key){
	key = key || type;
    var settings = localStorage['settings'] = localStorage['settings'] || '{}',
    settings = JSON.parse(settings);

    settings[key] = [type, value];

    localStorage['settings'] = JSON.stringify(settings);
  }

  function loadSettings(){
    var settings = localStorage['settings'] = localStorage['settings'] || '{}',
    settings = JSON.parse(settings);
    
    for(var k in settings){
		var val = settings[k];
		switch (val[0]) {
			case 'search':
				setSearch(val[1]);
				break;
			case 'checkbox':
				$('#' + k).attr('checked', val[1]);
				break;
			default:
				$('#' + k).val(val[1]);
				break;
		}
    }
  }

  function setSearch(searchItem){
    $('#search-switch>a')[0].className = searchItem.type;
    $('#search-form').attr('action', searchItem.url);
    $('#search-kw').attr('name', searchItem.key);
    $('#search-kw').attr('_placeholder', searchItem.desc);

    $('#search-form input[type=hidden]').remove();

    var params;
    if(params = searchItem.params){
      for(var k in params){
        var hInput = document.createElement('input');
        hInput.type = 'hidden';
        hInput.name = k;
        hInput.value = params[k];
        $('#search-form').append(hInput);
      }
    }
    
    if($('#search-kw').hasClass('input-txt-place')){
      PlaceHolder.create(document.getElementById('search-kw'));
    }
  }

  var reloadGrid = function(){
    console.log('调用getMostVisited:', +new Date - st + 'ms(距页面打开)');
    ntpApis.getMostVisited(function(tiles, customs){
      console.log('getMostVisited回调函数被调用:', +new Date -st + 'ms(距页面打开)',arguments);

      var datas = $('#js-grid-from').val() == 1 ? tiles : customs,
      gridCount = $('#js-grid-count').val()-0,
      lis = '',
      oftenLis = '',
      emptyLiStr = $('#js-grid-from').val() == 1 ? tileEmptyTempStr : tileAddTempStr,
      drag = $('#js-grid-from').val() == 1 ? 'ui-state-disabled' : '';


      tiles.forEach(function(tile){
        if(tile.title){
          oftenLis += '<li><a href="'+tile.url+'">'+tile.title+'</a></li>'
        }
      });
      $('.url-often ul').html(oftenLis);


      if(gridCount == 0){
        $('.grid ul').html('');
        $(window).trigger('resize');
        return;
      }

      datas.every(function(item, i){
        if(item.url){
          item.short_url = item.url.shorting(50);
          item.pic = item.local_pic || 'chrome://thumb/' + item.url;
          item.drag = drag;
          lis += $.tmpl(tileTmplStr, item)[0].outerHTML;
        }else{
          lis += $.tmpl(emptyLiStr, {drag:drag})[0].outerHTML;
        }
        if(i+1<gridCount){
          return true;
        }else{
          return false;
        }
      });

      if(datas.length < gridCount){
        lis += new Array(gridCount - datas.length + 1).join($.tmpl(emptyLiStr,{drag:drag})[0].outerHTML);
      }

      $('.grid ul').html(lis);
      $('.tile img').css('height', Math.floor($('.tile img').width()*0.7) + 'px');


      $('.tile>a').attr('target', $('#js-show-in-newtab').attr('checked') ? '_blank' : '_self');

      $(window).trigger('resize');

    });
    return arguments.callee;
  }();

  $('#search-switch').live('click', function(e){
    var self = $(this),
    offset = self.offset();
    $('.search-menu').css({left:offset.left,top:offset.top+self.height()}).slideDown(200);
  });

  var searchMaps = {
    so:{
      type: 'so',
      desc: '综合搜索',
      url:'http://www.so.com/s?src=360se6_addr&ie=utf-8',
      key:'q',
      params:{
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    baidu:{
      type: 'baidu',
      desc: '百度',
      url:'http://www.baidu.com/baidu?&ie=utf-8',
      key:'word',
      params:{
        ie:'utf-8'
      }
    },
    google:{
      type: 'google',
      desc: '谷歌',
      url:'http://www.google.com.hk/search?client=aff-cs-360se&ie=UTF-8',
      key:'q',
      params:{
        client:'aff-cs-360se',
        ie:'UTF-8'
      }
    }
  };


  $('.search-menu').live('click', function(e){
    var searchItem;
    if(searchItem = searchMaps[e.target.className] || searchMaps[e.target.firstElementChild.className]){
      setSearch(searchItem);
      $('.search-menu').slideUp(200);

      saveSetting('search', searchItem);
    }
  });

  PlaceHolder.create(document.getElementById('search-kw'));

  $('#search-form').live('submit', function(){
    if($('#search-kw').hasClass('input-txt-place')){
      $('#search-kw').val('');
    }
  });


  $(document).on('click', function(e){
    if(e.target.id != 'search-switch' && !$(e.target).parents('#search-switch').length && !$(e.target).parents('.search-menu').length){
      $('.search-menu').slideUp(100);
    }
  });

  $('#js-show-search-form').live('change', function(){
    if(this.checked){
      if(ANIMATE_EFFECT){
        $('#search-form').effect('explode',{mode:'show'});
      }else{
        $('#search-form').show();
      }
    }else{
      if(ANIMATE_EFFECT){
        $('#search-form').effect('explode');
      }else{
        $('#search-form').hide();
      }
    }
  });

  $('#js-show-in-newtab').live('change', function(){
    if(this.checked){
      $('.tile>a').attr('target','_blank');
    }else{
      $('.tile>a').attr('target','_self');
    }
  });

  $('#search-kw').autocomplete('http://sug.so.360.cn/suggest?encodein=utf-8&encodeout=utf-8',{
    selectFirst: false,
    dataType: 'jsonp',
    scrollHeight: 300,
    parse: function(data){
      var parsed = [];
      data.s.forEach(function(v){
        parsed.push({
          data: [v],
          value: v,
          result: v
        });
      });
      return parsed;
    }
  }).on('result', function(){
    $(this).parents('form')[0].submit();
  });


  var customModeTipTimer;
  $('.custom-mode-tips .btn-close').live('click', function(){
    $(this.parentNode).hide();
    clearTimeout(customModeTipTimer);
  });
  $('#js-grid-from').live('change', function(){
    console.log('change');
    if($('#js-grid-from').val() == 2){
      if(localStorage.firstRun !== 'no'){
        localStorage.firstRun = 'no';
        $('.custom-mode-tips').fadeIn();
        customModeTipTimer = setTimeout(function(){
          $('.custom-mode-tips').fadeOut();
        }, 10000);
      }
    }
    reloadGrid();
  });

  $('#js-grid-count').live('change', function(){
    reloadGrid();
  });

  function saveGrid(){
    var tiles = parseGrid('.tile');
    ntpApis.setUserMostVisited(JSON.stringify(tiles), function(){
    });
  }

  function parseGrid(sel){
    var tiles = [];
    $(sel).each(function(i,tile){

      tiles.push({
        title:$('.tile-tit', tile).text() || '',
        url:$('a.link', tile).attr('href') || ''
      });

    });
    return tiles;
  }


  $('#js-addurl-cancel').live('click', function(){
    var idx = $('#js-addurl-foridx').val()-0;
    if(ANIMATE_EFFECT){
      $(".add-url").effect('transfer', {to:'.tile:eq('+idx+') img:first', className:'effects-transfer'}, 300);
    }
    $('.add-url').hide();
    $(".addurl-mask").hide();
  });

  $('.tile-add').live('mouseover',function(){
    $("img:eq(0)",this).hide();
    $("img:eq(1)",this).show();
  }).live('mouseleave', function(){
    $("img:eq(0)",this).show();
    $("img:eq(1)",this).hide();
  });

  $(".tile-add").live('click', function(e){
    $(".add-url").show().css('opacity', 0);
    $(this).effect('transfer', {to:'.add-url', className:'effects-transfer'}, 300, function(){
      $('.add-url').css('opacity', 1);
    });
    $(".addurl-mask").show();
    $('.add-url input[type=text]').val('');

    var curLi = $(this).parents('li')[0];
    [].slice.call(curLi.parentNode.children,0).every(function(el, idx){
      if(el == curLi){
        $('#js-addurl-foridx').val(idx);
        return false;
      }
      return true;
    });
  });

  $(".url-cls").click(function(){
    var idx = $('#js-addurl-foridx').val()-0;
    if(ANIMATE_EFFECT){
      $(".add-url").effect('transfer', {to:'.tile:eq('+idx+') img:first', className:'effects-transfer'}, 300);
    }
    $('.add-url').hide();
    $(".addurl-mask").hide();
  });



  $(".setup-tit").click(function(e){
    var setupPop = $('.setup-pop');

    if(setupPop.is(':animated')){
      return false;
    }

    if(setupPop.is(':visible')){
      if(ANIMATE_EFFECT){
        setupPop.effect('drop',{
          direction: 'up', 
          mode: 'hide'
        });
      }else{
        setupPop.hide();
      }
    }else{
      if(ANIMATE_EFFECT){
        setupPop.effect('drop',{
          direction: 'up', 
          mode: 'show'
        });
      }else{
        setupPop.show();
      }
    }

  });
  $(".setup-cls").click(function(){
    if(ANIMATE_EFFECT){
      $(".setup-pop").effect('drop',{
        direction: 'up'
      });
    }else{
      $('.setup-pop').hide();
    }
  });
  $(document).mousedown(function(e){
    if(!$(e.target).parents('.setup-pop').length && e.target.className != 'setup-tit'){
      if($('.setup-pop').is(':visible') && !$('.setup-pop').is(':animated')){
        if(ANIMATE_EFFECT){
          $(".setup-pop").effect('drop', {
            direction: 'up'
          });
        }else{
          $('.setup-pop').hide();
        }
      }
    }
  });

  var timerResize;
  $(window).on('resize', function(){

    $('.tile img').css('height', imgHeight = Math.floor($('.tile img').width()*0.7) + 'px');
    if($('.wrap .tile').length){
      $('.wrap').css({
        'top': Math.max(window.innerHeight/2 - $('.wrap').height()/2, 50) + 'px',
        'left': $(window).width()/2 - $('.wrap').width()/2 + 'px'
      });
    }else{
      $('.wrap').css({
        'top': window.innerHeight/2 - $('.wrap').height() + 'px',
        'left': $(window).width()/2 - $('.wrap').width()/2 + 'px'
      });
    }
    if(!timerResize){
      timerResize = setTimeout(function(){
        clearTimeout(timerResize);
        timerResize = null;

        $('.wrap').css('opacity', 1);
      }, 200);
    }
    return arguments.callee;
  }());


  $('#js-addurl-url').live('blur', function(e){
    if(!/^(https?):\/\//i.test(this.value)){
      this.value = 'http://' + this.value;
    }
    this.value = this.value.replace(/\|/g,'%7c');
  });

  $('.url-often li').live('click', function(e){
    $('#js-addurl-title').val($(this).text().replace(/(^\s*)/g, '').replace(/(\s*)$/, ''));
    $('#js-addurl-url').val($('a',this).attr('href'));
    e.preventDefault();
  });

  $('.url-often li').live('dblclick', function(e){
    $('#js-addurl-title').val($(this).text().replace(/(^\s*)/g, '').replace(/(\s*)$/, ''));
    $('#js-addurl-url').val($('a',this).attr('href'));
    $('#js-addurl-confirm').trigger('click');
    e.preventDefault();
  });


  $('.url-often li').live('mouseenter', function(){
    $(this).addClass("hover");
  }).live('mouseleave', function(){
    $(this).removeClass("hover");
  });

  var $div_li =$(".url-tag li");
  $div_li.click(function(){
    $(this).addClass("cur")
      .siblings().removeClass("cur");
    var index =  $div_li.index(this);
    $(".url-often > ul")
      .eq(index).show()
      .siblings().hide();
  });

  $(".tile").live('mouseover',function(){$(this).addClass("tile-on");});
  $('.tile').live('mouseleave', function(){$(this).removeClass("tile-on")});
  $(".btn").hover(function(){$(this).addClass("btnhov");},function(){$(this).removeClass("btnhov");});
  $(".btn").mousedown(function(){$(this).addClass("btnclk");});
  $(".btn").mouseup(function(){$(this).addClass("btnup");});
  $(".btn").mouseleave(function(){$(this).removeClass("btnup");$(this).removeClass("btnclk")});
  $(".btn-2").hover(function(){$(this).addClass("btn-2hov");},function(){$(this).removeClass("btn-2hov");});
  $(".btn-2").mousedown(function(){$(this).addClass("btn-2clk");});
  $(".btn-2").mouseup(function(){$(this).addClass("btn-2up");});
  $(".btn-2").mouseleave(function(){$(this).removeClass("btn-2up");$(this).removeClass("btn-2clk")});
  $(".btn-3").hover(function(){$(this).addClass("btn-3hov");},function(){$(this).removeClass("btn-3hov");});
  $(".btn-3").mousedown(function(){$(this).addClass("btn-3clk");});
  $(".btn-3").mouseup(function(){$(this).addClass("btn-3up");});
  $(".btn-3").mouseleave(function(){$(this).removeClass("btn-3up");$(this).removeClass("btn-3clk")});
  $(".url-cls").hover(function(){$(this).addClass("url-clshov");},function(){$(this).removeClass("url-clshov");});
  $(".url-cls").mousedown(function(){$(this).addClass("url-clsclk");});
  $(".url-cls").mouseup(function(){$(this).addClass("url-clsup");});
  $(".url-cls").mouseleave(function(){$(this).removeClass("url-clsup");$(this).removeClass("url-clsclk")});

  $('a').live('click', function(e){
    if($(this).attr('href') == '#'){
      e.preventDefault();
    }
  });


  $('#clearBlackList').live('click', function(){
    ntpApis.clearMostVisitedURLsBlacklist();
    
  });
  $('#removeUrlsFromBlackList').live('click', function(){
    /*
    $(this).effect('transfer', {to:('.tile:eq(' + window.redo_idx + ') img:first'), className:'effects-transfer'}, function(){
      chrome.send('removeURLsFromMostVisitedBlacklist', [window.redo_url]);
    });
    */
    chrome.send('removeURLsFromMostVisitedBlacklist', [window.redo_url]);
  });
  $('.remove-tips a').live('click', function(e){
    clearTimeout(window.timerRemoveTipHandler);
    $('.remove-tips').fadeOut();
  });

  $('.remove').live('click', function(e){
    if($('#js-grid-from').val() == 1){
      $('.remove-tips').css('left', $('.tile img').offset().left + 'px').fadeIn();

      window.timerRemoveTipHandler && clearTimeout(window.timerRemoveTipHandler);
      window.timerRemoveTipHandler = setTimeout(function(){
        $('.remove-tips').fadeOut();
      },4000);
      var url = window.redo_url = $('a.link',$(this).parents('li.tile')).attr('href');


      var me=this;
      setTimeout(function(){
        var curLi = $(me).parents('li')[0];
        [].slice.call(curLi.parentNode.children,0).every(function(el, idx){
          if(el == curLi){
            window.redo_idx = idx;
            return false;
          }
          return true;
        });

        ntpApis.blacklistURLFromMostVisited(url);
        /*
        $(me).parents('.tile-logo').effect('transfer', {to:'.remove-tips', className:'effects-transfer'}, 500, function(){
          $('.remove-tips').css('opacity', 1);
        });
        */
      });
    }else{
      $(this).parents('li').effect('fade', 200, function(){
        $(this).html($($('#js-grid-from').val() == 1 ? tileEmptyTempStr : tileAddTempStr).html()).effect('fade', { mode:'show'}, 200).find('img').css('height', imgHeight);
        saveGrid();
      });
    }
    e.preventDefault();
  });


  $('.js-auto-save').live('change', function(){
    saveSetting($(this).attr('type'), $(this).attr('type') == 'checkbox' ? this.checked : $(this).val(), this.id);
  });

  $('#add-url-form input[type=text]').live('keypress', function(e){
    if(e.charCode == 13){
      $('#js-addurl-url').trigger('blur');
      $('#add-url-form').trigger('submit');
    }
  });


  $('#add-url-form').validate({
    rules:{
      url:{
        required: true,
        url: true
      }
    },
    messages:{
      url:{
        required: '',
        url: ''
      }
    },
    submitHandler:function(e){
      var title = $('#js-addurl-title').val().replace(/^\s*/,'').replace(/\s*$/,''),
      url = $('#js-addurl-url').val(),
      idx = $('#js-addurl-foridx').val()-0;

      if(url){
        $('.tile:eq('+idx+')').fadeOut(500, function(){
          $(this).html($.tmpl(tileTmplStr, {
            title: title||url,
            short_url: url.shorting(50),
            url: url
          }).html()).fadeIn().find('.tile-logo img').attr('src', 'img/loading.gif').css('height', imgHeight);;

          if($('#js-show-in-newtab')[0].checked){
            $(this).find('.link').attr('target', '_blank');
          }

          ntpApis.captureWebpage(url);
          saveGrid();
          window['capture_timeout_' + url] = setTimeout(function(){
            window.onSnapshotComplete([url, CAPTURE_ERRNO_TIMEOUT]);
          }, CAPTURE_TIMEOUT);
        });
      }
      $(".add-url").effect('transfer', {to:'.tile:eq('+idx+') img:first', className:'effects-transfer'}).hide();
      $(".addurl-mask").hide();
    }
  });

  window.onSnapshotComplete = function(args){
    console.log('onSnapshotComplete被调用',arguments);
    args = args || [];
    var url = args[0],
    errno = args[1];
    clearTimeout(window['capture_timeout_' + url]);
    if(url && errno){
      url = url.replace(/\/$/,'');
      var query = '.tile a[href^="'+url+'"] img[src="img/loading.gif"]',
      img = $(query)[0];
      if(!img){
        query = '.tile a[href^="'+url+'"] img';
        img = $(query)[0];
      }
      if(img){
        img.src = 'chrome://thumb/'+url;
      }
    }
  };

  (function(undef){

    var DELAY_DRAG_OFFSET = 2;

    function getDragRects(selector){
      var dragRects = [];
      $(selector).each(function(index, item){
        var jItem = $(item),
        offset = jItem.offset();
        dragRects.push(item.rect = {
          index: index,
          drag: item,
          left: offset.left,
          top: offset.top,
          right: offset.left + jItem.width(),
          bottom: offset.top + jItem.height()
        });
      });
      return dragRects;
    }


    var dragObj,
    rects,
    startX,
    startY,
    boxX,
    boxY,
    dragHelper,
    passDrag,
    sx,sy,
    cx,cy,
    downObj,
    dragStart;
    $('.tile:not(.ui-state-disabled) .tile-logo,.tile:not(.ui-state-disabled) .tile-add').live('mousedown', function(e){
      sx = e.clientX,
      sy = e.clientY;
      dragStart = true;
      downObj = this.parentNode.parentNode;
    });

    $(document).live('mouseup', function(e){
      dragStart = false;
      if(dragObj){

        if(Math.max(Math.abs(cx-sx),Math.abs(cy-sy)) > DELAY_DRAG_OFFSET){
          e.preventDefault();
        }

        if(passDrag){
          $(passDrag).removeClass('pass-drag')
            .removeClass('pass-drag-left')
            .removeClass('pass-drag-top')
            .removeClass('pass-drag-right')
            .removeClass('pass-drag-bottom');

          $(dragHelper).animate({
            left: passDrag.rect.left + 'px',
            top: passDrag.rect.top + 'px'
          }, 200, function(dragObj){
            return function(){
              dragObj.innerHTML = dragSwitcher.innerHTML;
              $(dragObj).css('opacity', 1);
              passDrag.innerHTML = dragHelper.innerHTML;
              $(passDrag).css('opacity', 1);
              document.body.removeChild(dragHelper);
              document.body.removeChild(dragSwitcher);

              saveGrid();
            };
          }(dragObj));

          var dragSwitcher = document.createElement('div');
          dragSwitcher.innerHTML = passDrag.innerHTML;
          $(passDrag).css('opacity', 0);
          $(dragSwitcher).addClass('drag-switcher').css({
            width: $(passDrag).width() + 'px',
            height: $(passDrag).height() + 'px',
            left: $(passDrag).offset().left + 'px',
            top: $(passDrag).offset().top + 'px'
          }).animate({
            left: $(dragObj).offset().left + 'px',
            top: $(dragObj).offset().top + 'px'
          }, 200);
          document.body.appendChild(dragSwitcher);

        }else{
          $(dragHelper).animate({
            left: $(dragObj).offset().left + 'px',
            top: $(dragObj).offset().top + 'px'
          }, 200, function(dragObj){
            return function(){
              dragObj.innerHTML = dragHelper.innerHTML;
              $(dragObj).css('opacity', 1);
              document.body.removeChild(dragHelper);
            };
          }(dragObj));
        }
        dragObj = null;
      }
    });

    $(document).live('mousemove', function(e){
      cx=e.clientX;
      cy=e.clientY;

      if(!dragObj){
        if(!dragStart){
          return false;
        }
        if(e.button){    //only left-mousebutton
          return false;
        }

        if(Math.max(Math.abs(cx-sx),Math.abs(cy-sy)) < DELAY_DRAG_OFFSET){
          return false;
        }

        var self = downObj,
        jSelf = $(self);

        rects = getDragRects('.tile:not(.ui-state-disabled)');//get all dragbox rectangle
        dragObj = self;

        startX = e.pageX;
        startY = e.pageY;

        boxX = jSelf.offset().left - startX;
        boxY = jSelf.offset().top - startY;

        dragHelper = document.createElement('div');
        dragHelper.innerHTML = dragObj.innerHTML;
        $(dragObj).css('opacity',0);
        $(dragHelper).addClass('drag-helper').css({
          width: jSelf.width() + 'px',
          height: jSelf.height() + 'px',
          left: jSelf.offset().left + 'px',
          top: jSelf.offset().top + 'px'
        });
        document.body.appendChild(dragHelper);
      }else{
        var deltaX = e.pageX - startX,
        deltaY = e.pageY - startY,
        newPosX = startX + deltaX + boxX,
        newPosY = startY + deltaY + boxY;

        $(dragHelper).css({
          left: newPosX + 'px',
          top: newPosY + 'px'
        });

        var hitDrag;
        rects.every(function(rect){         //拿到当前mousemove命中到的元素
          if(e.pageX > rect.left && e.pageX < rect.right){
            if(e.pageY > rect.top && e.pageY < rect.bottom){
              if(rect.drag !== dragObj){
                hitDrag = rect.drag;
              }
              return false;
            }
          }
          return true;
        });

        if(hitDrag !== passDrag){

          if(passDrag){
            $(passDrag).removeClass('pass-drag')
              .removeClass('pass-drag-left')
              .removeClass('pass-drag-top')
              .removeClass('pass-drag-right')
              .removeClass('pass-drag-bottom');
          }

          passDrag = hitDrag;
          if(!passDrag){
            return false;
          }

          var dragRect = {
            left: $(dragObj).offset().left,
            top: $(dragObj).offset().top,
            right: $(dragObj).offset().left + $(dragObj).width(),
            bottom: $(dragObj).offset().top + $(dragObj).height()
          },
          passRect = {
            left: $(passDrag).offset().left,
            top: $(passDrag).offset().top,
            right: $(passDrag).offset().left + $(passDrag).width(),
            bottom: $(passDrag).offset().top + $(passDrag).height()
          };

          $(passDrag).addClass('pass-drag');

          if(passRect.left > dragRect.left){
            $(passDrag).addClass('pass-drag-left');
          }else if(passRect.left < dragRect.left){
            $(passDrag).addClass('pass-drag-right');
          }

          if(passRect.top > dragRect.top){
            $(passDrag).addClass('pass-drag-top');
          }else if(passRect.top < dragRect.top){
            $(passDrag).addClass('pass-drag-bottom');
          }

        }
      }
    });

  })();


  $('.ipt input').on('focus', function(){
    $(this).parents('.search').addClass('focus');
  });
  $('.ipt input').on('blur', function(){
    $(this).parents('.search').removeClass('focus');
  });

  loadSettings();

  if(!$('#js-show-search-form')[0].checked){
    $('#search-form').hide();
  }

  $('.link').live('click', function(e){
    ntpApis.onClickThumbnail(this.href);
  });

  /**/
  
/*  var img = new Image();
  img.onload = function(){
	  var canvas = document.createElement('canvas');
	  var context = canvas.getContext('2d');
	  context.drawImage(img, 0, 0);
	  console.log(canvas.toDataURL());
	};
  img.src = 'http://img.autohome.com.cn/album/userphotos/2012/12/3/d2d060e7-d3f8-459c-9b54-15658aa82b0d_s.jpg';
  /**/

	/**/
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://img.autohome.com.cn/album/userphotos/2012/12/3/d2d060e7-d3f8-459c-9b54-15658aa82b0d_s.jpg", true);
	xhr.responseType = "blob";
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		console.log(xhr);
		console.log(xhr.response);


	window.webkitRequestFileSystem(0, 50 * 1024 * 1024, function(fs){
		console.log(fs);
		fs.root.getFile('999876598.png', { create: true }, function(fileEntry){
			console.log(fileEntry.toURL());
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                    //log.debug(fileName + '写入成功！');
                    //if (callback) callback(fileEntry.fullPath);
                };

                fileWriter.onerror = function (e) {
                    //log.error(fileName + '写入错误: ' + e.toString());
                    //if (callback) callback(fileEntry.fullPath, e);
                };

                // 创建一个 Blob 并写入文件.
               // var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
               // bb.append('content');
                fileWriter.write(xhr.response);
			});
		}, function(err){
			console.log('getFile', err);
		});
	});


	  }
	}
	xhr.send();
	
	function fs_success(type) {
		console.log('success', type);
	}
	

	/**/

})();
