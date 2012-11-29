var startUrl = 'http://localhost/work/Javascript/chrome_ext/ext_changweibo/changewibo/index.html';
var captureUrl = 'http://localhost/work/Javascript/chrome_ext/ext_changweibo/changewibo/capture.php';
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
                ajax.post('http://localhost/work/Javascript/chrome_ext/ext_changweibo/changewibo/save_base64.php', 
                            {dataUrl: encodeURIComponent(dataUrl)}, function(ret){
                    if (ret) {
                        chrome.tabs.update(background.tabId, {url:'http://service.weibo.com/share/share.php?url=http%3A%2F%2Fskin.se.360.cn%2F%23detail%2F1&appkey=&title=%E6%88%91%E5%88%9A%E5%8F%91%E7%8E%B0%E7%9A%84%40360%E5%AE%89%E5%85%A8%E6%B5%8F%E8%A7%88%E5%99%A8%20%E7%9A%AE%E8%82%A4%22%E9%BB%98%E8%AE%A4%E7%9A%AE%E8%82%A4%22%E4%BD%A0%E5%96%9C%E6%AC%A2%E5%90%97%EF%BC%9F%E6%9B%B4%E6%8D%A2%E6%BC%82%E4%BA%AE%E7%9A%84%E7%9A%AE%E8%82%A4%EF%BC%8C%E6%8B%A5%E6%9C%89%E7%BE%8E%E4%B8%BD%E7%9A%84%E5%BF%83%E6%83%85%EF%BC%8C%E5%BF%AB%E6%9D%A5%E8%AF%95%E8%AF%95%E5%90%A7%EF%BC%81&pic=' + ret});
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
