// se6api.js
(function () {
	var se6api = {
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
		Login: function(callback) {
			try {
				external.AppCmd(this.sid,"loginenrol","ReloginByManual","","",function(code,user) {
				});				
			} catch (e) {
			}
		}
	};
	window.se6api = se6api;
})();