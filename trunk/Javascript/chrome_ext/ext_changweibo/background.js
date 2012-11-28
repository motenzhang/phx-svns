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
                background.capture(function(){
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
    capture: function(callback){
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
            debugger;
            var img = new Image();
            img.onload = function(){
                var context = background.canvas.getContext('2d');
                context.drawImage(img, 0, 0/*, 1024, 768, 0, 0, 1024, 768*/);
                	chrome.tabs.create({
                        url: data,
                        selected:false
                    });
                	chrome.tabs.create({
                        url: background.canvas.toDataURL('image/png'),
                        selected:false
                    });
                callback();
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