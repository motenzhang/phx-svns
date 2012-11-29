tinyMCE.init({
	// General options
	elements	: 'content',
	mode		: 'exact',
	theme		: 'advanced',
	skin		: 'o2k7',
	skin_variant: 'silver',
	plugins		: 'safari,table,advimage,inlinepopups,media,contextmenu,paste,fullscreen,iframe',
	language	: 'zh',
	width		: '650',
	height		: '450',
	element_format : 'html',
	remove_script_host : false,
	relative_urls : false,
	document_base_url : '../../',
	// Theme options
	theme_advanced_buttons1: 'bold,italic,underline,|,forecolor,backcolor,fontselect,fontsizeselect,justifyleft,justifycenter,justifyright,|,bullist,numlist,outdent,indent,|,table,image,link,unlink,|,code,fullscreen',
	theme_advanced_buttons2: '',
	theme_advanced_buttons3 : '',
	theme_advanced_toolbar_location : 'top',
	theme_advanced_toolbar_align : 'left',
	theme_advanced_statusbar_location : 'none',
	theme_advanced_resizing : false,
	//content_css : 'css/content.css',
	template_external_list_url : 'lists/template_list.js',
	external_link_list_url : 'lists/link_list.js',
	external_image_list_url : 'lists/image_list.js',
	media_external_list_url : 'lists/media_list.js',
	// Replace values for the template plugin
	template_replace_values : {
	}
});


var button = document.getElementById('btnSend');
btnSend.onclick = function(){
	var cont = tinyMCE.get('content').getContent();
	cont = cont.replace(/([\r\n'])/g, '\\$1');
	console.log(cont);
	chrome.tabs.create({
		url:'http://localhost/php/ext_weibo/capture.html',//chrome.extension.getURL("weibo.html"),
		selected:false
	}, function(tab) {
		//alert('created')
		setTimeout(function(){
			//alert('exec before')
			chrome.tabs.executeScript(tab.id, {code:"alert(0);document.getElementById('content').innerHTML = '" + cont + "';"}, function(){
				//alert('exec comple');
				setTimeout(function(){
					chrome.tabs.captureVisibleTab(null,{
						format:"png"
					}, function(dataUrl){
						document.getElementById('preview').src = dataUrl;
						console.log(dataUrl);
						ajax.post('http://localhost/php/ext_weibo/save_base64.php', function(){
						}, {dataUrl: encodeURIComponent(dataUrl)});
						//chrome.tabs.update(tab.id, {url:'http://service.weibo.com/share/share.php?appkey=&title=这是一条长微博，点击下方图片查看内容。' + new Date().toLocaleTimeString() + '&pic=http://p4.qhimg.com/d/360browser/20121105/morenpifu_full.jpg'});
						//chrome.tabs.remove(tab.id);
					});
				}, 1000);
			
			});		
		}, 1);
	});
};

var ajax = {
	request: function (type, url, data, callback) {
		var xhr = new window.XMLHttpRequest();
		var _cb = function(){
			if (_cb && xhr.readyState === 4) {
				_cb = undefined;
				callback(xhr.responseText, xhr.status);
			}
		};
		xhr.onreadystatechange = _cb;
		xhr.open(type, url, true);
		var sb = [];
		for (var x in data) {
			sb.push(x + '=' + data[x]);
		}
		data = sb.join('&');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	},
	get: function (url, callback) {
		this.request('GET', url, null, callback);
	},
	post: function (url, data, callback) {
		this.request('POST', url, data, callback);
	}
};
