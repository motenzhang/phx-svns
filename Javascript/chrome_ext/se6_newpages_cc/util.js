var AddUrlDlg = function(){
	var inited = false;
	var sitesData;
	function init() {
		if (inited) {
			return;
		}
		inited = true;
		$('.add-url .url-cats li').on('click', function(){
			Stat.count('d4', $(this).index() + 11);
			
			showTab($(this).attr('cat-name'));
		})
		$('input[name=add-url-q]').on('keyup', function(){
			search($(this).val());
		});
		DC.get('http://site.browser.360.cn/csite.php?callback=?', {rn:Date.now()}, function(ret){
			sitesData = ret && ret.data;
			sitesData['hot'].unshift({title:'新闻格子', url:'widget://news-box', logo:'images/news_default.jpg'})
			$(AddUrlDlg).trigger('showtab');
		});
	}
	function showTab(name) {
		$('.add-url .url-cats li').removeClass('on').filter('[cat-name=' + name + ']').addClass('on');
		if (name == 'custom') {
			Stat.count('d4', 3);

			$('.add-url .recommend').hide();
			$('.add-url .custom').show();
			localStorage['__addurl_default_tab'] = 'custom';
			return;
		}
		$('.add-url .recommend').show();
		$('.add-url .custom').hide();
		localStorage['__addurl_default_tab'] = 'hot';
		if (sitesData) {
			buildTab();
		} else {
			$(AddUrlDlg).on('showtab', buildTab);
		}
	}
	function buildTab() {
		var name = $('.add-url .url-cats li.on').attr('cat-name');
		render(sitesData[name]);
	}
	function render(list) {
		list = list || [];
		var sb = [];
		$.each(list, function(i, item){
			var added = window.gridAddedUrlMap[item.url] || window.gridAddedUrlMap[item.url + '/'];
			var isWidget = item.url.substr(0, 7) == 'widget:';
			sb.push('<li class="' + (isWidget ? 'widget' : '') + ' ' + (added ? 'added' : '') + '" url="' + item.url + '" title="' + item.title + '"> <i class=""></i><img src="' + item.logo + '"><h4>' + item.title + '</h4></li>');
		});
		$('.add-url .recommend .logo-list').html(sb.join(''));
		$('.add-url .recommend .logo-list li:not(.widget.added)').click(function(){
			Stat.count('d4', $('.add-url .url-cats li.on').index() + 12);
			
			$('#js-addurl-title').val($(this).attr('title'));
			$('#js-addurl-url').val($(this).attr('url'));
			$('#add-url-form').submit();
		});
		getStatus();
	}
	function search(q) {
		Stat.count('d4', 5);
		var ret = [];
		$.each(sitesData, function(name, list){
			$.each(list, function(i, item){
				if (item.title.indexOf(q) > -1 || item.url.indexOf(q) > -1) {
					ret.push(item);
				}
			})
		});
		if (ret.length > 0) {
			$('.add-url .recommend .nodata').hide();
		} else {
			$('.add-url .recommend .nodata').show();
		}
		render(ret);
	}
	function getStatus() {
		
	}
	return {
		show: function(){
			init();
			$(this).trigger('onshow');
		},
		onshow: function(){
			sugSelect.hide();
			showTab(localStorage['__addurl_default_tab'] || 'hot');
			Stat.count('d4', 1);
		}
	};
}();

var HotKeyword = function(){
	var keywordData;
	var input, container, toggle;
	function toggleSug() {
		clearTimeout(window.sug_hide_timeout);
		if (!toggle.hasClass('open')) {
			render() &&	sugSelect.show('hot-keyword');
		} else {
			toggle.removeClass('open');
			container.hide();
		}
		input.focus();
		return false;
	}
	function render() {
		var cat = $('.search-cat .on').attr('cat-name');
		var list = keywordData && keywordData[cat];
		if (!list) {
			return;
		}
		var ul = container.find('ul');
		ul.empty();
		list.forEach(function(item, i){
			var li = $('<li><a href="#"><em class="hot">' + (i+1) + '</em><span class="' + (item.new == '1' ? 'new' : '') + '">' + item.text + '</span></a></li>');
			ul.append(li);
			item.result = item.text;
			$.data(li[0], "ac_data", item);
		});
		Stat.count('d2', $('.search-cat .on').index() * 4 + 13);
		toggle.addClass('open');
		return true;
	}
	return {
		init: function(ele) {
			container = $('.ac_results');
			input = ele.on('click', function(){
				if ($(this).val() == '') {
					toggleSug();
				}
			});
			toggle = $('#search-hotword').on('click', toggleSug);
			DC.get('http://site.browser.360.cn/sword.php?callback=?', {rn:Date.now()}, function(ret){
				keywordData = ret && ret.data;
				$(HotKeyword).trigger('ondata');
			});
		},
		ondata: function(){
			console.log(keywordData);
			toggle.show();
		}
	};
}();

var storage = {
	get: function(key) {
		return JSON.parse(localStorage[key] || '{}');
	},
	set: function(key, subkey, val) {
		var data = this.get(key);
		data[subkey] = val;
		localStorage[key] = JSON.stringify(data);
	},
};

