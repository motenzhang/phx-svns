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
      chrome.send(methodName, args);
    }
  };

  $.extend(host, {
    ChromeWebUIApis: ChromeWebUIApis
  });
  
})(window, window.chrome);
