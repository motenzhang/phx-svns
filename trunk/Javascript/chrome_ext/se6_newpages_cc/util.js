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
			sitesData = ret && ret.data;
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
		render(sitesData[name]);
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
		onshow: onshow
	};
}();

var HotKeyword = function(){
	var keywordData;
	var container;
	function toggleSug() {
		if (container.css('display') == 'none') {
			render();
			sugSelect.show('hot-keyword');
		} else {
			container.hide();
		}
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
	}
	return {
		init: function(ele) {
			container = $('.ac_results');
			ele.on('click', function(){
				if ($(this).val() == '') {
					toggleSug();
				}
			});
			DC.get('http://site.browser.360.cn/sword.php?callback=?', {rn:Date.now()}, function(ret){
				keywordData = ret && ret.data;
				$(HotKeyword).trigger('ondata');
			});
		},
		ondata: function(){
			console.log(keywordData);
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
	function setting() {
		$.each(storage.get('settings'), function(key, value){
			console.log(key, value);
			switch (key) {
				case 'js-grid-count':
					if (value == '$("#js-grid-count").val("8")') {
						storage.set('settings', 'js-grid-count', '$("#js-grid-count").val("12")');
					}
					break;
					
			}
		});
	}
	return {
		getmode: function(){
			var cmd = storage.get('settings')['js-grid-from'];
			return ((cmd == undefined) || (cmd == '$("#js-grid-from").val("1")')) ? 1 : 2;
		},
		exec: function(){
			if (storage.get('__import_data')['done']) {
			//	return;
			}
			setting();	
		},
		done: function() {
			storage.set('__import_data', 'done', true);
		}
	};
}();