var DC = function(){
	var _key = '__ajax_cache';
	var expires = 1000 * 60 * 60;
	var storage = {
		get: function(key) {
			return JSON.parse(localStorage[key] || '{}');
		},
		set: function(key, data) {
			localStorage[key] = JSON.stringify(data);
		},
		getCache: function(key) {
			var cache = storage.get(_key)[key];
			if (cache && (Date.now() - cache['expires'] < expires)) {
				return cache['data'];
			}
			return null;
		},
		setCache: function(key, val) {
			var data = storage.get(_key);
			data[key] = {data:val, expires:Date.now()};
			storage.set(_key, data);
		},
	};
	
	return {
		get: function(url, data, callback){
			var cache;
			if (cache = storage.getCache(url)) {
				callback(cache);
			} else {
				$.getJSON(url, data, function(ret) {
					storage.setCache(url, ret);
					callback(ret);
				});
			}
		}
	};
}();


var ImportData = function(){
	function isDone() {
		return storage.get('__import_data')['done'];
	}
	function getmode(){
		var cmd = storage.get('settings')['js-grid-from'];
		return ((cmd == undefined) || (cmd == '$("#js-grid-from").val("1")')) ? 1 : 2;
	}
	return {
		setting: function(){
			if (isDone()) {
				return;
			}
			$.each(storage.get('settings'), function(key, value){
				console.log(key, value);
				switch (key) {
					case 'js-grid-count':
						if (value == '$("#js-grid-count").val("8")'
							|| value == '$("#js-grid-count").val("0")') {
							storage.set('settings', 'js-grid-count', '$("#js-grid-count").val("12")');
						}
						break;
				}
			});
		},
		grid: function(mosts, customs, gridCount, ntpApis, callback){
			if (isDone()) {
				return;
			}
			var mode = getmode();
			console.log('ImportData mode: ', mode);
			if (mosts.length > 10) {
				mosts = mosts.slice(0, 10);
			}
			var newData = mode == 1 ? mosts : customs;
			
			while (newData.length < gridCount) {
				newData.push({title:'', url:'', filler:true});
			}
			
			var emptyCount = 0;
			newData.forEach(function(item, i){
				if (item.filler == true) {
					emptyCount++;
					if (emptyCount == 2) {
						newData[i] = {title:'新闻格子', url:'widget://news-box'};
					}
				}
			});
			
			ntpApis.setUserMostVisited(JSON.stringify(newData), function(){
				callback();
			});
			console.log(newData);
			ImportData.done();
		},
		done: function() {
			storage.set('__import_data', 'done', true);
		}
	};
}();

var TipsManager = function(){
	var session = false;
	return {
		showNewsBoxTips: function(){
			if (!session && storage.get('__tips_manager')['news-box']) {
				return;
			}
			session = true;
			var newsbox = $('.grid .tile-widget .news-box');
			if (newsbox.length > 0) {
				var point = newsbox.offset();
				$('.news-box-tips').css({
					left: point.left,
					top: point.top + newsbox.height() + 10,
				}).fadeIn().find('.btn-close').unbind().bind('click', function(){
					$(this).parents('.yellow-tips').fadeOut();
				});
				$(window).resize(function(){
					var point = $('.grid .tile-widget .news-box').offset();
					if (point.left <= 0) {
						$('.news-box-tips').hide();
						return;
					}
					$('.news-box-tips').css({
						left: point.left,
						top: point.top + newsbox.height() + 10,
					}).show();
				});
				storage.set('__tips_manager', 'news-box', true);
			} else {
				$('.news-box-tips').hide();
			}
		},
		showSmartPushTips: function(emptyGrid){
			if (storage.get('__tips_manager')['smart-push']) {
				return;
			}

			if (!emptyGrid) {
				storage.set('__tips_manager', 'smart-push-start-date', Date.now());
				return;
			}

			if (!storage.get('__tips_manager')['smart-push-start-date']) {
				storage.set('__tips_manager', 'smart-push-start-date', Date.now());
			}
			
			if (Date.now() - storage.get('__tips_manager')['smart-push-start-date'] > 1000 * 60 *60 * 24 * 15) {
				var count = storage.get('__tips_manager')['smart-push-show-count'] || 0
				if (count >= 1) {
					storage.set('__tips_manager', 'smart-push', true);
				}
				storage.set('__tips_manager', 'smart-push-show-count', count + 1);
				storage.set('__tips_manager', 'smart-push-start-date', Date.now());

				$('.smart-push-tips').fadeIn().find('.btn-close').unbind().bind('click', function(){
					window.timerSmartPushTipHandler && clearTimeout(window.timerSmartPushTipHandler);
					$(this).parents('.yellow-tips').fadeOut();
				});
				window.timerSmartPushTipHandler && clearTimeout(window.timerSmartPushTipHandler);
				window.timerSmartPushTipHandler = setTimeout(function(){
					$('.smart-push-tips').fadeOut();
				}, 10000);
				
			}
		},
	};
}();