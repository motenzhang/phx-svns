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
						//chrome.tabs.update(tab.id, {url:'http://service.weibo.com/share/share.php?url=http%3A%2F%2Fskin.se.360.cn%2F%23detail%2F1&appkey=&title=%E6%88%91%E5%88%9A%E5%8F%91%E7%8E%B0%E7%9A%84%40360%E5%AE%89%E5%85%A8%E6%B5%8F%E8%A7%88%E5%99%A8%20%E7%9A%AE%E8%82%A4%22%E9%BB%98%E8%AE%A4%E7%9A%AE%E8%82%A4%22%E4%BD%A0%E5%96%9C%E6%AC%A2%E5%90%97%EF%BC%9F%E6%9B%B4%E6%8D%A2%E6%BC%82%E4%BA%AE%E7%9A%84%E7%9A%AE%E8%82%A4%EF%BC%8C%E6%8B%A5%E6%9C%89%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%BF%83%E6%83%85%EF%BC%8C%E5%BF%AB%E6%9D%A5%E8%AF%95%E8%AF%95%E5%90%A7%EF%BC%81&pic=http://p4.qhimg.com/d/360browser/20121105/morenpifu_full.jpg'});
						//chrome.tabs.remove(tab.id);
					});
				}, 1000);
			
			});		
		}, 1);
	});
};

var ajax = {
	request: function (type, url, callback, data) {
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
		this.request('GET', url, callback);
	},
	post: function (url, callback, data) {
		this.request('POST', url, callback, data);
	}
};
