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
		'getThumbs': function(grids, callback){
			//console.log(grids);
			grids.forEach(function(item){
				FileSystem.getFile(item.url);
			});
		},
	}
}();

var FileSystem = function(){
	var fs;
	var st = new Date().getTime();
	var ssst = new Date().getTime();
	window.webkitRequestFileSystem(1, 50 * 1024 * 1024, function(fs){
		console.log(new Date().getTime() - ssst);
	});
/*	window.webkitRequestFileSystem(window.PERSISTENT, 50 * 1024 * 1024, function(fs){
		console.log(fs, '123---', new Date().getTime() - st);
		fs = fs;
	});*/
	return {
		'cb': function(){
		},
		'getFile': function(fileName){
			console.log(fs);
			fs.root.getFile(fileName, {}, function(file){
				console.log(file);
			});
		},
	};
}();


var ajax = {
	request: function (method, url, callback, data) {
		var xhr = new window.XMLHttpRequest();
		var _cb = function(){
			if (_cb && xhr.readyState === 4) {
				_cb = undefined;
				callback(xhr.responseText, xhr.status);
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
		xhr.send(data);
	},
	get: function (url, callback) {
		this.request('GET', url, callback);
	},
	post: function (url, callback, data) {
		this.request('POST', url, callback, data);
	}
};