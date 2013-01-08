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
	try {
      chrome.send(methodName, args);
	} catch (e) {
		switch (methodName) {
					case 'getMostVisited':
						setTimeout(function(){
							window[args[0]]([{"direction":"ltr","title":"360\u6269\u5C55\u4E2D\u5FC3","url":"http://ext.se.360.cn/"},{"direction":"ltr","title":"\u767E\u5EA6\u4E00\u4E0B\uFF0C\u4F60\u5C31\u77E5\u9053","url":"http://www.baidu.com/"},{"direction":"ltr","title":"\u7EDF\u4E00\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF","url":"http://admin.browser.qihoo.net:8360/"},{"direction":"ltr","title":"360\u5BFC\u822A_\u65B0\u4E00\u4EE3\u5B89\u5168\u4E0A\u7F51\u5BFC\u822A","url":"http://hao.360.cn/"},{"direction":"ltr","title":"\u65B0\u6D6A","url":"http://www.sina.com.cn/"},{"direction":"ltr","title":"\u7F51\u6613","url":"http://www.163.com/"},{"direction":"ltr","title":"\u6DD8\u5B9D\u7F51","url":"http://www.taobao.com/"},{"direction":"ltr","title":"\u4F18\u9177","url":"http://www.youku.com/"},{"direction":"ltr","title":"\u65B0\u6D6A\u5FAE\u535A","url":"http://weibo.com/"},{"direction":"ltr","title":"\u4EBA\u4EBA\u7F51","url":"http://www.renren.com/"},{"direction":"ltr","title":"403 - \u7981\u6B62\u8BBF\u95EE: \u8BBF\u95EE\u88AB\u62D2\u7EDD\u3002","url":"http://mail.corp.qihoo.net/"},{"direction":"ltr","title":"403 - \u7981\u6B62\u8BBF\u95EE: \u8BBF\u95EE\u88AB\u62D2\u7EDD\u3002","url":"http://mail.corp.qihoo.net/owa"}],[{"direction":"ltr","title":"360\u6269\u5C55\u4E2D\u5FC3","url":"http://ext.se.360.cn/"},{"direction":"ltr","title":"360\u5BFC\u822A_\u65B0\u4E00\u4EE3\u5B89\u5168\u4E0A\u7F51\u5BFC\u822A","url":"http://hao.360.cn/"},{"direction":"ltr","title":"\u767E\u5EA6\u4E00\u4E0B\uFF0C\u4F60\u5C31\u77E5\u9053","url":"http://www.baidu.com/"},{"direction":"ltr","title":"\u65B0\u6D6A","url":"http://www.sina.com.cn/"},{"filler":true},{"filler":true},{"filler":true},{"filler":true}],false);
						}, 0);
						return;
		}
	}
    }
  };

  $.extend(host, {
    ChromeWebUIApis: ChromeWebUIApis
  });
  
})(window, window.chrome);
