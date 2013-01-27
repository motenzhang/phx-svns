var VideoBox = (function() {
  var SlideBox = function(ctr) {
    this.$ctr = $(ctr).css('position', 'relative');
    this.options = {
      'interval': 1000 * 5
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
      console.log('shopping_box consctruct, id: ', this.id);
    },
    render: function() {
      this.$ctr.append(this.$el);
      this.width = this.$el.width();
      this.height = this.$el.height();
      this.bindUI();
      this.renderSlide(this.index);
    },
    bindUI: function() {
      this.$el.parents('.tile').on('mouseenter', this.onEnter.bind(this));
      this.$el.parents('.tile').on('mouseleave', this.onLeave.bind(this));
      this.$el.find('.sbox-inner').on('click', this.onSlideClick.bind(this));
      this.$el.find('.sbox-button').on('click', this.onButtonClick.bind(this));
      this.initInterval();
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
      console.log('shopping_box interval, id: ', this.id);
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
          storage.set('video_box', 'slide_index', self.index);
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
          storage.set('video_box', 'slide_index', self.index);
        });
      } else {
        self.$inner.find('.sbox-slide:first').remove();
        this.renderSlide(this.index, true);
      }
    },
    unbindUI: function() {
      this.$el.parents('.tile').off('mouseenter');
      this.$el.parents('.tile').off('mouseleave');
      this.$el.find('.sbox-button').off('click');
      clearInterval(this._slideInterval);
    },
    desctruct: function() {
      console.log('shopping_box desctruct, id: ', this.id);
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
          this.index = storage.get('video_box')['slide_index'];
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
          self.data = [
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
          ];//data['data'][self.type];
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
      this.data = storage.get('video_box')['data'] || null;
    },
    /**
     * 保存数据
     */
    save: function() {
      storage.set('video_box', 'data', this.data);
    },
    /**
     * 绘制页面时调用，获取页内容
     */
    getContent: function(i, target) {
      if (i === - 2) { // 无数据页
        return '没有了...';
      } else if (i === - 1) { // 加载中，可以认为是首页
        return '加载中...';
      } else { // 数据页
        return '<a href="' + this.data[i]['url'] + '" target="' + target + '"><img src="' + this.data[i]['img'] + '" onerror="src=\'images/video_box_1.png\'"></a>';
      }
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
  var NewsBox = function(ctr, options) {
    window.__video_box_id = window.__video_box_id || 0;
    this.id = ++window.__video_box_id;
    AjaxBox.call(this, ctr);
    this.type = 'video';
    this.options.reload = 1000 * 60 * 60 * 1;
    $.extend(this.options, options);
  };
  $.extend(NewsBox.prototype, AjaxBox.prototype, {
    /**
     * 新闻的加载逻辑（有效期已到或数据未加载，则需要加载）
     */
    isLoadNeeded: function() {
      var last = storage.get('video_box')['last_time'] || 0;
      if (last + this.options.reload < Date.now()) {
        storage.set('video_box', 'last_time', Date.now());
        return true;
      }
      return false;
    },
    getContent: function(i) {
      var last_page = (this.data && i >= this.data.length);
      if (i === - 2 || last_page) {
        return '<div class="sbox-content"><a href="http://sh.qihoo.com/" target="' + this.options.target + '"><img src="images/video_box_2.png"></a></div>';
      } else if (i === - 1) {
        return '<div class="sbox-content"><a href="http://sh.qihoo.com/" target="' + this.options.target + '"><img src="images/video_box_1.png"></a></div>';
      } else {
        var title = (this.data[i]['title'] || '').replace(/"/g, '&quot;');
        return '<a href="' + this.data[i]['url'] + '" target="' + this.options.target + '"><div class="sbox-content"><img src="' + this.data[i]['img'] + '" onerror="src=\'images/video_box_1.png\'"></div><div class="sbox-title" title="' + title + '">' + title + '</div></a>';
      }
    }
  });
  return NewsBox;
})();

