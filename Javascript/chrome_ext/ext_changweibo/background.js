var startUrl = 'http://changweibo.browser.360.cn/index.html';
var captureUrl = 'http://changweibo.browser.360.cn/capture.php';
var saveBase64Url = 'http://changweibo.browser.360.cn/save_base64.php';
var weiboImgWidth = 440;

var background = {
    tabId: null,
    canvas: document.createElement("canvas"),
    sendMessage: function(tabId, msg){
        background.tabId = tabId;
        chrome.tabs.sendRequest(tabId, {msg:msg}, background.onResponse);
    },
    onResponse: function(response){
        switch (response.msg) {
            case 'capture':
                background.canvas.width = weiboImgWidth;
                background.canvas.height = response.page_height;
                background.capture(response.start_y, function(){
                    background.sendMessage(background.tabId, 'capture_next');
                });
                break;
            case 'capture_next':
                background.capture(response.start_y, function(){
                    background.sendMessage(background.tabId, 'capture_next');
                });
                break;
            case 'capture_end':
                var dataUrl = background.canvas.toDataURL('image/png');
                ajax.post(saveBase64Url, {dataUrl: encodeURIComponent(dataUrl)}, function(ret){
                    if (ret) {
                        chrome.tabs.update(background.tabId, {url:'http://service.weibo.com/share/share.php?title=这是一条长微博，点击下方图片查看内容。' + new Date().toLocaleString() + '&pic=' + ret});
                    }
				});
                /*chrome.tabs.create({
                    url: background.canvas.toDataURL('image/png'),
                    selected:false
                });*/
                break;
        }
    },
    capture: function(start_y, callback){
        setTimeout(function(){
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
                var img = new Image();
                img.onload = function(){
                    var context = background.canvas.getContext('2d');
                    if (start_y == 0) {
                        context.clearRect(0, 0, background.canvas.width, background.canvas.height);
                    }
                    context.drawImage(img, 0, 0, weiboImgWidth, img.height, 0, start_y, weiboImgWidth, img.height);
                        
                    setTimeout(function(){
                        callback();
                    }, 100);
                };
                img.src = data;
            });
        }, 100);

    }
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

chrome.webNavigation.onCompleted.addListener(function(e){
    if (e.url && e.url.toLowerCase().indexOf(captureUrl.toLowerCase()) > -1 ) {
        console.log(e);
        setTimeout(function(){
            background.sendMessage(e.tabId, 'capture');
        }, 100);
    }
});

chrome.browserAction.onClicked.addListener(function(e){
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && tab.url.toLowerCase().indexOf(startUrl.toLowerCase()) > -1 ) {
        chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    chrome.tabs.create({url: startUrl});
  });
});
