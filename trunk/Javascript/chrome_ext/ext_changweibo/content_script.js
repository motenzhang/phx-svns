var page = {
    screen_num: 0,
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
            page.screen_num = 0;
            window.scrollTo(0, 0);
            ret.page_width = document.body.scrollWidth;
            ret.page_height = document.body.scrollHeight;
            ret.start_y = 0;
            response(ret);
            break;
        case 'capture_next':
            var winSize = page.getWindowSize();
            var scrollTop = ++page.screen_num * winSize.height;
            window.scrollTo(0, scrollTop);
            if (scrollTop >= document.body.scrollHeight) {
                ret.msg = 'capture_end';
            }
            ret.start_y = scrollTop;
            response(ret);
            break;
        default:
            response(ret);
            break;
    }
});
