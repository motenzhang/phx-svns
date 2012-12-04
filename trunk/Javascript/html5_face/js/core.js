core = {};
/**
 * 继承
 */
core.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;
};
/**
 * 调用基类
 */
core.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
	// This is a constructor. Call the superclass constructor.
	return caller.superClass_.constructor.apply(
		me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
	   ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
	if (ctor.prototype[opt_methodName] === caller) {
	  foundCaller = true;
	} else if (foundCaller) {
	  return ctor.prototype[opt_methodName].apply(me, args);
	}
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
	return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
	throw Error(
		'goog.base called from a method of one name ' +
		'to a method of a different name');
  }
};
/**
 * 默认合并
 */
core.merge = function(tg, ad) {
	for(var k in ad) {
		tg[k] = ad[k];
	}
};
/**
 * 克隆，支持深浅拷贝
 */
core.clone = function(obj, shallow) {
	shallow = shallow?true:false;
	var c = {};
	for(var k in obj) {
		if(!shallow && typeof(obj[k]) == 'object') {
			c[k] = core.clone(obj[k],false);
		}else{
			c[k] = obj[k];
		}
	}
	return c;
};
/**
 * 定义命名空间
 */
core.provide = function(name,parent) {
	if(typeof(name) === 'string') {
		names = name.split('.');
	}else if(name instanceof Array){
		names = name;
	}
	if(typeof(parent) === 'undefined') {
		parent = window;
	}
	name = names.shift();
	if(name) {
		if(typeof(parent[name])==='undefined') {
			parent[name] = {};
		}
		core.provide(names, parent[name]);
	}
};
/**
 * 定义一个类，并继承基类
 */
core.class = function(childCtor,parentCtor,member) {
	if(parentCtor) {
		core.inherits(childCtor,parentCtor);
	}
	for(var name in member) {
		var prefix = name.substr(0,5);
		
		// 定义__getter和__setter
		if(prefix === '__get') {
			var suffix = name[5].toLowerCase() + name.substr(6);
			ctor.prototype.__defineGetter__(suffix,member[name]);
		}else if(prefix === '__set'){
			var suffix = name[5].toLowerCase() + name.substr(6);
			childCtor.prototype.__defineSetter__(suffix,member[name]);
		}else{
			childCtor.prototype[name] = member[name];
		}
	}
	return childCtor;
};