var page = {
    scrollCount: 0,
    getWindowSize: function() {
        var result = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        };

        if (document.compatMode == 'BackCompat') {
          result.width = document.body.clientWidth;
          result.height = document.body.clientHeight;
        }

        return result;
    }
};
chrome.extension.onRequest.addListener(function(request, sender, response) {
    var ret = request;
    switch (request.msg) {
        case 'capture':
            page.scrollCount = 0;
            window.scrollTo(0, 0);
            response(ret);
            break;
        case 'capture_next':
            debugger;
            var winSize = page.getWindowSize();
            var scrollTop = ++page.scrollCount * winSize.height;
            window.scrollTo(0, scrollTop);
            if (scrollTop >= document.body.scrollHeight) {
                ret.msg = 'capture_end';
            } else {
                ret.msg = 'capture';
            }
            response(ret);
            break;
        default:
            response(ret);
            break;
    }
});
