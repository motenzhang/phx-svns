// se6api.js
(function () {
	var se6api = {
		sid2: '',
		sid: '',
		GetSID: function(callback) {
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
					alert(url);
					callback(url);
				});				
			} catch (e) {
			}
		},
		GetQT: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","GetLoginSection","","",function(code,qt) {
					console.log([code, qt]);
					callback(user);
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
				external.AppCmd(this.sid2,"","installskin","ID:" + id + "\tVERSION:" + ver + "\tURL:" + url, "0", function(code, msg){
					callback(code, msg);
				}) ;
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