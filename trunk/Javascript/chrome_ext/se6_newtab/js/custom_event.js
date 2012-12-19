/**
 * CETH CustomEventTargetHelper - component event fx
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
(function(host, undef){

  /**
   * @class CustomEvent event object class
   * @param {object} target
   * @param {string} type
   * @param {json} eventArgs
   */
  function CustomEvent(target, type, eventArgs){
    this.target = target;
    this.type = type;
    $.extend(this, eventArgs || {});
  }

  $.extend(CustomEvent.prototype, {
    target: null,
    currentTarget: null,
    type: null,
    returnValue: undef,
    preventDefault:function(){
      this.returnValue = false;
    }
  });


  /**
   * @class CustomEventTargetH  componet event fx
   * @singleton
   */
  var CustomEventTargetH = {
    /**
     * @method on
     * @param {object} target
     * @param {string} sEvent
     * @param {Functor} fn
     * @return {boolean}
     */
    on: function(target, sEvent, fn){
      var cbs = target.__customListeners && target.__customListeners[sEvent];
      if(!cbs){
        CustomEventTargetH.createEvents(target, sEvent);
        cbs = target.__customListeners && target.__customListeners[sEvent];
      }
      cbs.push(fn);
      return true;
    },
    /**
     * @method un
     * @param {object} target
     * @param {string} sEvent
     * @param {Functor} fn
     * @return {boolean}
     */
    un: function(target, sEvent, fn){
      var cbs = target.__customListeners && target.__customListeners[sEvent];
      if(!cbs){
        return false;
      }
      if(fn){
        var idx = [].indexOf.call(cbs,fn);
        if(idx < 0){
          return false;
        }
        cbs.splice(idx, 1);
      }else{
        cbs.length = 0;
      }
      return true;
    },
    fire: function(target, sEvent, eventArgs){
      if(sEvent instanceof CustomEvent){
        var customEvent = $.extend(sEvent, eventArgs);
        sEvent = sEvent.type;
      }else{
        customEvent = new CustomEvent(target, sEvent, eventArgs);
      }
      var cbs = target.__customListeners && target.__customListeners[sEvent];
      if(!cbs){
        CustomEventTargetH.createEvents(target, sEvent);
        cbs = target.__customListeners && target.__customListeners[sEvent];
      }
      if(sEvent != '*'){
        cbs = cbs.concat(target.__customListeners['*'] || []);
      }
      customEvent.returnValue = undef;
      var obj = customEvent.currentTarget = target;

      if(obj && obj['on'+customEvent.type]){
        var retDef = obj['on'+customEvent.type].call(obj, customEvent); //先调用默认的onxxx
      }
      for(var i=0; i<cbs.length; i++){
        cbs[i].call(obj, customEvent);
      }

      return customEvent.returnValue !== false && (retDef !== false || customEvent.returnValue !== undef);
    },
    createEvents: function(target, types){
      types = types || [];
      if(typeof types == 'string'){
        types = types.split(',');
      }
      var listeners = target.__customListeners = target.__customListeners || {};
      for(var i=0; i<types.length; i++){
        listeners[types[i]] = listeners[types[i]] || [];
      }
      listeners['*'] = listeners['*'] || [];
      return target;
    }
  };

  $.extend(host,{   //写入宿主
    CETH: CustomEventTargetH
  });
})(window);
