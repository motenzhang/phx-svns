
var Stat = function(){
	var stat_storage_key = '__stat_storage';
	var storage = {
		get: function(key) {
			return JSON.parse(localStorage[key] || '{}');
		},
		set: function(key, data) {
			localStorage[key] = JSON.stringify(data);
		},
		getStat: function(key, defaultVal) {
			var statArr = storage.get(stat_storage_key)[key];
			return statArr || defaultVal;
		},
		setStat: function(key, val) {
			var data = storage.get(stat_storage_key);
			data[key] = val;
			storage.set(stat_storage_key, data);
		},
	};
	return {
		count: function(__pos) {
			var arr = storage.getStat('stat_cache', []);
			for (var i=0;i<arguments.length; i++) {
				var index = arguments[i] - 1;
				arr[index] = (parseInt(arr[index])||0) + 1;
			}
			storage.setStat('stat_cache', arr);
			return this;
		},
		getStatData: function(){
			var arr = storage.getStat('stat_cache', []);
			for (var i=0; i<40; i++) {
				arr[i] = arr[i] || 0;
			}
			return arr.join('_');
		},
		send: function() {
			var last = parseInt(storage.getStat('stat_last_send')) || 0;
			if (/*api.IsJoinPrivate() && */
				Date.now() - last > 1000 * 60 * 10) {
				var param = {
					m: '',
					q: '',
					sev: '',
					tv: '',
					d: Stat.getStatData(),
				};
				var arr = [];
				for (var key in param) {
					arr.push(key + '=' + encodeURIComponent(param[key]));
				}
				(new Image).src = 'http://dd.browser.360.cn/dial.php?' + arr.join('&');
				storage.setStat('stat_last_send', Date.now());
				storage.setStat('stat_cache', []);
			}
			return this;
		},
	};
}();


Stat.count(1).send();
