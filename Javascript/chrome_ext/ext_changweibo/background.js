var startUrl = 'http://localhost/work/Javascript/chrome_ext/ext_changweibo/changewibo/';
var captureUrl = 'http://localhost/work/Javascript/chrome_ext/ext_changweibo/changewibo/capture.php';

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
        setTimeout(function(){
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data) {
                var img = new Image();
                img.onload = function(){
                    var context = background.canvas.getContext('2d');
                    context.drawImage(img, 0, 0, 940, img.height, 0, start_y, 940, img.height);
                        
                    setTimeout(function(){
                        callback();
                    }, 100);
                };
                img.src = data;
            });
        }, 100);

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
