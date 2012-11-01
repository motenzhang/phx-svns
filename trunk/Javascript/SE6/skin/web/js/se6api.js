// se6api.js
(function () {
	var se6api = {
        _qt: ['',''],
		sid2: '',
		sid: '',
		IsSE6: function(){
			try {
				var path = external.GetRunPath(external.GetSID(window));
				return path.indexOf('360se') > -1;
			} catch(e) {
				return false;
			}
		},
		GetSID: function(callback) {
			if (!se6api.IsSE6()) {
				callback('');
			}
			setTimeout(function(){
				try {
					external.AppCmd('', 'SeAppMgr', 'GetSID', '', '', function(code, data){
						se6api.sid = data;
						callback(data);
					});
				} catch (e) {
					callback('');
				}
			}, 100);
		},
		IsLogin: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","IsLogin","","",function(code, islogin) {
					callback(islogin == '1');
				});				
			} catch (e) {
			}
		},
		GetUserName: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","GetUserName","","",function(code,user) {
					callback(user);
				});				
			} catch (e) {
			}
		},
		GetUserHeadUrl: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","GetUserHeadUrl","","",function(code,url) {
					callback(url);
				});				
			} catch (e) {
			}
		},
		GetQT: function(callback) {
			try {
                var self = this;
				external.AppCmd(this.sid,"loginenrol","GetLoginSection","","",function(code,qt) {
                    if (code == 0) {
                        self._qt = qt.split("\r\n");
                        self._qt[0] = decodeURIComponent(self._qt[0].substr(2));
                        self._qt[1] = decodeURIComponent(self._qt[1].substr(2));
                    }
					callback();
				});				
			} catch (e) {
			}
		},
		Login: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","ReloginByManual","","",function(code,user) {
				});				
			} catch (e) {
			}
		},
		InstallSkin: function(id, ver, url, callback) {
			try {
				setTimeout(function(){
					external.AppCmd(this.sid2,"","installskin","ID:" + id + "\tVERSION:" + ver + "\tURL:" + url, "0", function(code, msg){
						callback(code, msg);
					}) ;
				}, 100);
			} catch(e) {
			}
		}
	};
	try {
		se6api.sid2 = external.GetSID(window);
	} catch (e) {}
	window.se6api = se6api;
})();

window.console = window.console || {log:function(){}};