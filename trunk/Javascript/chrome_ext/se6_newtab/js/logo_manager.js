var logoManager = function(){
	return {
		'getLogos': function(grids, callback){
			var noLogoUrls = [];
			var count = 0;
			function queryFailLogos() {
				if (--count == 0 && noLogoUrls.length > 0) {
					logoManager.queryLogos(noLogoUrls, function(url, logo){
						callback(url, logo);
					});
				}
			}
			grids.forEach(function(item){
				if (item.url) {
					count++;
					logoManager.getLogo(item.url, function(url, logo){
						callback(url, logo);
						queryFailLogos();
					}, function(url){
						noLogoUrls.push(url);
						queryFailLogos();
					});
				}
			});
		},
		'getLogo': function(url, onSuccess, onError) {
			FileSystem.exec('getFile', [url, function(logo){
				onSuccess(url, logo);
			}, function(err){
				if (onError) {
					onError(url);
				} else {
					logoManager.queryLogos([url], function(url, logo){
						onSuccess(url, logo);
					});
				}
			}]);
		},
		'deleteLogo': function(url) {
			FileSystem.exec('deleteFile', [url]);
		},
		'queryLogos':function(urls, callback) {
			if (!urls.forEach) {
				urls = [urls];
			}
			var sites = [];
			var urlmap = {};
			urls.forEach(function(url){
				var qurl = (url.replace(/^\w+\:\/\//, ''));
				urlmap[qurl] = url;
				sites.push(encodeURIComponent(qurl));
			});
			ajax.post('http://site.browser.360.cn/', {rn:+new Date(), sitedata:(JSON.stringify(sites))}, function(ret){
				try {
					ret = JSON.parse(ret);
				} catch (e) {}
				if (ret.errno == 0) {
					$.each(ret.data, function(url, item){
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
					callback(url, logo);
				}]);
			});
		}
	};
}();

var FileSystem = function(){
	var _fs;
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
	function fixPath(path) {
		return path.replace(/\//g, '');
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
			_fs.root.getFile(fixPath(url), {create:false}, function(file){
				onSuccess(file.toURL());
			}, function(err){
				onError(url);
			});
		},
		'deleteFile': function(url) {
			_fs.root.getFile(fixPath(url), {create:false}, function(file){
				file.remove(success_handle);
			}, error_handle);
		},
		'saveFile': function(url, blob, onSuccess) {
			_fs.root.getFile(fixPath(url), {create:true}, function(file){
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


var ajax = {
	request: function (method, url, callback, data, responseType) {
		var xhr = new window.XMLHttpRequest();
		var _cb = function(){
			if (_cb && xhr.readyState === 4) {
				_cb = undefined;
				callback(xhr.response, xhr.status);
			}
		};
		xhr.onreadystatechange = _cb;
		xhr.open(method, url, true);
		var sb = [];
		for (var x in data) {
			sb.push(x + '=' + data[x]);
		}
		data = sb.join('&');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		if (responseType) {
			xhr.responseType = responseType;
		}
		xhr.send(data);
	},
	get: function (url, callback) {
		this.request('GET', url, callback);
	},
	post: function (url, data, callback) {
		this.request('POST', url, callback, data);
	},
	download: function(url, callback) {
		this.request('GET', url, callback, null, 'blob');
	}
};