var storage = function(){
	var defaultGridCount = 8;
	return {
		'getMostVisited': function(callback) {
			setTimeout(function(){
				callback([{"direction":"ltr","title":"\u6DD8\u5B9D\u7F51 - \u6DD8\uFF01\u6211\u559C\u6B22","url":"http://www.taobao.com/"},{"direction":"ltr","title":"\u65B0\u6D6A\u9996\u9875","url":"http://www.sina.com.cn/"},{"direction":"ltr","title":"360\u5BFC\u822A","url":"http://hao.360.cn/"},{"direction":"ltr","title":"\u7F51\u6613","url":"http://www.163.com/"},{"direction":"ltr","title":"\u767E\u5EA6\u4E00\u4E0B\uFF0C\u4F60\u5C31\u77E5\u9053","url":"http://www.baidu.com/"},{"direction":"ltr","title":"\u4F18\u9177","url":"http://www.youku.com/"},{"direction":"ltr","title":"\u65B0\u6D6A\u5FAE\u535A","url":"http://weibo.com/"},{"direction":"ltr","title":"\u4EBA\u4EBA\u7F51","url":"http://www.renren.com/"},{"direction":"ltr","title":"\u4E2A\u4EBA\u4E2D\u5FC3 - 360\u5B89\u5168\u6D4F\u89C8\u5668","url":"http://my.browser.360.cn/"},{"direction":"ltr","title":"\u6B63\u54C1OKG\u70ED\u9500\u8FD0\u52A8\u7537\u978B 2012\u79CB\u51AC\u65B0\u6B3E\u65F6\u5C1A\u4F11\u95F2\u978B \u4F4E\u5E2E\u978B\u5B50 \u7537 \u677F\u978B-\u6DD8\u5B9D\u7F51","url":"http://item.taobao.com/item.htm?spm=a1z0d.1.1000638.4.k5PrMO&id=10184612150"},{"direction":"ltr","title":"\u6211\u7684360\u4E2A\u4EBA\u4E2D\u5FC3-\u8BBE\u7F6E\u65B0\u5934\u50CF","url":"http://i.360.cn/profile/avatar/destUrl/?from=360se"},{"direction":"ltr","title":"\u65F6\u95F4\u673A\u5668","url":"http://app.browser.360.cn/recover/"},{"direction":"ltr","title":"360\u6269\u5C55\u4E2D\u5FC3","url":"http://ext.se.360.cn/"}],[{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true}],false);
			});
		},
		'addBlackList': function(url, add) {
			var data = storage.get('sync_blacklist');
			data[url] = add;
			storage.set('sync_blacklist', data);
		},
		'clearBlackList': function(url) {
			storage.set('sync_blacklist', {});
		},
		'blackList': function(grids) {
			var data = storage.get('sync_blacklist');
			return grids.filter(function(item){
				if (data[item.url]) {
					return false;
				}
				return true;
			});
		},
		'getCustomGrids': function(){
			if (localStorage['sync_custom_grids']) {
				return JSON.parse(localStorage['sync_custom_grids']);
			}
			var grids = [];
			for (var i=0; i<defaultGridCount; i++) {
				grids.push({filler:true});
			}
			return grids;
		},
		'setCustomGrids': function(grids){
			storage.set('sync_custom_grids', grids);
		},
		'get': function(key) {
			return JSON.parse(localStorage[key] || '{}');
		},
		'set': function(key, data) {
			localStorage[key] = JSON.stringify(data);
		},
		'getLastDate': function(key) {
			var lastdate = storage.get('__lastdate');
			var ret = lastdate[key] || 0;
			storage.set('__lastdate', lastdate);
			return ret;
		},
		'setLastDate': function(key) {
			var lastdate = storage.get('__lastdate');
			lastdate[key] = +new Date();
			storage.set('__lastdate', lastdate);
		},
		'getIntervalMinute': function(key) {
			return (+new Date() - storage.getLastDate(key)) / 1000 / 60;
		},
	}
}();

