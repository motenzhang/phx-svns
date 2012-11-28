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
                background.canvas.width = response.page_width;
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
                	chrome.tabs.create({
                        url: background.canvas.toDataURL('image/png'),
                        selected:false
                    });
                break;
        }
    },
    capture: function(start_y, callback){
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
            var img = new Image();
            img.onload = function(){
                    var context = background.canvas.getContext('2d');
                    context.drawImage(img, 0, 0, 440, img.height, 0, start_y, 440, img.height);
                    chrome.tabs.create({
                        url: data,
                        selected:false
                    });
                    chrome.tabs.create({
                        url: background.canvas.toDataURL('image/png'),
                        selected:false
                    });
                setTimeout(function(){
                    callback();
                }, 1000);
            };
            img.src = data;
        });
    }
};

chrome.webNavigation.onCompleted.addListener(function(e){
	switch (e.url) {
        case 'http://www.baidu.com/':
            console.log(e);
            
            background.sendMessage(e.tabId, 'capture');
            break;
    }
});