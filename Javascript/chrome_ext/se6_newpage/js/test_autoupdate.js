$(function(){
	$('#create_fs').click(function(){
		var ver = $('#ver').val();
		/*FileSystem2.createDir(['ntp', ver], null, function(dir){
			console.log(dir);
		});*/
		ajax.get('http://upext.browser.360.cn/update/check/app/newtab/version/' + window.main_version, {}, function(ret){
			ret = JSON.parse(ret);
			if (ret.version > window.main_version && ret.files) {
				var count = 0;
				ret.files.forEach(function(item){
					count++;
					download(item[1], ver, function(file, url){
						if (url.indexOf('main.js') > -1) {
							localStorage['newver'] = url;
						}
						if (--count <= 0) {
							alert('下载保存完毕， 刷新页面使用新版');
						}
					});
				});
			}
		});
		
		return;
		var _count = 0;
		[
			'js/background.js',
			'js/background_entry.js',
			'js/combo.js',
			'js/config.js',
			'js/jquery-1.8.0.min.js',
			'js/jquery-ui-1.9.1.custom.min.js',
			'js/jquery.autocomplete.js',
			'js/jquery.validate.min.js',
			'js/main.js',
			'js/new_page.js',
			'js/require.js',
			'js/stat.js',
			'js/storage_util.js',
			
			'css/styl.css', 
			'img/baidu_ico.gif',
			'img/default_logo.png',
			'img/disabled_select.png',
			'img/google_ico.png',
			'img/imgbg.png',
			'img/loading.gif',
			'img/select.png',
			'img/so_ico.png',
			'img/tile_add.png',
			'img/tile_addhov.png',
		].forEach(function(item){
			_count++;
			download('http://' + item, ver, function(file, url){
				if (url.indexOf('main.js') > -1) {
					localStorage['newver'] = url;
				}
				if (--_count <= 0) {
					alert('下载保存完毕， 刷新页面使用新版');
				}
			});
		});
	});
	
	
	function download(file, path, callback) {
		ajax.download(file + '?' + (+new Date), function(ret){
			FileSystem2.saveFile('ntp/' + path + '/' + file, ret, function(file, url){
				console.log(file, url);
				callback && callback(file, url);
			});
		});
	}
	
	
});


var FileSystem2 = function(){
	var _fs;
	window.st = window.st || +new Date();
	window.webkitRequestFileSystem(window.PERSISTENT, 50 * 1024 * 1024, function(fs){
		console.log('申请本地存储成功：', fs, +new Date - st + 'ms(距页面打开)');
		_fs = fs;
		$(FileSystem2).trigger('init');
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
			var fn = FileSystem2[method];
			if (!_fs) {
				$(FileSystem2).bind('init', function(e){fn.apply(null, args)});
				return;
			}
			fn.apply(null, args);
		},
		'getFile': function(url, onSuccess, onError){
			_fs.root.getFile(url, {create:false}, function(file){
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
		'saveFile': function(path, blob, onSuccess) {
			var pos = path.lastIndexOf('/');
			var dir = path.substring(0, pos);
			var name = path.substring(pos + 1, path.length);
//			var dir = path.replace(/[^/]*$/, '');
//			var name = path.match(/[^/]*$/)[0];
			FileSystem2.createDir(dir.split('/'), null, function(dir){
				dir.getFile(name, {create:true}, function(file){
					file.createWriter(function (writer) {
						writer.onwrite = function(){
							onSuccess(path, file.toURL());
						};
						writer.onerror = error_handle;
						writer.write(blob);
//						writer.truncate(0);
					});
				}, error_handle);
			});
			return;
			_fs.root.getFile(getPath(url), {create:true}, function(file){
				file.createWriter(function (writer) {
					writer.onwrite = function(){
						onSuccess(url, file.toURL());
					};
					writer.onerror = error_handle;
					writer.write(blob);
				});
			}, error_handle);
		},
		'createDir': function(folders, root, callback) {
			root = root || _fs.root;
			root.getDirectory(folders[0], {create: true}, function(dirEntry) {
				if (folders.length) {
				  FileSystem2.createDir(folders.slice(1), dirEntry, callback);
				} else {
					callback(dirEntry);
				}
			  }, error_handle);
		}
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