// se6api.js
(function () {
	var se6api = {
		sid: '',
		GetSID: function(callback) {
			if (!this.IsSE6()) {
				callback('');
				return;
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
		}
	};
	window.se6api = se6api;
})();