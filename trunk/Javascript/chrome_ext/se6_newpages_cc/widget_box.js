var WidgetBox = (function() {
  var SlideBox = function(ctr) {
    this.$ctr = $(ctr).css('position', 'relative');
    this.options = {
      'interval': 1000 * 15
    };
    this.construct();
  };
  SlideBox.prototype = {
    construct: function() {
      this.$el = $('<div class="sbox">\
                <div class="sbox-inner"></div>\
                <a class="sbox-button" rel="next" __href="#">N</a>\
                <a class="sbox-button" rel="prev" __href="#">H</a>\
              </div>');
      this.$inner = this.$el.find('.sbox-inner');
      this.index = 0;
      console.log(this.name + ' consctruct, id: ', this.id);
    },
    render: function() {
      this.$ctr.append(this.$el);
      this.width = this.$el.width();
      this.height = this.$el.height();
      this.bindUI();
      this.renderSlide(this.index);
    },
    bindUI: function() {
      this.$el.parents('.tile-logo').on('mouseenter', this.onEnter.bind(this));
      this.$el.parents('.tile-logo').on('mouseleave', this.onLeave.bind(this));
      this.$el.find('.sbox-inner').on('click', this.onSlideClick.bind(this));
      this.$el.find('.sbox-button').on('click', this.onButtonClick.bind(this));
      var self = this;
      var _t31 = this.options['interval'] / 3;
      this._startTimeout = setTimeout(function(){
        self.onInterval();
        self.initInterval();
      }, {news: _t31*1, video: _t31*2, shopping: _t31*3}[this.type]);
    },
    onButtonClick: function(e) {
      var rel = $(e.target).attr('rel');
      if (rel === 'prev') {
        Stat.count('d3', 10);
        this.prevSlide();
      } else {
        Stat.count('d3', 8);
        this.nextSlide();
      }
      return false;
    },
    onEnter: function(e) {
      clearInterval(this._slideInterval);
      if (this.index != -3) {
        this.$el.find('.sbox-button').delay(400).fadeIn();
      }
    },
    onLeave: function(e) {
      this.initInterval();
      this.$el.find('.sbox-button').stop(true, true).hide();
    },
    initInterval: function(){
      clearInterval(this._slideInterval);
      this._slideInterval = setInterval(this.onInterval.bind(this), this.options['interval']);
    },
    /**
     * 自动翻页
     */
    onInterval: function(e) {
//      console.log(this.name + ' interval, id: ', this.id);
      this.nextSlide();
    },
    /**
     * 生成下一个 slide
     */
    renderSlide: function(index, prev) {
      var $slide = $('<div class="sbox-slide">' + this.getContent(index) + '</div>');
      if (prev) {
        this.$inner.prepend($slide).css('left', - this.width);
      } else {
        this.$inner.append($slide);
      }
    },
    /**
     * 获取下一页的内容 HTML
     * @param {Number} index
     * @returns {String}
     */
    getContent: function(index) {
      return 'Content ' + index;
    },
    /**
     * 移动到下一个 slide
     */
    nextSlide: function(animate) {
      var self = this;
      if (this.index == - 1) {
        setTimeout(function() {
          self.nextSlideNow(animate);
        }, 1000);
        this.initInterval();
      } else {
        this.nextSlideNow(animate);
      }
    },
    nextSlideNow: function(animate) {
      if (!this.isNextable()) {
        this.$el.find('.sbox-button').hide();
        return;
      }
      if (this.index == - 2) {
        this.$el.find('.sbox-button').hide();
      } else {
        //this.$el.find('.sbox-button').show();
      }
      var self = this;
      if (typeof(animate) === 'undefined') {
        animate = true;
      }
      if (animate) {
        this.renderSlide(this.index);

        this.width = this.$inner.width();
        this.$inner.stop(true, true).animate({
          'left': - 1 * this.width
        },
        400, function() {
          self.$inner.find('.sbox-slide:first').remove();
          self.$inner.css('left', 0);
          if (self.name == 'news_box') {
            console.log(self.name, storage.get(self.name)['slide_index'], self.index);
          }
          storage.set(self.name, 'slide_index', self.index);
        });
      } else {
        self.$inner.find('.sbox-slide:first').remove();
        this.renderSlide(this.index);
      }
    },
    prevSlide: function(animate) {
      if (!this.isNextable(true)) {
        this.$el.find('.sbox-button').hide();
        return;
      }
      if (this.index == - 2) {
        this.$el.find('.sbox-button').hide();
      } else {
        this.$el.find('.sbox-button').show();
      }
      var self = this;
      if (typeof(animate) === 'undefined') {
        animate = true;
      }
      if (animate) {
        this.renderSlide(this.index, true);

        this.width = this.$inner.width();
        this.$inner.stop(true, true).animate({
          'left': 0
        },
        400, function() {
          self.$inner.find('.sbox-slide:last').remove();
          storage.set(self.name, 'slide_index', self.index);
        });
      } else {
        self.$inner.find('.sbox-slide:first').remove();
        this.renderSlide(this.index, true);
      }
    },
    unbindUI: function() {
      this.$el.parents('.tile-logo').off('mouseenter');
      this.$el.parents('.tile-logo').off('mouseleave');
      this.$el.find('.sbox-button').off('click');
      clearInterval(this._slideInterval);
      clearTimeout(this._startTimeout);
    },
    desctruct: function() {
      console.log(this.name + ' desctruct, id: ', this.id);
      this.unbindUI();
      //this.$el.remove();
    },
    isNextable: function(prev) {
      prev ? --this.index: ++this.index;
      return true;
    }
  };

  var AjaxBox = function(ctr) {
    SlideBox.call(this, ctr);
  };
  $.extend(AjaxBox.prototype, SlideBox.prototype, {
    construct: function() {
      SlideBox.prototype.construct.call(this);
      this.index = - 1; // WAIT
    },
    render: function() {
      if (this.isLoadNeeded()) {
        this.load();
      } else {
        this.read();
        if (this.data && this.data.length > 0) {
          this.index = storage.get(this.name)['slide_index'];
          if (this.index == undefined) {
            this.index = -1;
          }
        } else {
          this.load();
        }
      }
      SlideBox.prototype.render.call(this);
    },
    /**
           * 加载数据
           */
    load: function() {
      var self = this;
      var rn = parseInt(Math.random() * 100000);
      $.ajax({
        'url': 'http://site.browser.360.cn/msg.php?mt=["' + this.type + '"]&rn=' + rn,
        'dataType': 'jsonp',
        'type': 'get'
      }).done(function(data) {
        if (data['errno'] === 0) {
          data['data']['video'] = [
          {
            title: "小儿难养",
            recordTime: "2013-01-24 15:21:07",
            url: "http://v.360.cn/tv/RbFsaaKoTzDuNX.html",
            img: "http://p6.qhimg.com/dr/370_260_/t01f02961ee240c1353.jpg"
          },
          {
            title: "梦回唐朝",
            recordTime: "2013-01-24 14:57:58",
            url: "http://v.360.cn/tv/PLFvb3CoTzDsNX.html",
            img: "http://p7.qhimg.com/dr/370_260_/t015305e141ef69b0ab.jpg"
          },
          {
            title: "二次曝光",
            recordTime: "2013-01-24 14:51:21",
            url: "http://v.360.cn/m/hKbkZUL6R0r4Th.html",
            img: "http://p3.qhimg.com/dr/370_260_/t01524157a297c7db5d.jpg"
          },
          {
            title: "楚汉传奇",
            recordTime: "2013-01-24 14:44:34",
            url: "http://v.360.cn/tv/Q4poaaCoTz8mMn.html",
            img: "http://p1.qhimg.com/dr/370_260_/t016ff41881dc8e4635.jpg"
          },
          {
            title: "隋唐英雄",
            recordTime: "2013-01-24 14:40:12",
            url: "http://v.360.cn/tv/QbhraqKoSmbrMn.html",
            img: "http://p9.qhimg.com/dr/370_260_/t0192523bdb830d7202.jpg"
          },
          {
            title: "危险关系",
            recordTime: "2013-01-24 13:05:27",
            url: "http://v.360.cn/m/gKriZEX6SHnAUB.html",
            img: "http://p2.qhimg.com/dr/370_260_/t0105542d85bf7d595f.jpg"
          },
          {
            title: "邻家花美男",
            recordTime: "2013-01-24 12:37:59",
            url: "http://v.360.cn/tv/Q4NoaaGoTz8qMX.html",
            img: "http://p5.qhimg.com/dr/370_260_/t012623bcf01bac4be5.jpg"
          }
          ];
          data['data']['shopping'] = [
          {
            title: "团购！简单享受人生每一刻！",
            recordTime: "2013-01-24 19:36:31",
            url: "http://tuan.360.cn/?do=category&clazz=1&fname=se6_sudoku_tuan&eee=se6_sudoku_tuan&fsign=ddcf1f9357",
            img: "http://p7.qhimg.com/dr/370_260_/t019db0ab24c7a986ba.jpg"
          },
          {
            title: "低价影票20元起",
            recordTime: "2013-01-24 19:32:17",
            url: "http://tuan.360.cn/?do=movie&fname=se6_sudoku_movie&eee=se6_sudoku_movie&fsign=3874b6cba8",
            img: "http://p6.qhimg.com/dr/370_260_/t015813879be66bbe22.jpg"
          },
          {
            title: "商家促销 特价秒杀",
            recordTime: "2013-01-24 18:45:59",
            url: "http://youhui.360.cn/huodong?fname=se6_sudoku_ huodong&eee=se6_sudoku_huodong",
            img: "http://p0.qhimg.com/dr/370_260_/t01d67bf2ee65d1d880.jpg"
          },
          {
            title: "iPod touch4历史最低1249元",
            recordTime: "2013-01-24 18:29:21",
            url: "http://tejia.youhui.360.cn/?tejiaid=17005&fname=se6_sudoku_zhidemai&eee= se6_sudoku_zhidemai",
            img: "http://p3.qhimg.com/dr/370_260_/t011a86f91d1d9076a8.jpg"
          },
          {
            title: "免费领券 超值购物",
            recordTime: "2013-01-24 18:13:12",
            url: "http://youhui.360.cn/quan?fname=se6_sudoku_quan&eee=se6_sudoku_quan",
            img: "http://p7.qhimg.com/dr/370_260_/t01b26567bf01e90cd4.gif"
          },
          {
            title: "初见 与心动不期而遇",
            recordTime: "2013-01-24 16:45:09",
            url: "http://chujian.360.cn/items.html?cid=3646&fname=se6_sudoku_chujian&eee= se6_sudoku_chujian",
            img: "http://p2.qhimg.com/dr/370_260_/t01fdcdb60fe45fb199.jpg"
          }
          ];
          self.data = data['data'][self.type];
          self.save();
          // 显示 第1页
          self.nextSlide();
        } else {
          self.nextSlide(); // -2
        }
      }).error(function() {
        self.nextSlide(); // -2
      });
    },
    /**
     * 读取本地存储的内容
     */
    read: function() {
      this.data = storage.get(this.name)['data'] || null;
    },
    /**
     * 保存数据
     */
    save: function() {
      storage.set(this.name, 'data', this.data);
    },
    /**
     * 鼠标进入，在特殊页时不响应 "按钮"
     */
    onEnter: function(e) {
      if (this.index === - 2 || this.index === - 1) {} else {
        SlideBox.prototype.onEnter.call(this, e);
      }
    },
    onSlideClick: function(e) {
    },
    /**
     * 按钮点击，特殊处理"下一页"
     */
    onButtonClick: function(e) {
      var rel = $(e.target).attr('rel');
      // 手动点击下一页 将删除本条数据，不再显示，知道下次重新加载数据
      if (rel === 'next') {
        if (this.data.length > 1) {
          SlideBox.prototype.onButtonClick.call(this, e);
        } else if (this.index !== - 2) {
          this.index = - 3;
          this.nextSlide();
        } // TODO ELSE
        this.save();
      } else {
        SlideBox.prototype.onButtonClick.call(this, e);
      }
      return false;
    },
    isNextable: function(prev) {
      if (this.index === - 2) {
        // 当前停留在无数据页，不再继续翻页
        return false;
      } else if (typeof(this.data) === 'undefined' || this.data === null || this.data.length < 1) {
        // 如果没有加载导数据，则显示无数据页
        this.index = - 3; // next 将显示 -2 没有数据
        clearInterval(this._slideInterval);
        return false;
      } else if (!prev && this.index >= this.data.length) { // 从头在此播放
        this.index = - 1;
      } else if (prev && this.index <= 0) {
        this.index = this.data.length + 1;
      }

      return SlideBox.prototype.isNextable.call(this, prev);
    }
  });
  var WidgetBox = function(ctr, options) {
    this.type = options.type || 'news';
    var _idf = '__widgetbox_' + this.type + '_id';
    window[_idf] = window[_idf] || 0;
    this.id = ++window[_idf];
    this.name = this.type + '_box';
    AjaxBox.call(this, ctr);
    this.options.reload = 1000 * 60 * 60 * 1;
    $.extend(this.options, options);
  };
  $.extend(WidgetBox.prototype, AjaxBox.prototype, {
    /**
     * 新闻的加载逻辑（有效期已到或数据未加载，则需要加载）
     */
    isLoadNeeded: function() {
      var last = storage.get(this.name)['last_time'] || 0;
      if (last + this.options.reload < Date.now()) {
        storage.set(this.name, 'last_time', Date.now());
        return true;
      }
      return false;
    },
    getContent: function(i) {
      var last_page = (this.data && i >= this.data.length);
      if (i === - 2 || last_page) {
        return '<div class="sbox-content"><a href="http://sh.qihoo.com/" target="' + this.options.target + '"><img src="images/' + this.name + '_2.png"></a></div>';
      } else if (i === - 1) {
        return '<div class="sbox-content"><a href="http://sh.qihoo.com/" target="' + this.options.target + '"><img src="images/' + this.name + '_1.png"></a></div>';
      } else {
        var title = (this.data[i]['title'] || '').replace(/"/g, '&quot;');
        return '<a href="' + this.data[i]['url'] + '" target="' + this.options.target + '"><div class="sbox-content"><img src="' + this.data[i]['img'] + '" onerror="src=\'images/' + this.name + '_1.png\'"></div><div class="sbox-title" title="' + title + '">' + title + '</div></a>';
      }
    }
  });
  return WidgetBox;
})();

