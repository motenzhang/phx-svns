/**
 * ChromeWebUIApis
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
(function(host, chrome, undef){

  var slice = Array.prototype.slice,
  noop = $.noop;


  /**
   * @function exportPath
   * @param1 name
   * @param2 opt_object
   * @param3 opt_objectToExportTo
   */
  function exportPath(name, opt_object, opt_objectToExportTo) {
    var parts = name.split('.');
    var cur = opt_objectToExportTo || host;

    for (var part; parts.length && (part = parts.shift());) {
      if (!parts.length && opt_object !== undefined) {
        // last part and we have an object; use it
        cur[part] = opt_object;
      } else if (part in cur) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
    return cur;
  };

  /**
   * @function unname
   * @param1 path
   * @param2 obj
   */
  function unname(path, obj){
    var parts = path.split('.');
    var cur = obj || host;
    var previous = cur;
    for (var part; parts.length && (part = parts.shift());){
      if(cur[part]){
        previous = cur;
        cur = cur[part];
      }
    }
    delete previous[part];
  }

  
  var ChromeWebUIApis = function(opts){

    var self = this,
    opts = opts || {},
    methods = opts.methods || [];

    $.extend(self, opts);


    if(typeof methods == 'string'){
      methods = methods.split(',');
    }

    methods.forEach(function(methodName){

      /**
       * reg functor as runtime
       */
      self[methodName] = function(){    //注册每个chrome接口函数

        var args = slice.call(arguments,0),
        isUnname = args.lenght && typeof args[args.length-1] == 'boolean' && args.pop() || false,
        callToken = args.length && typeof args[args.length-1] == 'string' && args.pop()  || '__'+(+new Date)+'_'+Math.floor(Math.random()*1e5),
        callback = args.length && typeof args[args.length-1] == 'function' && args.pop() || noop;


        exportPath(callToken, function(ret){
          callback.apply(self, slice.call(arguments,0));
          isUnname && unname(callToken, host);
        }, host);

        try{
          CETH.fire(self, 'before', {
            methodName: methodName,
            args: args
          });
          self.post(methodName, [callToken].concat(args));
        }catch(ex){
			throw ex;
          CETH.fire(self, 'error', {
            methodName: methodName,
            callback: host[callToken]
          });
        }

      };

    });

    CETH.createEvents(this, ChromeWebUIApis.EVENTS);
  };


  ChromeWebUIApis.EVENTS = 'before,after,error';
  ChromeWebUIApis.prototype = {
    post: function(methodName, args){
		console.log('chrome.send', methodName, args);
		switch (methodName) {
			case 'getMostVisited':
				window[args[0]]([{"direction":"ltr","title":"\u6DD8\u5B9D\u7F51 - \u6DD8\uFF01\u6211\u559C\u6B22","url":"http://www.taobao.com/"},{"direction":"ltr","title":"\u65B0\u6D6A\u9996\u9875","url":"http://www.sina.com.cn/"},{"direction":"ltr","title":"360\u5BFC\u822A","url":"http://hao.360.cn/"},{"direction":"ltr","title":"\u7F51\u6613","url":"http://www.163.com/"},{"direction":"ltr","title":"\u767E\u5EA6\u4E00\u4E0B\uFF0C\u4F60\u5C31\u77E5\u9053","url":"http://www.baidu.com/"},{"direction":"ltr","title":"\u4F18\u9177","url":"http://www.youku.com/"},{"direction":"ltr","title":"\u65B0\u6D6A\u5FAE\u535A","url":"http://weibo.com/"},{"direction":"ltr","title":"\u4EBA\u4EBA\u7F51","url":"http://www.renren.com/"},{"direction":"ltr","title":"\u4E2A\u4EBA\u4E2D\u5FC3 - 360\u5B89\u5168\u6D4F\u89C8\u5668","url":"http://my.browser.360.cn/"},{"direction":"ltr","title":"\u6B63\u54C1OKG\u70ED\u9500\u8FD0\u52A8\u7537\u978B 2012\u79CB\u51AC\u65B0\u6B3E\u65F6\u5C1A\u4F11\u95F2\u978B \u4F4E\u5E2E\u978B\u5B50 \u7537 \u677F\u978B-\u6DD8\u5B9D\u7F51","url":"http://item.taobao.com/item.htm?spm=a1z0d.1.1000638.4.k5PrMO&id=10184612150"},{"direction":"ltr","title":"\u6211\u7684360\u4E2A\u4EBA\u4E2D\u5FC3-\u8BBE\u7F6E\u65B0\u5934\u50CF","url":"http://i.360.cn/profile/avatar/destUrl/?from=360se"},{"direction":"ltr","title":"\u65F6\u95F4\u673A\u5668","url":"http://app.browser.360.cn/recover/"},{"direction":"ltr","title":"360\u6269\u5C55\u4E2D\u5FC3","url":"http://ext.se.360.cn/"}],[{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true},{"filler":true}],false);
				return;
		}
      chrome.send(methodName, args);
    }
  };

  $.extend(host, {
    ChromeWebUIApis: ChromeWebUIApis
  });
  
})(window, window.chrome);
