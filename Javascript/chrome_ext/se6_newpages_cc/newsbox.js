var NewsBox = (function() {
    var SlideBox = function(ctr) {
        this.$ctr = $(ctr).css('position', 'relative');
        this.options = {
            'interval': 16000,
        };
        this.construct();
    };
    SlideBox.prototype = {
        construct: function() {
            this.$el = $('<div class="sbox">\
  <div class="sbox-inner"></div>\
  <a class="sbox-button" rel="next" href="#">N</a>\
  <a class="sbox-button" rel="home" href="#">H</a>\
</div>');
            this.$inner = this.$el.find('.sbox-inner');
            this.index = 0;
        },
        render: function() {
            this.$ctr.append(this.$el);
            this.width = this.$el.width();
            this.height = this.$el.height();
            this.bindUI();
            this.renderSlide(this.index);
        },
        bindUI: function() {
            this.$el.on('mouseenter', this.onEnter.bind(this));
            this.$el.on('mouseleave', this.onLeave.bind(this));
            this.$el.find('.sbox-button').on('click', this.onButtonClick.bind(this));
            this.onLeave();
        },
        onButtonClick: function(e) {
            var rel = $(e.target).attr('rel');
            if (rel === 'home') {
				Stat.count('d3', 10);
                this.index = -1;
                this.nextSlide(now);
            } else {
				Stat.count('d3', 8);
                this.nextSlide();
            }
			return false;
        },
        onEnter: function(e) {
            clearInterval(this._slideInterval);
            this.$el.find('.sbox-button').show();
        },
        onLeave: function(e) {
            this._slideInterval = setInterval(this.onInterval.bind(this), this.options['interval']);
            //this.$el.find('.sbox-button').hide();
        },
        /**
					 * 自动翻页
					 */
        onInterval: function(e) {
            this.nextSlide();
        },
        /**
					 * 生成下一个 slide
					 */
        renderSlide: function(index) {
            var title = this.getTitle(index);
            var content = this.getContent(index);
            var $slide = $('<div class="sbox-slide" style="wi-dth:' + this.width + 'px;hei-ght:' + this.height + 'px;">\
<div class="sbox-content" title="' + title + '">' + content + '</div>\
<div class="sbox-title">' + title + '</div>\
</div>');
            this.$inner.append($slide);
        },
        /**
					 * 获取下一页的内容 HTML
					 * @param {Number} index
					 * @returns {String}
					 */
        getContent: function(index) {
            return 'Content ' + index;
        },
        getTitle: function(index) {
            return 'Title' + index;
        },

        /**
		 * 移动到下一个 slide
		 */
		nextSlide: function(animate) {
            var self = this;
			if (this.index == -1) {
				setTimeout(function(){
					self.nextSlideNow(animate);
				}, 2000);
			} else {
				this.nextSlideNow(animate);
			}
		},
        nextSlideNow: function(animate) {
            if (!this.isNextable()) {
				this.$el.find('.sbox-button').hide();
				return;
			}
			this.$el.find('.sbox-button').show();
            var self = this;
            if (typeof(animate) === 'undefined') {
                animate = true;
            }
            if (animate) {
                this.renderSlide(this.index);

				this.width = this.$inner.width();
                this.$inner.animate({
                    'left': -1 * this.width + 'px'
                },
                600,
                function() {
                    self.$inner.find('.sbox-slide:first').remove();
                    self.$inner.css('left', 0);
                });
            } else {
                self.$inner.find('.sbox-slide:first').remove();
                this.renderSlide(this.index);
            }
        },
        unbindUI: function() {
            this.$el.off('mouseenter');
            this.$el.off('mouseleave');
            this.$el.find('.sbox-button').off('click');
            clearInterval(this._slideInterval);
        },
        desctruct: function() {
            this.unbindUI();
            this.$el.remove();
        },
        isNextable: function() {++this.index;
            return true;
        }
    };

    var AjaxBox = function(ctr) {
        SlideBox.call(this, ctr);
    };
    $.extend(AjaxBox.prototype, SlideBox.prototype, {
        construct: function() {
            SlideBox.prototype.construct.call(this);
            this.index = -1; // WAIT
        },
        render: function() {
            SlideBox.prototype.render.call(this);
            if (this.isLoadNeeded()) {
                this.load();
            } else {
                this.read();
            }
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
					 * 是否需要重新加载数据
					 */
        isLoadNeeded: function() {
            if (localStorage.getItem('box_ajax_data_' + this.type)) {
                return false;
            } else {
                return true;
            }
        },
        /**
					 * 读取本地存储的内容
					 */
        read: function() {
            try {
                this.data = JSON.parse(localStorage.getItem('box_ajax_data_' + this.type));
            } catch(e) {
                this.data = [];
            }
            this.nextSlide();
        },
        /**
					 * 保存数据
					 */
        save: function() {
            localStorage.setItem('box_ajax_data_' + this.type, JSON.stringify(this.data));
        },
        /**
					 * 绘制页面时调用，获取页内容
					 */
        getContent: function(i, target) {
            if (i === -2) { // 无数据页
                return '没有了...';
            } else if (i === -1) { // 加载中，可以认为是首页
                return '加载中...';
            } else { // 数据页
                return '<a href="' + this.data[i]['url'] + '" target="' + target + '"><img src="' + this.data[i]['img'] + '" style="he--ight:' + this.height + 'px;"/></a>';
            }
        },
        /**
					 * 绘制页面时调用，获取页标题
					 */
        getTitle: function(i) {
            if (i > -1 && this.data[i]) { // 正常数据页
                return this.data[i]['title'];
            } else { // 特殊页没有标题
                return '';
            }
        },
        /**
					 * 鼠标进入，在特殊页时不响应 "按钮"
					 */
        onEnter: function(e) {
            if (this.index === -2 || this.index === -1) {} else {
                SlideBox.prototype.onEnter.call(this, e);
            }
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
                    this.index--;
                    this.data.splice(this.index, 1);
                } else if (this.index !== -2) {
                    this.index = -3;
                    this.data.splice(0, 1);
                    this.nextSlide();
                } // TODO ELSE
                this.save();
            } else {
                SlideBox.prototype.onButtonClick.call(this, e);
            }
        },
        isNextable: function() {
            if (this.index === -2) {
                // 当前停留在无数据页，不再继续翻页
                return false;
            } else if (typeof(this.data) === 'undefined' || this.data === null || this.data.length < 1) {
                // 如果没有加载导数据，则显示无数据页
                this.index = -3; // next 将显示 -2 没有数据
            } else if (this.index >= this.data.length) { // 从头在此播放
                this.index = -1;
            }

            return SlideBox.prototype.isNextable.call(this);
        }
    });
    var NewsBox = function(ctr, options) {
        AjaxBox.call(this, ctr);
        this.type = 'news';
        this.options.reload = 1000 * 60 * 60 * 6;
        $.extend(this.options, options);
    };
    $.extend(NewsBox.prototype, AjaxBox.prototype, {
        /**
           * 新闻的加载逻辑（有效期已到或数据未加载，则需要加载）
           */
        isLoadNeeded: function() {
            var last = parseInt(localStorage.getItem('box_news_time'));
            if (isNaN(last)) {
                last = 0;
            }
            if (last + this.options.reload < Date.now()) {
                localStorage.setItem('box_news_time', Date.now());
                return true;
            }
            return false;
        },
        getContent: function(i) {
            if (i === -2) {
                return '<div class="more"><a href="http://sh.qihoo.com/" target="' + this.options.target + '">更多新闻，请访问 360新闻</a></div>'
            } else if (i === -1) {
                return '<img src="images/news_default.jpg" style="wi-dth:' + this.width + 'px;hei-ght:' + this.height + 'px;" alt="新闻格子" title="新闻格子"/>';
            } else {
                return AjaxBox.prototype.getContent.call(this, i, this.options.target);
            }
        }
    });
    return NewsBox;
})();