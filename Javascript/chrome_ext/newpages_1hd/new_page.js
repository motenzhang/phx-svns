/**
 * newpage main js
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
$(function(host, undef) {
  var _now = new Date();
  console.log(_now.toLocaleTimeString() + '.' + _now.getMilliseconds());

  var CAPTURE_TIMEOUT = 10 * 1000,
  CAPTURE_ERRNO_TIMEOUT = 2,
  ANIMATE_EFFECT = false;

  var st = + new Date(),
  imgHeight;

  var ntpApis = new ChromeWebUIApis({
    methods: 'getMostVisited,setUserMostVisited,captureWebpage,blacklistURLFromMostVisited,removeURLsFromMostVisitedBlacklist,clearMostVisitedURLsBlacklist,onClickThumbnail',
    onerror: function(ev) {
      console.log('error:', arguments);
    },
    onbefore: function(ev) {
      console.log('before call:' + ev.methodName, ev.args);
    }
  });

  String.prototype.shorting = function(len, omiss) {
    omiss = omiss || '...';
    if (this.length > len) {
      return this.substr(0, len / 2) + omiss + this.substr(this.length - len / 2);
    } else {
      return this;
    }
  }

  var tileTmplStr = $('#tile-temp').html(),
  tileAddTempStr = $('#tile-add-temp').html(),
  tileWidgetTempStr = $('#tile-widget').html(),
  tileEmptyTempStr = $('#tile-empty-temp').html();

  function saveSetting(item, exec) {
    var settings = localStorage['settings'] = localStorage['settings'] || '{}';
    try {
      settings = JSON.parse(settings);
    } catch(e) {
      settings = {};
    }

    settings[item] = exec;

    localStorage['settings'] = JSON.stringify(settings);
  }

  function loadSettings() {
    var settings = localStorage['settings'] = localStorage['settings'] || '{}';
    try {
      settings = JSON.parse(settings);
    } catch(e) {
      settings = {};
    }
    for (var k in settings) {
      eval(settings[k]);
    }
  }

  function setSearch(searchItem) {
    $('#search-switch>a')[0].className = searchItem.type;
    $('#search-form').attr('action', searchItem.url);
    $('#search-kw').attr('name', searchItem.key);
    $('#search-kw').attr('_placeholder', searchItem.desc);

    $('#search-form input[type=hidden]').remove();

    var params;
    if (params = searchItem.params) {
      for (var k in params) {
        var hInput = document.createElement('input');
        hInput.type = 'hidden';
        hInput.name = k;
        hInput.value = params[k];
        $('#search-form').append(hInput);
      }
    }

    if ($('#search-kw').hasClass('input-txt-place')) {
      PlaceHolder.create(document.getElementById('search-kw'));
    }
  }

  var reloadGrid = function() {
    console.log('调用getMostVisited:', + new Date - st + 'ms(距页面打开)');
    ntpApis.getMostVisited(function(tiles, customs) {
      console.log('getMostVisited回调函数被调用:', + new Date - st + 'ms(距页面打开)', arguments);

      var gridCount = $('#js-grid-count').val() - 0;

      ImportData.grid(tiles, customs, gridCount, ntpApis, function() {
        reloadGrid();
      });

      window.smartMostVisited = tiles;
      var datas = $('#js-grid-from').val() == 1 ? tiles: customs,
      lis = '',
      oftenLis = '',
      emptyLiStr = $('#js-grid-from').val() == 1 ? tileEmptyTempStr: tileAddTempStr,
      drag = $('#js-grid-from').val() == 1 ? 'ui-state-disabled': '';

      if (gridCount == 0) {
        $('.grid ul').html('');
        $(window).trigger('resize');
        TipsManager.showNewsBoxTips();
        return;
      }

      window.gridAddedUrlMap = {};
      var emptyGridCount = 0;
      datas.every(function(item, i) {
        if (item.url) {
          window.gridAddedUrlMap[item.url] = item;
          item.drag = drag;
          if (item.url == ImportData.yihaodian) {
            if (!window._session_yihaodian_showed) {
              window._session_yihaodian_showed = true;
              Stat.count('d5', 1);
            }
          }
          if (item.url.substr(0, 7) == 'widget:') {
            if (!window._session_newsbox_showed) {
              window._session_newsbox_showed = true;
              Stat.count('d3', 6);
            }
            item.widget_type = item.url.replace(/^widget:\/\//, '');
            lis += $.tmpl(tileWidgetTempStr, item)[0].outerHTML;
          } else {
            item.url = checkUrlProtocol(item.url);
            item.short_url = item.url.shorting(50);
            item.pic = item.local_pic || 'chrome://thumb/' + item.url;
            lis += $.tmpl(tileTmplStr, item)[0].outerHTML;
          }
        } else {
          emptyGridCount++;
          lis += $.tmpl(emptyLiStr, {
            drag: drag
          })[0].outerHTML;
        }
        if (i + 1 < gridCount) {
          return true;
        } else {
          return false;
        }
      });

      if (datas.length < gridCount) {
        emptyGridCount += gridCount - datas.length;
        lis += new Array(gridCount - datas.length + 1).join($.tmpl(emptyLiStr, {
          drag: drag
        })[0].outerHTML);
      }

      $('.grid ul').html(lis);

      $('.tile>a').attr('target', $('#js-show-in-newtab').attr('checked') ? '_blank': '_self');

      $(window).trigger('resize');

      $('.smart-push').removeClass('active');
      var smartPushArr = [];
      tiles.forEach(function(tile, i) {
        if (tile.title) {
          var mv_li = $('<li><a></a></li>');
          mv_li.children().attr('href', tile.url);
          mv_li.children().text(tile.title);
          oftenLis += mv_li[0].outerHTML;
          if (gridAddedUrlMap[tile.url] == undefined && smartPushArr.length < emptyGridCount) {
            smartPushArr.push(mv_li[0].outerHTML);
            if (smartPushArr.length == emptyGridCount && i <= tiles.length - 1) {
              $('.smart-push').addClass('active');
            }
          }
        }
      });
      $('.url-often ul').html(oftenLis);
      if (smartPushArr.length > 0) {
        $('.smart-push-pre-ui').removeClass('nodata');
        $('.smart-push-pre h3').html('用您最常访问网址填充空白格子：');
      } else {
        $('.smart-push-pre-ui').addClass('nodata');
        $('.smart-push-pre h3').html('暂无可推荐的网址');
      }
      $('.smart-push-pre ul').html(smartPushArr.join(''));

      if (window._session_newsbox_showed) {
        initWidgetBox();
        TipsManager.showNewsBoxTips();
      }

      TipsManager.showSmartPushTips(tiles.length, emptyGridCount);
    });
    return arguments.callee;
  } ();

  $('#search-switch').live('click', function(e) {
    var self = $(this),
    offset = self.offset();
    $('.search-menu').css({
      left: offset.left,
      top: offset.top + self.height()
    }).slideDown(200);
  });

  $(window).on('resize', function() {
    var self = $('#search-switch'),
    offset = self.offset();
    $('.search-menu').css({
      left: offset.left,
      top: offset.top + self.height()
    });
  });

  var searchMaps = {
    so: {
      type: 'so',
      desc: '360搜索',
      url: 'http://www.so.com/s?src=360se6_addr&ie=utf-8',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    baidu: {
      type: 'baidu',
      desc: '百度',
      url: 'http://www.baidu.com/baidu?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },
    google: {
      type: 'google',
      desc: '谷歌',
      url: 'http://www.google.com.hk/search?client=aff-cs-360se&ie=UTF-8',
      key: 'q',
      params: {
        client: 'aff-cs-360se',
        ie: 'UTF-8'
      }
    },

    news_so: {
      type: 'news_so',
      desc: '360搜索',
      url: 'http://news.so.360.cn/ns?ie=utf-8&tn=news&src=360se6_addr',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    news_baidu: {
      type: 'news_baidu',
      desc: '百度',
      url: 'http://news.baidu.com/ns?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },
    news_google: {
      type: 'news_google',
      desc: '谷歌',
      url: 'http://news.google.com.hk/news/search?client=aff-cs-360se&ie=UTF-8',
      key: 'q',
      params: {
        client: 'aff-cs-360se',
        ie: 'UTF-8'
      }
    },

    video_so: {
      type: 'video_so',
      desc: '360搜索',
      url: 'http://video.so.com/v?src=360se6_addr&ie=utf-8',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    video_baidu: {
      type: 'video_baidu',
      desc: '百度',
      url: 'http://video.baidu.com/v?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },
    video_google: {
      type: 'video_google',
      desc: '谷歌',
      url: 'http://www.google.com.hk/search?client=aff-cs-360se&ie=UTF-8',
      key: 'q',
      params: {
        tbm: 'vid',
        client: 'aff-cs-360se',
        ie: 'UTF-8'
      }
    },

    image_so: {
      type: 'image_so',
      desc: '360搜索',
      url: 'http://image.so.com/i?src=360se6_addr&ie=utf-8',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    image_baidu: {
      type: 'image_baidu',
      desc: '百度',
      url: 'http://image.baidu.com/i?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },
    image_google: {
      type: 'image_google',
      desc: '谷歌',
      url: 'http://images.google.com.hk/images?client=aff-cs-360se&ie=UTF-8',
      key: 'q',
      params: {
        client: 'aff-cs-360se',
        ie: 'UTF-8'
      }
    },

    music_so: {
      type: 'music_so',
      desc: '360搜索',
      url: 'http://s.music.so.com/s?src=360se6_addr&ie=utf-8',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    music_baidu: {
      type: 'music_baidu',
      desc: '百度',
      url: 'http://music.baidu.com/search?&ie=utf-8',
      key: 'key',
      params: {
        ie: 'utf-8'
      }
    },
    music_sogou: {
      type: 'music_sogou',
      desc: '搜狗',
      url: 'http://mp3.sogou.com/music?ie=UTF-8',
      key: 'query',
      params: {
        ie: 'UTF-8'
      }
    },

    map_so: {
      type: 'map_so',
      desc: '360搜索',
      url: 'http://map.so.com/?src=360se6_addr&ie=utf-8&t=map',
      key: 'k',
      params: {
        src: '360se6_addr',
        ie: 'utf-8',
        t: 'map'
      }
    },
    map_baidu: {
      type: 'map_baidu',
      desc: '百度',
      url: 'http://map.baidu.com/m?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },
    map_google: {
      type: 'map_google',
      desc: '谷歌',
      url: 'http://ditu.google.cn/maps?client=aff-cs-360se&ie=UTF-8',
      key: 'q',
      params: {
        client: 'aff-cs-360se',
        ie: 'UTF-8'
      }
    },

    wenda_so: {
      type: 'wenda_so',
      desc: '360问答',
      url: 'http://wenda.qihoo.com/search/?src=360se6_addr&ie=utf-8',
      key: 'q',
      params: {
        src: '360se6_addr',
        ie: 'utf-8'
      }
    },
    wenda_baidu: {
      type: 'wenda_baidu',
      desc: '百度',
      url: 'http://zhidao.baidu.com/search?&ie=utf-8',
      key: 'word',
      params: {
        ie: 'utf-8'
      }
    },

  };

  var searchTypeMaps = {
    webpage: ['so', 'google', 'baidu'],
    news: ['news_so', 'news_google', 'news_baidu'],
    video: ['video_so', 'video_google', 'video_baidu'],
    image: ['image_so', 'image_google', 'image_baidu'],
    music: ['music_so', 'music_sogou', 'music_baidu'],
    map: ['map_so', 'map_google', 'map_baidu'],
    wenda: ['wenda_so', 'wenda_baidu'],
  };

  function setSearchType(type) {
    $('.search-cat > a').removeClass('on').filter('[cat-name=' + type + ']').addClass('on');
    var engines;
    if (engines = searchTypeMaps[type]) {
      $('.search-menu').empty();
      engines.forEach(function(sn) {
        var item = searchMaps[sn] || {};
        $('.search-menu').append('<li><a __href="#" class="' + item.type + '"></a>' + item.desc + '</li>');
      });
      var jitem = $('.search-menu .' + storage.get('default_engine')[type]);
      if (jitem.length == 0) {
        jitem = $('.search-menu a:first');
      }
      jitem.trigger('click');

      saveSetting('search_type', 'setSearchType("' + type + '")');

      return true;
    }
  }

  $('.search-cat > a').live('click', function() {
    if (setSearchType($(this).attr('cat-name'))) {

    }
  });

  $('.search-menu li').live('click', function(e) {
    var searchItem;
    if (searchItem = searchMaps[e.target.className] || searchMaps[e.target.firstElementChild.className]) {

      setSearch(searchItem);
      $('.search-menu').slideUp(200);

      saveSetting('search', 'setSearch(' + JSON.stringify(searchItem) + ');');
      storage.set('default_engine', $('.search-cat .on').attr('cat-name'), searchItem.type);
    }
  });

  PlaceHolder.create($('#search-kw, .placeholder'));

  $('#search-form').live('submit', function() {
    if ($('#search-kw').hasClass('input-txt-place')) {
      $('#search-kw').val('');
    }

    Stat.count('d2', $('.search-cat .on').index() * 4 + 11);

    Stat.searchTypeCount();
  });

  $(document).on('click', function(e) {
    if (e.target.id != 'search-switch' && ! $(e.target).parents('#search-switch').length && ! $(e.target).parents('.search-menu').length) {
      $('.search-menu').slideUp(100);
    }
  });

  $('#js-show-search-form').live('change', function() {
    if (this.checked) {
      if (ANIMATE_EFFECT) {
        $('#search-form').effect('explode', {
          mode: 'show'
        });
      } else {
        $('#search-form').show();
      }
    } else {
      if (ANIMATE_EFFECT) {
        $('#search-form').effect('explode');
      } else {
        $('#search-form').hide();
      }
    }
  });

  $('#js-show-in-newtab').live('change', function() {
    if (this.checked) {
      $('.tile>a').attr('target', '_blank');
    } else {
      $('.tile>a').attr('target', '_self');
    }
  });

  $('#search-kw').autocomplete('http://sug.so.360.cn/suggest?encodein=utf-8&encodeout=utf-8', {
    selectFirst: false,
    dataType: 'jsonp',
    scrollHeight: 300,
    parse: function(data) {
      var parsed = [];
      data.s.forEach(function(v) {
        parsed.push({
          data: [v],
          value: v,
          result: v
        });
      });
      return parsed;
    }
  }).on('result', function(e, data) {
    if (data.text) {
      Stat.count('d2', $('.search-cat .on').index() * 4 + 14);
    } else {
      Stat.count('d2', $('.search-cat .on').index() * 4 + 12);
    }
    if (data.link) {
      location = data.link;
      return;
    }
    Stat.searchTypeCount();
    $(this).parents('form')[0].submit();
  });

  var customModeTipTimer;
  $('.custom-mode-tips .btn-close').live('click', function() {
    $(this.parentNode).hide();
    clearTimeout(customModeTipTimer);
  });
  $('#js-grid-from').live('change', function() {
    console.log('change');
    if ($('#js-grid-from').val() == 2) {
      if (localStorage.firstRun !== 'no') {
        localStorage.firstRun = 'no';
        $('.custom-mode-tips').fadeIn();
        customModeTipTimer = setTimeout(function() {
          $('.custom-mode-tips').fadeOut();
        },
        10000);
      }
    }
    reloadGrid();
  });

  $('#js-grid-count').live('change', function() {
    reloadGrid();
  });

  function saveGrid() {
    var tiles = parseGrid('.tile');
    window.gridAddedUrlMap = {};
    tiles.forEach(function(tile, i) {
      /*if (tile.url.substr(0, 7) == 'widget:') {
        delete tile['url'];
        tile['type'] = 'widget';
      }*/
      window.gridAddedUrlMap[tile.url] = tile;
      if (tile.url == ImportData.yihaodian) {
        Stat.set('d0', 5, (i+1));
      }
    });

    $('.smart-push').removeClass('active');
    var smartPushArr = [];
    var emptyGridCount = $('.tile .empty').length;
    var mostVisited = window.smartMostVisited || [];
    mostVisited.forEach(function(tile, i) {
      if (tile.title) {
        if (gridAddedUrlMap[tile.url] == undefined && smartPushArr.length < emptyGridCount) {
          var mv_li = $('<li><a></a></li>');
          mv_li.children().attr('href', tile.url);
          mv_li.children().text(tile.title);
          smartPushArr.push(mv_li[0].outerHTML);
          if (smartPushArr.length == emptyGridCount && i <= mostVisited.length - 1) {
            $('.smart-push').addClass('active');
          }
        }
      }
    });
    if (smartPushArr.length > 0) {
      $('.smart-push-pre-ui').removeClass('nodata');
      $('.smart-push-pre h3').html('用您最常访问网址填充空白格子：');
    } else {
      $('.smart-push-pre-ui').addClass('nodata');
      $('.smart-push-pre h3').html('暂无可推荐的网址');
    }
    $('.smart-push-pre ul').html(smartPushArr.join(''));

    ntpApis.setUserMostVisited(JSON.stringify(tiles), function() {});

    Stat.set('d0', 1, 1);
  }

  function parseGrid(sel) {
    var tiles = [];
    $(sel).each(function(i, tile) {

      tiles.push({
        title: $('.tile-tit', tile).text() || '',
        url: $('.link', tile).attr('href') || ''
      });

    });
    return tiles;
  }

  $('#js-addurl-cancel').live('click', function() {
    var idx = $('#js-addurl-foridx').val() - 0;
    if (ANIMATE_EFFECT) {
      $(".add-url").effect('transfer', {
        to: '.tile:eq(' + idx + ') img:first',
        className: 'effects-transfer'
      },
      300);
    }
    $('.add-url').hide();
    $(".addurl-mask").hide(); //fadeOut(150);
    Stat.count('d4', 2);
  });

  $('.tile-add').live('mouseover', function() {
    $("img:eq(0)", this).hide();
    $("img:eq(1)", this).show();
  }).live('mouseleave', function() {
    $("img:eq(0)", this).show();
    $("img:eq(1)", this).hide();
  });

  $(".tile-add").live('click', function(e) {
    AddUrlDlg.show();
    $(".add-url").show().css('opacity', 0);
    $(this).effect('transfer', {
      to: '.add-url',
      className: 'effects-transfer'
    },
    200, function() {
      $('.add-url').css('opacity', 1);
    });
    $(".addurl-mask").show(); //fadeIn(200);
    $('#add-url-form input[type=text]').val('');

    var curLi = $(this).parents('li')[0];
    [].slice.call(curLi.parentNode.children, 0).every(function(el, idx) {
      if (el == curLi) {
        $('#js-addurl-foridx').val(idx);
        return false;
      }
      return true;
    });
  });

  $(".url-cls").click(function() {
    var idx = $('#js-addurl-foridx').val() - 0;
    if (ANIMATE_EFFECT) {
      $(".add-url").effect('transfer', {
        to: '.tile:eq(' + idx + ') img:first',
        className: 'effects-transfer'
      },
      300);
    }
    $('.add-url').hide();
    $(".addurl-mask").hide(); //.fadeOut(150);
    Stat.count('d4', 2);
  });

  $(".setup-tit").click(function(e) {
    Stat.count('d1', 2);

    var setupPop = $('.setup-pop');

    if (setupPop.is(':animated')) {
      return false;
    }

    if (setupPop.is(':visible')) {
      if (ANIMATE_EFFECT) {
        setupPop.effect('drop', {
          direction: 'up',
          mode: 'hide'
        });
      } else {
        setupPop.hide();
      }
    } else {
      if (ANIMATE_EFFECT) {
        setupPop.effect('drop', {
          direction: 'up',
          mode: 'show'
        });
      } else {
        setupPop.show();
      }
    }

  });
  $(".setup-cls").click(function() {
    if (ANIMATE_EFFECT) {
      $(".setup-pop").effect('drop', {
        direction: 'up'
      });
    } else {
      $('.setup-pop').hide();
    }
  });
  $(document).mousedown(function(e) {
    if (!$(e.target).parents('.setup-pop').length && e.target.className != 'setup-tit') {
      if ($('.setup-pop').is(':visible') && ! $('.setup-pop').is(':animated')) {
        if (ANIMATE_EFFECT) {
          $(".setup-pop").effect('drop', {
            direction: 'up'
          });
        } else {
          $('.setup-pop').hide();
        }
      }
    }
  });

  var timerResize;
  $(window).on('resize', function() {
    $(document.body).css({
      overflow: 'hidden'
    });
    $('.tile .box, .box img').css('height', imgHeight = Math.floor($('.tile .box').width() * 0.7027) + 'px');
    if ($('.wrap .tile').length) {
      $('.wrap').css({
        'top': Math.max(window.innerHeight / 2 - $('.wrap').height() / 2, 50) + 'px',
        'left': Math.max($(window).width() / 2 - $('.wrap').width() / 2, 10) + 'px'
      });
    } else {
      $('.wrap').css({
        'top': window.innerHeight / 2 - $('.wrap').height() + 'px',
        'left': $(window).width() / 2 - $('.wrap').width() / 2 + 'px'
      });
    }
    $(document.body).css({
      overflow: 'auto'
    });
    if (!timerResize) {
      timerResize = setTimeout(function() {
        clearTimeout(timerResize);
        timerResize = null;

        $('.wrap').css('opacity', 1);
      },
      200);
    }
    return arguments.callee;
  } ());

  $('#js-addurl-url').live('blur', function(e) {
    if (!/^(https?):\/\//i.test(this.value)) {
      this.value = 'http://' + this.value;
    }
    this.value = this.value.replace(/\|/g, '%7c');
  });

  $('.url-often li').live('click', function(e) {
    $('#js-addurl-title').val($(this).text().replace(/(^\s*)/g, '').replace(/(\s*)$/, ''));
    $('#js-addurl-url').val($('a', this).attr('href'));
    e.preventDefault();
  });

  $('.url-often li').live('dblclick', function(e) {
    $('#js-addurl-title').val($(this).text().replace(/(^\s*)/g, '').replace(/(\s*)$/, ''));
    $('#js-addurl-url').val($('a', this).attr('href'));
    $('#js-addurl-confirm').trigger('click');
    e.preventDefault();
  });

  $('.url-often li').live('mouseenter', function() {
    $(this).addClass("hover");
  }).live('mouseleave', function() {
    $(this).removeClass("hover");
  });

  var $div_li = $(".url-tag li");
  $div_li.click(function() {
    $(this)
    /*.addClass("cur")*/
    .siblings().removeClass("cur");
    var index = $div_li.index(this);
    $(".url-often > ul").eq(index).show().siblings().hide();
  });

  $(".tile").live('mouseover', function() {
    $(this).addClass("tile-on");
  });
  $('.tile').live('mouseleave', function() {
    $(this).removeClass("tile-on")
  });
  $(".btn").hover(function() {
    $(this).addClass("btnhov");
  },
  function() {
    $(this).removeClass("btnhov");
  });
  $(".btn").mousedown(function() {
    $(this).addClass("btnclk");
  });
  $(".btn").mouseup(function() {
    $(this).addClass("btnup");
  });
  $(".btn").mouseleave(function() {
    $(this).removeClass("btnup");
    $(this).removeClass("btnclk")
  });
  $(".btn-2").hover(function() {
    $(this).addClass("btn-2hov");
  },
  function() {
    $(this).removeClass("btn-2hov");
  });
  $(".btn-2").mousedown(function() {
    $(this).addClass("btn-2clk");
  });
  $(".btn-2").mouseup(function() {
    $(this).addClass("btn-2up");
  });
  $(".btn-2").mouseleave(function() {
    $(this).removeClass("btn-2up");
    $(this).removeClass("btn-2clk")
  });
  $(".btn-3").hover(function() {
    $(this).addClass("btn-3hov");
  },
  function() {
    $(this).removeClass("btn-3hov");
  });
  $(".btn-3").mousedown(function() {
    $(this).addClass("btn-3clk");
  });
  $(".btn-3").mouseup(function() {
    $(this).addClass("btn-3up");
  });
  $(".btn-3").mouseleave(function() {
    $(this).removeClass("btn-3up");
    $(this).removeClass("btn-3clk")
  });
  $(".url-cls").hover(function() {
    $(this).addClass("url-clshov");
  },
  function() {
    $(this).removeClass("url-clshov");
  });
  $(".url-cls").mousedown(function() {
    $(this).addClass("url-clsclk");
  });
  $(".url-cls").mouseup(function() {
    $(this).addClass("url-clsup");
  });
  $(".url-cls").mouseleave(function() {
    $(this).removeClass("url-clsup");
    $(this).removeClass("url-clsclk")
  });

  $('a').live('click', function(e) {
    if ($(this).attr('href') == '#') {
      e.preventDefault();
    }
  });

  $('#clearBlackList').live('click', function() {
    ntpApis.clearMostVisitedURLsBlacklist();

  });
  $('#removeUrlsFromBlackList').live('click', function() {
    /*
    $(this).effect('transfer', {to:('.tile:eq(' + window.redo_idx + ') img:first'), className:'effects-transfer'}, function(){
      chrome.send('removeURLsFromMostVisitedBlacklist', [window.redo_url]);
    });
    */
    //chrome.send('removeURLsFromMostVisitedBlacklist', [window.redo_url]);
    if (window.redo_grid) {
      redo_grid.short_url = redo_grid.url.shorting(50);
      var logo = $('.tile:eq(' + redo_grid.index + ') .box').append($.tmpl($('#tile-logo-temp').html(), redo_grid).html()).find('.tile-logo');
      logo.css({
        position: 'absolute',
        top: - logo.height()
      }).animate({
        top: 0
      },
      600, 'easeOutBounce_restore', function() {
        saveGrid();
      });

    }
  });
  $('.remove-tips a').live('click', function(e) {
    clearTimeout(window.timerRemoveTipHandler);
    $('.remove-tips').fadeOut();
  });

  jQuery.extend(jQuery.easing, {
    /*
    x = t/d
    t: 当前时间 - animate开始时间的毫秒值
    b: 起始值，一直为0
    c: 这个个人认为是递增值，一直为1
    d: animate中的duration参数，即设置的动画效果运行完毕需要的时间
    */
    easeOutBounce_restore: function(x, t, b, c, d) {
      if (x < (1.5 / 2.75)) {
        return c * (3.3611 * x * x) + b;
      } else {
        if (x < (2 / 2.75)) {
          return c * (7.5625 * (x -= (1.7 / 2.75)) * x + .91) + b;
        } else {
          if (x < (2.4 / 2.75)) {
            return c * (7.5625 * (x -= (2.2 / 2.75)) * x + 0.96) + b;
          } else {
            return c * (7.5625 * (x -= (2.6 / 2.75)) * x + 0.9775) + b;
          }
        }
      }
      /*if (x < (1 / 2.75)) {
                return c * (7.5625 * x * x) + b
            } else {
                if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.85) + b
                } else {
                    if (t < (2.5 / 2.75)) {
                        return c * (7.5625 * (t -= (2.25 / 2.75))   * t + 0.9375) + b
                    } else {
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b
                    }
                }
            }*/
    }
  });

  $('.remove').live('click', function(e) {
    Stat.count('d3', 2);

    $(this).parents('.box').addClass('empty');

    if ($(this).parent().hasClass('tile-widget')) {
      Stat.count('d3', 9);
      TipsManager.hideNewsBoxTips();
      newsbox.desctruct();
      localStorage.removeItem('news_box');
    }

    var logo = $(this).parent('.tile-logo');
    logo.addClass('hide-tit');
    /*logo.css({position:'absolute', top:0})
    .animate({top:-logo.height()}, 400, 'easeInOutCubic', function(){
      var link = $(this).parent('.link');
      window.redo_grid = {index:$(this).parents('.tile').index(), url:link.attr('href'), title:link.find('.tile-tit').text()};
      console.log(redo_grid);

      link.remove();
          saveGrid();

      $('.remove-tips').css('left', $('.tile img').offset().left + 'px').fadeIn();
  
      window.timerRemoveTipHandler && clearTimeout(window.timerRemoveTipHandler);
      window.timerRemoveTipHandler = setTimeout(function(){
      $('.remove-tips').fadeOut();
      }, 10000);
    });*/

    logo.effect('fade', 200, function() {
      $(this).parent('.link').remove();
      saveGrid();
    });

    e.preventDefault();
  });

  $('.js-auto-save').live('change', function() {

    if ($(this).attr('type') == 'checkbox') {
      saveSetting(this.id, '$("#' + this.id + '").attr("checked",' + this.checked + ')');
    } else {
      saveSetting([this.id], '$("#' + this.id + '").val("' + $(this).val() + '")');
    }
  });

  $('#add-url-form input[type=text]').live('keypress', function(e) {
    if (e.charCode == 13) {
      $('#js-addurl-url').trigger('blur');
      $('#add-url-form').trigger('submit');
    }
  });

  $('#add-url-form').validate({
    rules: {
      url: {
        required: true,
        url: true
      }
    },
    messages: {
      url: {
        required: '',
        url: '网址输入有误，请确认后重试'
      }
    },
    submitHandler: function(e) {
      Stat.count('d4', 4);

      var title = $('#js-addurl-title').val().replace(/^\s*/, '').replace(/\s*$/, ''),
      url = $('#js-addurl-url').val(),
      idx = $('#js-addurl-foridx').val() - 0;

      if (url) {
        $('.tile:eq(' + idx + ')').fadeOut(500, function() {
          // news-box
          if (url.substr(0, 7) == 'widget:') {
            var li = $(this).html($.tmpl(tileWidgetTempStr, {
              title: title || url,
              widget_type: url.replace(/^widget:\/\//, ''),
              url: url
            }).html());

            initWidgetBox();

            li.fadeIn().find('.box').css('height', imgHeight);
          } else {
            $(this).html($.tmpl(tileTmplStr, {
              title: title || url,
              short_url: url.shorting(50),
              url: url
            }).html()).fadeIn().find('.box').css('height', imgHeight).find('.tile-logo img').attr('src', 'images/loading.gif');

            if ($('#js-show-in-newtab')[0].checked) {
              $(this).find('.link').attr('target', '_blank');
            }

            ntpApis.captureWebpage(url, function(args) {
              $('.tile a[href="' + args[0] + '"]').attr('href', args[1]);
              saveGrid();
            });

            window['capture_timeout_' + url] = setTimeout(function() {
              window.onSnapshotComplete([url, CAPTURE_ERRNO_TIMEOUT]);
            },
            CAPTURE_TIMEOUT);
          }

          saveGrid();
        });
      }
      $(".add-url").effect('transfer', {
        to: '.tile:eq(' + idx + ') img:first',
        className: 'effects-transfer'
      }).hide();
      $(".addurl-mask").hide(); //.fadeOut(150);
    }
  });

  window.onSnapshotComplete = function(args) {
    console.log('onSnapshotComplete被调用', arguments);
    args = args || [];
    var url = args[0],
    errno = args[1];
    clearTimeout(window['capture_timeout_' + url]);
    if (url && errno) {
      var query = '.tile a[href^="' + url + '"] img[src="images/loading.gif"]',
      img = $(query)[0];
      if (!img) {
        query = '.tile a[href^="' + url + '"] img';
        img = $(query)[0];
      }
      if (img) {
        img.src = 'chrome://thumb/' + url;
      }
    }
  };

  (function(undef) {

    var DELAY_DRAG_OFFSET = 2;

    function getDragRects(selector) {
      var dragRects = [];
      $(selector).each(function(index, item) {
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

    var dragObj, rects, startX, startY, boxX, boxY, dragHelper, passDrag, sx, sy, cx, cy, downObj, dragStart;
    $('.tile:not(.ui-state-disabled) .tile-logo,.tile:not(.ui-state-disabled) .tile-add').live('mousedown', function(e) {
      sx = e.clientX,
      sy = e.clientY;
      dragStart = true;
      downObj = $(this).parents('.tile')[0]; //this.parentNode.parentNode;
    });

    $(document).live('mouseup', function(e) {
      dragStart = false;
      if (dragObj) {

        if (Math.max(Math.abs(cx - sx), Math.abs(cy - sy)) > DELAY_DRAG_OFFSET) {
          e.preventDefault();
        }

        Stat.count('d3', 3);

        if (passDrag) {
          $(passDrag).removeClass('pass-drag').removeClass('pass-drag-left').removeClass('pass-drag-top').removeClass('pass-drag-right').removeClass('pass-drag-bottom');

          $(dragHelper).animate({
            left: passDrag.rect.left + 'px',
            top: passDrag.rect.top + 'px'
          },
          200, function(dragObj) {
            return function() {
              var url1 = $(dragHelper).find('.link').attr('href') || '';
              var url2 = $(dragSwitcher).find('.link').attr('href') || '';

              dragObj.innerHTML = dragSwitcher.innerHTML;
              //dragObj.swapNode(passDrag);
              $(dragObj).css('opacity', 1);
              passDrag.innerHTML = dragHelper.innerHTML;
              $(passDrag).css('opacity', 1);
              document.body.removeChild(dragHelper);
              document.body.removeChild(dragSwitcher);

              if (url1.substr(0, 7) == 'widget:' || url2.substr(0, 7) == 'widget:') {
                TipsManager.hideNewsBoxTips();
                initWidgetBox();
              }

              saveGrid();
            };
          } (dragObj));

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
          },
          200);
          document.body.appendChild(dragSwitcher);

        } else {
          $(dragHelper).animate({
            left: $(dragObj).offset().left + 'px',
            top: $(dragObj).offset().top + 'px'
          },
          200, function(dragObj) {
            return function() {
              var url1 = $(dragHelper).find('.link').attr('href') || '';

              dragObj.innerHTML = dragHelper.innerHTML;
              $(dragObj).css('opacity', 1);
              document.body.removeChild(dragHelper);

              if (url1.substr(0, 7) == 'widget:') {
                initWidgetBox();
              }
            };
          } (dragObj));
        }
        dragObj = null;
      }
    });

    $(document).live('mousemove', function(e) {
      cx = e.clientX;
      cy = e.clientY;

      if (!dragObj) {
        if (!dragStart) {
          return false;
        }
        if (e.button) { //only left-mousebutton
          return false;
        }

        if (Math.max(Math.abs(cx - sx), Math.abs(cy - sy)) < DELAY_DRAG_OFFSET) {
          return false;
        }

        var self = downObj,
        jSelf = $(self);

        rects = getDragRects('.tile:not(.ui-state-disabled)'); //get all dragbox rectangle
        dragObj = self;

        startX = e.pageX;
        startY = e.pageY;

        boxX = jSelf.offset().left - startX;
        boxY = jSelf.offset().top - startY;

        dragHelper = document.createElement('div');
        dragHelper.innerHTML = dragObj.innerHTML;
        $(dragObj).css('opacity', 0);
        $(dragHelper).addClass('drag-helper').css({
          width: jSelf.width() + 'px',
          height: jSelf.height() + 'px',
          left: jSelf.offset().left + 'px',
          top: jSelf.offset().top + 'px'
        });
        document.body.appendChild(dragHelper);
      } else {
        var deltaX = e.pageX - startX,
        deltaY = e.pageY - startY,
        newPosX = startX + deltaX + boxX,
        newPosY = startY + deltaY + boxY;

        $(dragHelper).css({
          left: newPosX + 'px',
          top: newPosY + 'px'
        });

        var hitDrag;
        rects.every(function(rect) { //拿到当前mousemove命中到的元素
          if (e.pageX > rect.left && e.pageX < rect.right) {
            if (e.pageY > rect.top && e.pageY < rect.bottom) {
              if (rect.drag !== dragObj) {
                hitDrag = rect.drag;
              }
              return false;
            }
          }
          return true;
        });

        if (hitDrag !== passDrag) {

          if (passDrag) {
            $(passDrag).removeClass('pass-drag').removeClass('pass-drag-left').removeClass('pass-drag-top').removeClass('pass-drag-right').removeClass('pass-drag-bottom');
          }

          passDrag = hitDrag;
          if (!passDrag) {
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

          if (passRect.left > dragRect.left) {
            $(passDrag).addClass('pass-drag-left');
          } else if (passRect.left < dragRect.left) {
            $(passDrag).addClass('pass-drag-right');
          }

          if (passRect.top > dragRect.top) {
            $(passDrag).addClass('pass-drag-top');
          } else if (passRect.top < dragRect.top) {
            $(passDrag).addClass('pass-drag-bottom');
          }

        }
      }
    });

  })();

  $('.ipt input').on('focus', function() {
    $(this).parents('.search').addClass('focus');
  });
  $('.ipt input').on('blur', function() {
    $(this).parents('.search').removeClass('focus');
  });

  ImportData.setting();

  loadSettings();

  if (!$('#js-show-search-form')[0].checked) {
    $('#search-form').hide();
  } else {
    Stat.count('d2', 1);
  }

  $('img, a').live('dragstart', function(e) {
    return false;
  });

  Stat.set('d0', 2, $('#js-show-search-form')[0].checked ? 1: 0);
  Stat.set('d0', 3, $('#js-show-in-newtab')[0].checked ? 1: 0);
  Stat.set('d0', 4, $('#js-grid-count').val() - 0);
  var statSTMap = {
    webpage: 11,
    news: 12,
    video: 13,
    image: 14,
    music: 15,
    map: 16,
    wenda: 17,
  };
  $.each(statSTMap, function(key, value) {
    var dft = (storage.get('default_engine')[key] || 'so');
    dft = dft.replace(key + '_', '');
    var code;
    switch (dft) {
    case 'so':
      code = key == 'wenda' ? 5: 1;
      break;
    case 'google':
      code = 2;
      break;
    case 'baidu':
      code = 3;
      break;
    case 'sogou':
      code = 4;
      break;
    }
    Stat.set('d0', value, code);
  });

  $('.link').live('click', function(e) {
    if ($(this).attr('href') == ImportData.yihaodian) {
      Stat.count('d5', 2);
      Stat.count('d5', $(this).parents('.tile').index() + 11);
    }
    if (e.target.className != 'remove') {
      Stat.count('d3', 1);
      Stat.count('d3', $(this).parents('.tile').index() + 21);
    ntpApis.onClickThumbnail(this.href);
    }
  });
  $('.tile-widget').live('click', function(e) {
    Stat.count('d3', 7);
  });

  HotKeyword.init($('#search-kw'));

  $('.smart-push-f').hover(function() {
    $('.smart-push-pre').show();
  },
  function() {
    $('.smart-push-pre').hide();
  });
  $('.smart-push').on('click', function() {
    Stat.count('d1', 3);

    window.smartPrevGridData = parseGrid('.tile')
    var gridData = parseGrid('.tile'),
    mostVisited = window.smartMostVisited || [];
    var pushed = false;
    gridData.every(function(item, i) {
      if (mostVisited.length <= 0) {
        return false;
      }
      if (!item.url) {
        while (mostVisited.length > 0) {
          var mt = mostVisited.shift();
          if (!isExist(mt.url)) {
            gridData[i] = mt;
            pushed = true;
			ntpApis.captureWebpage(mt.url, function(){});
            break;
          }
        }
      }
      return true;
    });

    if (pushed) {
      ntpApis.setUserMostVisited(JSON.stringify(gridData), reloadGrid);
      $('.smart-push-tips, .smart-push-pre').hide();
      $('.smart-restore-tips').fadeIn();
      window.timerSmartRestoreTipHandler && clearTimeout(window.timerSmartRestoreTipHandler);
      window.timerSmartRestoreTipHandler = setTimeout(function() {
        $('.smart-restore-tips').fadeOut();
      },
      10000);
    }

    function isExist(url) {
      for (var i = 0; i < gridData.length; i++) {
        if (gridData[i].url && gridData[i].url == url) {
          return true;
        }
      }
      return false;
    }
  });

  $('.restore-griddata').on('click', function() {
    Stat.count('d1', 4);

    window.smartPrevGridData && ntpApis.setUserMostVisited(JSON.stringify(window.smartPrevGridData), reloadGrid);
    window.timerSmartRestoreTipHandler && clearTimeout(window.timerSmartRestoreTipHandler);
    $('.smart-restore-tips').fadeOut();
  });

  function initWidgetBox() {
    window.newsbox && newsbox.desctruct();
    window.newsbox = new NewsBox('.widget.news-box', {
      type: 'news',
      target: $('#js-show-in-newtab').attr('checked') ? '_blank': '_self'
    });
    newsbox.render();
  }
});

