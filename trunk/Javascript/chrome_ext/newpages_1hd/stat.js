var Stat = function() {
  var stat_storage_key = '__stat_storage';
  var storage = {
    get: function(key) {
      try {
        return JSON.parse(localStorage[key] || '{}');
      } catch(e) {
        return {};
      }
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
  var api = {
    GetSID: function() {
      if (api.sid) {
        return api.sid;
      }
      try {
        api.sid = external.GetSID(window);
        return api.sid;
      } catch(e) {
        return '';
      }
    },
    GetMID: function() {
      return api.GetSID() && external.GetMID(api.sid);
    },
    GetVersion: function() {
      return api.GetSID() && external.GetVersion(api.sid);
    },
    IsJoinPrivate: function(callback) {
      window.onGetExperience = function(p) {
        callback(p && p[0]);
      };
      chrome.send("getExperience");
    }
  };
  return {
    get: function(dx, pos, defaultVal) {
      pos = pos - 1;
      var arr = storage.getStat('stat_cache_' + dx, []);
      return arr[pos] || defaultVal;
    },
    set: function(dx, pos, val) {
      pos = pos - 1;
      var arr = storage.getStat('stat_cache_' + dx, []);
      arr[pos] = val;
      storage.setStat('stat_cache_' + dx, arr);
      return this;
    },
    count: function(dx, __pos) {
      for (var i = 1; i < arguments.length; i++) {
        var index = arguments[i];
        this.set(dx, index, parseInt(this.get(dx, index, 0)) + 1);
      }
      return this;
    },
    getStatData: function(dx, length) {
      var arr = storage.getStat('stat_cache_' + dx, []);
      length = length || arr.length;
      for (var i = 0; i < length; i++) {
        arr[i] = arr[i] || 0;
      }
      if (length > arr.length) {
        arr = arr.slice(0, length);
      }
      return arr.join('_');
    },
    IsJoinPrivate: function(callback) {
      api.IsJoinPrivate(function(join) {
        if (join) {
          callback();
        }
      });
    },
    send: function(tp) {
      var fn, toSend, param = {
        tp: tp,
        m: api.GetMID(),
        q: '',
        sev: api.GetVersion(),
        tv: '1.0.1.0001',
      };
      if (tp == 'm') {
        fn = 'dial.php';
        var last = parseInt(storage.getStat('stat_last_send_m')) || 0;
        toSend = Date.now() - last > 1000 * 60 * 10;
        param['d1'] = Stat.getStatData('d1', 4);
        param['d2'] = Stat.getStatData('d2', 38);
        param['d3'] = Stat.getStatData('d3', 40);
        param['d4'] = Stat.getStatData('d4', 30);
      } else {
        fn = 'reko.html';
        toSend = storage.getStat('stat_last_send_d') != new Date().toDateString();
        param['d0'] = Stat.getStatData('d0', 17);
      }

      if (!toSend) {
        return this;
      }

      var arr = [];
      for (var key in param) {
        arr.push(key + '=' + encodeURIComponent(param[key]));
      } (new Image).src = 'http://dd.browser.360.cn/' + fn + '?' + arr.join('&');
      if (tp == 'm') {
        storage.setStat('stat_last_send_m', Date.now());
        storage.setStat('stat_cache_d1', []);
        storage.setStat('stat_cache_d2', []);
        storage.setStat('stat_cache_d3', []);
        storage.setStat('stat_cache_d4', []);
      } else {
        storage.setStat('stat_last_send_d', new Date().toDateString());
      }
      return this;
    },

    searchTypeCount: function() {
      var sArr = $('#search-switch a').attr('class').split('_');
      if (sArr.length < 2) sArr.unshift('webpage');
      var code;
      switch (sArr[1]) {
      case 'so':
        code = sArr[0] == 'wenda' ? 6: 2;
        break;
      case 'google':
        code = 3;
        break;
      case 'baidu':
        code = 4;
        break;
      case 'sogou':
        code = 5;
        break;
      }
      Stat.count('d2', code);
    },
  };
} ();

Stat.count('d1', 1);
Stat.IsJoinPrivate(function() {
  Stat.send('m').send('d');
});

