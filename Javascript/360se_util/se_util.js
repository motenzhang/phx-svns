var SEUtil = function() {
	var Native = {
		GetSID: function(){
			try {
				var sid = external.GetSID(window);
				return sid;
			} catch(e) {
				console.log('GetSID error: ' + e);
				return '';
			}
		},
		GetMID: function(){
			try {
				var mid = external.GetMID(this.GetSID());
				return mid;
			} catch (e) {
				return '';
			}
		},
		GetRunPath: function(){
			try {
				var path = external.GetRunPath(this.GetSID());
				return path.toLowerCase();
			} catch (e) {
				return '';
			}
		},
		IsSE6: function(){
			return this.GetRunPath().indexOf('360se.exe') > -1;
		},
		Is360Chrome: function(){
			return this.GetRunPath().indexOf('360chrome.exe') > -1;
		},
		GetSE5_SID: function(){
			try {
				var sid = external.twGetSecurityID(window);
				return sid;
			} catch (e) {
				return '';
			}
		},
		IsSE5_: function(){
			return !! this.GetSE5_SID();
		},
		GetVersion: function(){
			if (this.IsSE5_()) {
				return external.twGetVersion(this.GetSE5_SID());
			}
			try {
				return external.GetVersion(this.GetSID());
			} catch (e) {
				return '';
			}
		}
	};
	
	var UA = {
		ua: navigator.userAgent,
		IsSE: function(){
			return this.ua.indexOf('QIHU') > -1 && this.ua.indexOf('360SE') > -1;
		},
		Is360Chrome: function(){
			return this.ua.indexOf('QIHU') > -1 && this.ua.indexOf('360EE') > -1;
		},
		GetOS: function(){
			var matches = this.ua.match(/Windows NT ([\w.]+)/i);
			if (matches.length == 2) {
				switch(matches[1]) {
					case '5.0':
						return 'win2000';
					case '5.1':
						return 'xp';
					case '5.2':
						return 'win2003';
					case '6.0':
						return 'vista';
					case '6.1':
						return 'win7';
					case '6.2':
						return 'win8';
				}
			}
			return 'unknown';
		},
	};
	
	var Http = {
		
	};
	
	var Ajax = {
		request: function (type, url, callback, data) {
			var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject( "Microsoft.XMLHTTP" );
			var _cb = function(){
				if (_cb && xhr.readyState === 4) {
					_cb = undefined;
					callback(xhr.responseText, xhr.status);
				}
			};
			xhr.onreadystatechange = _cb;
			xhr.open(type, url, true);
			var sb = [];
			for (var x in data) {
				sb.push(x + '=' + data[x]);
			}
			data = sb.join('&');
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(data);
		},
		get: function (url, callback) {
			this.request('GET', url, callback);
		},
		post: function (url, callback, data) {
			this.request('POST', url, callback, data);
		}
	};
	
	var JSON = function () {
		function f(n) {
			return n < 10 ? '0' + n : n;
		}
		Date.prototype.toJSON = function () {
			return this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z";
		};
		var m = {
			"\b": "\\b",
			"\t": "\\t",
			"\n": "\\n",
			"\f": "\\f",
			"\r": "\\r",
			"\"": "\\\"",
			"\\": "\\\\"
		};
	
		function stringify(value, _306f) {
			var a, i, k, l, r = /["\\\x00-\x1f\x7f-\x9f]/g,
				v;
			switch (typeof(value)) {
			case "string":
				return r.test(value) ? "\"" + value.replace(r, function (a) {
					var c = m[a];
					if (c) {
						return c;
					}
					c = a.charCodeAt();
					return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				}) + "\"" : "\"" + value + "\"";
			case "number":
				return isFinite(value) ? String(value) : "null";
			case "boolean":
				return value ? 1 : 0;
			case "null":
				return String(value);
			case "object":
				if (!value) {
					return "null";
				}
				a = [];
				if (typeof(value.length) === "number" && !(value.propertyIsEnumerable("length"))) {
					l = value.length;
					for (i = 0; i < l; i += 1) {
						a.push(stringify(value[i], _306f) || "null");
					}
					return "[" + a.join(",") + "]";
				}
				if (_306f) {
					l = _306f.length;
					for (i = 0; i < l; i += 1) {
						k = _306f[i];
						if (typeof(k) === "string") {
							v = stringify(value[k], _306f);
							if (v) {
								a.push(stringify(k) + ":" + v);
							}
						}
					}
				} else {
					for (k in value) {
						if (typeof(k) === "string") {
							v = stringify(value[k], _306f);
							if (v) {
								a.push(stringify(k) + ":" + v);
							}
						}
					}
				}
				return "{" + a.join(",") + "}";
			}
		}
		return {
			stringify: stringify,
			parse: function () {}
		};
	} ();

	var Cookie = function () {
		var prevCookie = null;
		var domain = null;
		var _user = {};
		
		window.jQuery(function($){
			window.setInterval(function () {
				if (!prevCookie || prevCookie != document.cookie) {
					prevCookie = document.cookie;
					$(Cookie).trigger('cookie_change', prevCookie);
					// 奇怪的问题 jQuery()和 $() 居然有一点点小差别， 绑定和广播，必须使用同一个。 但之前确实是可以的来着。 
				}
			}, 1000);
		});
	
		return {
			change: function(fn){
				$(Cookie).bind('cookie_change', fn);
			},
			clear: function (name) {
				var date = new Date();
				date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
				var _3022 = name + "=''; expires=" + date.toGMTString() + "; path=/; domain=.";
				var _3023 = 'baida.yoka.com';//cookie直接针对baida.yoka.com域操作。这样可以统一msn站与非msn站
				document.cookie = _3022 + _3023;
				var parts = domain.split(".");
				if (parts.length > 2) {
					parts.splice(0, parts.length - 2);
				}
				document.cookie = _3022 + parts.join(".");
				return true;
			},
			set: function (name, thing, ttl) {
				var value = thing ? encodeURIComponent(JSON.stringify(thing)) : "";
				var expires = "";
				if (value === "") {
					ttl = -1;
				}
				if (typeof(ttl) != "undefined") {
					var date = new Date();
					date.setTime(date.getTime() + (ttl * 24 * 60 * 60 * 1000));
					expires = "; expires=" + date.toGMTString();
				}
				try {
					if (!domain) {
						domain = 'baida.yoka.com';//cookie直接针对baida.yoka.com域操作。这样可以统一msn站与非msn站
						domain = "." + domain;
					}
					if (jQuery.browser.msie && value !== "") {
						var extra = 56 + domain.length;
						var cookieByteLen = 0;
						if (document.cookie) {
							var cookieArr = document.cookie.split(/;\s*/);
							cookieByteLen = cookieArr.length * extra + document.cookie.length;
						}
						var _302e = Cookie.get(name, false);
						var _302f = _302e ? _302e.length : 0;
						if ((cookieByteLen + value.length - _302f) > 4096) {
							console.log("exceeds 4096 byte limit for cookie");
							throw ("exceeds 4096 byte limit for cookie");
						}
					}
					document.cookie = name + "=" + value + expires + "; path=/; domain=" + domain;
					return true;
				} catch(e) {
					return false;
				}
			},
			get: function (name, parse) {
				var cookieArr = document.cookie.split(/;\s*/);
				for (var i = 0; i < cookieArr.length; ++i) {
					var bits = cookieArr[i].split("=", 2);
					if (bits[0] == name) {
						if (parse) {
							try {
								return eval("(" + decodeURIComponent(bits[1]) + ")");
							} catch(e) {}
						} else {
							return bits[1];
						}
					}
				}
				return null;
			}
		};
	} ();

	var String = {
		
	};
	
	return {
		Native: Native,
		UA: UA,
		Http: Http,
		Ajax: Ajax,
		String: String
	};	
}();