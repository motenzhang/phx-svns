var AddUrlDlg = function(){
	var inited = false;
	var sitesData;
	function init() {
		if (inited) {
			return;
		}
		inited = true;
		$('.add-url .url-cats li').on('click', function(){
			showTab($(this).attr('cat-name'));
		})
		$('input[name=add-url-q]').on('keyup', function(){
			search($(this).val());
		});
		DC.get('http://site.browser.360.cn/csite.php?callback=?', {rn:Date.now()}, function(ret){
			sitesData = ret;
			$(AddUrlDlg).trigger('showtab');
		});
	}
	function onshow() {
		showTab(localStorage['__addurl_default_tab'] || 'hot');
	}
	function showTab(name) {
		$('.add-url .url-cats li').removeClass('on').filter('[cat-name=' + name + ']').addClass('on');
		if (name == 'custom') {
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
		render(sitesData.data[name]);
	}
	function render(list) {
		list = list || [];
		var sb = [];
		$.each(list, function(i, item){
			sb.push('<li url="' + item.url + '" title="' + item.title + '"> <i class="' + ((window.gridAddedUrlMap[item.url] || window.gridAddedUrlMap[item.url + '/']) ? 'added' : '') + '"></i><img src="' + item.logo + '"><h4>' + item.title + '</h4></li>');
		});
		$('.add-url .recommend .logo-list').html(sb.join(''));
		$('.add-url .recommend .logo-list li').click(function(){
			$('#js-addurl-title').val($(this).attr('title'));
			$('#js-addurl-url').val($(this).attr('url'));
			$('#add-url-form').submit();
		});
		getStatus();
	}
	function search(q) {
		var ret = [];
		$.each(sitesData.data, function(name, list){
			$.each(list, function(i, item){
				console.log(item);
				if (item.title.indexOf(q) > -1 || item.url.indexOf(q) > -1) {
					ret.push(item);
				}
			})
		});
		render(ret);
	}
	function getStatus() {
		
	}
	return {
		show: function(){
			init();
			$(this).trigger('onshow');
		},
		onshow: onshow
	};
}();

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