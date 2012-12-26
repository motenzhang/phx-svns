var storage = function(){
	var defaultGridCount = 8;
	return {
		'getMostVisited': function(callback){
			
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
			localStorage['sync_custom_grids'] = JSON.stringify(grids);
		},
	}
}();

var logoManager = function(){
	var cSiteUrl = 'http://site.browser.360.cn/';
	return {
		'getOpTitle': function(url) {
			return logoManager.getSiteData(url, 'title');
		},
		'getOpLogo': function(url) {
			return logoManager.getSiteData(url, 'logo');
		},
		'getLogos': function(grids, callback){
			var noLogoUrls = [];
			var count = 0;
			function queryFailLogos() {
				if (--count == 0 && noLogoUrls.length > 0) {
					logoManager.queryCSite(noLogoUrls, function(url, logo){
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
		'queryCSite':function(urls, callback) {
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
			ajax.post(cSiteUrl, {rn:+new Date(), sitedata:(JSON.stringify(sites))}, function(ret){
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
		    var csitedata = localStorage['csitedata'] = localStorage['csitedata'] || '{}',
			csitedata = JSON.parse(csitedata);
			csitedata[url] = csitedata[url] || {};
			
			if (title)	csitedata[url]['title'] = title;
			if (logo)	csitedata[url]['logo'] = logo;

		    localStorage['csitedata'] = JSON.stringify(csitedata);
		},
		'getSiteData': function(url, field) {
		    var csitedata = localStorage['csitedata'] = localStorage['csitedata'] || '{}',
			csitedata = JSON.parse(csitedata);
			return csitedata[url] && csitedata[url][field] || '';
		},
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
}
