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
	return {
		Native: Native,
		UA: UA
	};	
}();