var logoManager = function(){
	return {
		// 获取本地存储 优化标题
		'getOpTitle': function(url) {
			return logoManager.getSiteData(url, 'title');
		},
		'getOpLogo': function(url) {
			return logoManager.getSiteData(url, 'logo');
		},
		// 获取全部九宫格FileSystem LOGO
		'getLogos': function(grids, callback, mode){
			var queryUrls = [];
			var count = 0;
			function queryFailLogos() {
				if (--count == 0) {
					var params = {};
					if (/*true || */storage.getIntervalMinute('query_csite') > config.csite.checkUpdate) {
						console.log('check update ciste logos!!!');
						storage.setLastDate('query_csite');
						queryUrls = [];
						grids.forEach(function(item) {
							queryUrls.push(item.url);
						});
						params = {'checkup':1, 'mode':mode};
					}
					if (queryUrls.length > 0) {
						logoManager.queryCSite(queryUrls, function(url, logo){
							callback(url, logo);
						}, params);
					}
				}
			}
			grids.forEach(function(item){
				if (item.url) {
					count++;
					logoManager.getLogo(item.url, function(url, logo){
						callback(url, logo);
						queryFailLogos();
					}, function(url){
						queryUrls.push(url);
						queryFailLogos();
					});
				}
			});
		},
		'getLogo': function(url, onSuccess, onError) {
			FileSystem.exec('getFile', [url, function(logo){
				logoManager.saveSiteData(url, '', logo);
				onSuccess(url, logo);
			}, function(err){
				if (onError) {
					onError(url);
				} else {
					logoManager.queryCSite([url], function(url, logo){
						onSuccess(url, logo);
					});
				}
			}]);
		},
		'deleteLogo': function(url) {
			FileSystem.exec('deleteFile', [url]);
		},
		'queryCSite':function(urls, callback, params) {
			params = params || {};
			if (!urls.forEach) {
				urls = [urls];
			}
			var sites = [];
			var urlmap = {};
			urls.forEach(function(url){
				var qurl = (url.replace(/^\w+\:\/\//, ''));
				urlmap[qurl] = url;
				// 使用 xor 操作后，无须urlencode
				//qurl = encodeURIComponent(qurl);
				sites.push(qurl);
			});
            console.log(sites);
			var postData = {rn: +new Date()};
			postData['sitedata'] = xor(JSON.stringify(sites), postData.rn);
			$.each(params, function(key, value){
				postData[key] = value;
			});
			ajax.post(config.csite.api, postData, function(ret){
				try {
					ret = JSON.parse(ret);
				} catch (e) {}
				if (ret.errno == 0) {
					$.each(ret.data, function(url, item){
						logoManager.saveSiteData(urlmap[url], item.title);
						if (item.logo) {
							logoManager.downloadLogo(urlmap[url], item.logo, callback);
						} else {
							// capture;
							console.log('capture', urlmap[url]);
						}
					});
				} else {
					urls.forEach(function(url){
						callback(url, 'img/default_logo.png');
					});
				}
			});
		},
		'downloadLogo': function(url, logo, callback){
			ajax.download(logo, function(blob){
				FileSystem.exec('saveFile', [url, blob, function(url, logo){
					logoManager.saveSiteData(url, '', logo);
					callback(url, logo);
				}]);
			});
		},
		'saveSiteData': function(url, title, logo) {
		    var data = storage.get('csitedata');
			data[url] = data[url] || {};
			
			if (title)	data[url]['title'] = title;
			if (logo)	data[url]['logo'] = logo;

			storage.set('data', data);
		},
		'getSiteData': function(url, field) {
		    var data = storage.get('csitedata');
			return data[url] && data[url][field] || '';
		},
	};
}();

var FileSystem = function(){
	var _fs;
	window.st = window.st || +new Date();
	window.webkitRequestFileSystem(window.PERSISTENT, 50 * 1024 * 1024, function(fs){
		console.log('申请本地存储成功：', fs, +new Date - st + 'ms(距页面打开)');
		_fs = fs;
		$(FileSystem).trigger('init');
	}, function(err){
		console.log('申请本地存储失败：', err, +new Date - st + 'ms(距页面打开)');
	});
	function success_handle(e) {
		console.log('success_handle', e);
	}
	function error_handle(err) {
		console.log('error_handle', err);
	}
	function getPath(path) {
		return path.replace(/\//g, '') + '.png';
	}
	return {
		'exec': function(method, args){
			var fn = FileSystem[method];
			if (!_fs) {
				$(FileSystem).bind('init', function(e){fn.apply(null, args)});
				return;
			}
			fn.apply(null, args);
		},
		'getFile': function(url, onSuccess, onError){
			_fs.root.getFile(getPath(url), {create:false}, function(file){
				file.getMetadata(function(meta){
					if (meta.size > 0) {
						onSuccess(file.toURL());
					} else {
						onError(url);
					}
				});
			}, function(err){
				onError(url);
			});
		},
		'deleteFile': function(url) {
			_fs.root.getFile(getPath(url), {create:false}, function(file){
				file.remove(success_handle);
			}, error_handle);
		},
		'saveFile': function(url, blob, onSuccess) {
			_fs.root.getFile(getPath(url), {create:true}, function(file){
				file.createWriter(function (writer) {
					writer.onwrite = function(){
						onSuccess(url, file.toURL());
					};
					writer.onerror = error_handle;
					writer.write(blob);
				});
			}, error_handle);
		}
	};
}();

var AutoUpdate = function(){
	return {
		check: function(){
			if (/*true || */storage.getIntervalMinute('autoupdate') > config.autoupdate.interval) {
				console.log('AutoUpdate.check');
				storage.setLastDate('autoupdate');
				ajax.get(config.autoupdate.url, {
						'ntp_ver': '',
						'se6_ver': ''
					}, function(ret){
					try {
						ret = JSON.parse(ret);
					} catch (e) {}
					if (ret.errno == 0 && ret.crxUrl) {
						chrome.ntp.update(ret.crxUrl, ret.crxMd5);
					}
				});
			}
		}
	};
}();

var CDATA = function(){
	var cdataInterval = 0;
	return {
		settimer: function() {
			clearTimeout(cdataInterval);
			cdataInterval = setTimeout(function(){
				CDATA.upload();
			}, config.cdata.timer);
		},
		upload: function() {
			alert('cdata.upload')
			chrome.ntp.cdataUpload();
		},
		download: function(){
			chrome.ntp.cdataDownload();
		},
	};
}();

var ajax = {
	buildData: function(data, urlencode) {
		data = data || {};
		var sb = [];
		for (var x in data) {
			sb.push(x + '=' + (urlencode ? encodeURIComponent(data[x]) : data[x]));
		}
		data = sb.join('&');
		return data;
	},
	request: function (method, url, callback, data, responseType) {
		callback = callback || function(){};
		var xhr = new window.XMLHttpRequest();
		var _cb = function(){
			if (_cb && xhr.readyState === 4) {
				_cb = undefined;
				callback(xhr.response, xhr.status);
			}
		};
		xhr.onreadystatechange = _cb;
		xhr.open(method, url, true);
		data = this.buildData(data);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		if (responseType) {
			xhr.responseType = responseType;
		}
		xhr.send(data);
	},
	get: function (url, data, callback) {
		url = url || '';
		data = this.buildData(data, true);
		data = (url.indexOf('?') > -1 ? '&' : '?') + data;
		this.request('GET', url + data, callback);
	},
	post: function (url, data, callback) {
		this.request('POST', url, callback, data);
	},
	download: function(url, callback) {
		this.request('GET', url, callback, null, 'blob');
	}
};

function xor(str,key) {
	key = key.toString();
	var j = 0, e = '',c;
	for(var i=0;i<str.length;++i) {
		j = i%key.length;
		// 异或然后变成16禁止
		c = (str.charCodeAt(i) ^ key.charCodeAt(j)).toString(16);
		e += c.length<2 ? "0"+c : c ;
	}
	return e;
}


/**
 * PlaceHolder
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
var PlaceHolder = {
    _support: (function() {
        return '_placeholder' in document.createElement('input');
    })(),
 
    className: 'input-txt-place',
 
    init: function() {
        if (!PlaceHolder._support) {
            var inputs = document.getElementsByTagName('input');
            PlaceHolder.create(inputs);
        }
    },
 
    create: function(inputs) {
        var input;
        if (!inputs.length) {
            inputs = [inputs];
        }
        for (var i = 0, length = inputs.length; i <length; i++) {
            input = inputs[i];
            if (!PlaceHolder._support && input.attributes && input.attributes._placeholder) {
                PlaceHolder._setValue(input);
                input.addEventListener('focus', function(e) {
                    if (this.value === this.attributes._placeholder.nodeValue) {
                        this.value = '';
                        this.classList.remove(PlaceHolder.className);
                    }
                }, false);
                input.addEventListener('blur', function(e) {
                    if (this.value === '') {
                        PlaceHolder._setValue(this);
                    }
                }, false);
            }
        }
    },
 
    _setValue: function(input) {
        input.value = input.attributes._placeholder.nodeValue;
        input.classList.add(PlaceHolder.className);
    }
};

String.prototype.shorting = function(len, omiss){
	omiss = omiss || '...';
	if(this.length > len){
	  return this.substr(0,len/2) + omiss + this.substr(this.length-len/2);
	}else{
	  return this.toString();
	}
};

String.prototype.tmpl = function(data){
	var result = this.replace(/\$\{(\w+)\}/g, function($0, $1){
		return data[$1];
	});
	return (result);
};

