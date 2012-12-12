jQuery(function($){
	if (ImageCropper.prototype.isAvaiable()) {
		$('.face img').addClass('change-face');
		$('.change-face').show();
		ChangeFace.init();
	}
});

var ChangeFace = function(){
	var tab, cropper;
	var user = window.user || {};
	var faceid;
	function show_change_face() {
		Dialog.show($('.change-face-layer'));
		return false;
	}
	function show_cut() {
		faceid = '';
		$('.recommend-face img').removeClass('active');
		tab.currentPanel.children().first().hide();
		tab.currentPanel.append($('.change-face-layer .cut').show());
		$('.preview .shadow canvas').show();
		$('.preview .shadow img').hide();
	}
	function hide_cut(){
		$('.change-face-layer div.cut').hide().prev().show();
		$('.preview .shadow img').attr('src', user.imgUrl);
		$('.preview .shadow canvas').hide();
		$('.preview .shadow img').show();
	}
	function getbase64(canvasid) {
		return $('#' + canvasid + '')[0].toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
	}
	function post_img() {
		$.post('Fetch/uploadHead', {imgdata: getbase64('p110')}, function(ret){
			if (ret.url) {
				user.imageId = '';
				ChangeFace.updateFace(ret.url);
			}
			Dialog.hide();
		}, 'json');
	}

	return {
		init: function(){
			this.initTab();
			this.initRecommend();
			this.initUpload();
			this.initCamera();
			this.initCut();
			this.initEntryPoint();
		},
		initEntryPoint: function(){
			Dialog.onshow(function(){
				history.pushState(null, '', '#avatar');
			});
			Dialog.onhide(function(){
				localStorage['change-face-current-tab'] = 0;
				history.pushState(null, '', '/');
			});
			$('.change-face').live('click', show_change_face);
			$('.close').live('click', Dialog.hide);
			if (location.hash.toLowerCase() == '#avatar' || Http.request('avatar') == 1) {
				show_change_face();
			}
		},
		initTab: function(){
			tab = new Tab($('.tab-title'), $('.tab-cont'));
		},
		initRecommend: function(){
			/* recommend */
			var recom_list = window.systemdefaultimg || {};
			if (user.imgFlag == 1) {
				$.get('Fetch/editHead', {imgid: '2702154q11581'}, function(ret){
					if (ret.url) {
						ChangeFace.updateFace(ret.url);
					}
				}, 'json');
			}
			_reset();
			$('.save-recommend').click(function(){
				if (faceid) {
					if (faceid == user.imageId) {
						Dialog.hide();
						return;
					}
					user.imageId = faceid;
					$.get('Fetch/editHead', {imgid: faceid}, function(ret){
						if (ret.url) {
							ChangeFace.updateFace(ret.url);
						}
						Dialog.hide();
					}, 'json');
				} else {
					post_img();
				}
			});
			tab.onshow(function(e, index){
				localStorage['change-face-current-tab'] = index;
				if (index == 0) {
					$('.my-face').show();
				} else {
					$('.my-face').hide();
				}
			});
			Dialog.onshow(function(){
				_reset();
				tab.show(parseInt(localStorage['change-face-current-tab']) || 0);
				hide_cut();
			});
			function _reset() {
				faceid = user.imageId;
				$('.preview .shadow img').attr('src', user.imgUrl);
				var sb = [];
				for (var x in recom_list) {
					sb.push('<img faceid="' + x + '" src="' + recom_list[x].url + '"' + (faceid == x ? ' class="active"' : '') + '>');
				}
				$('.recommend-face').html(sb.join(''));

				$.get('index/getHistoryHead', {}, function(ret){
					if (ret && ret.historydata) {
						sb = [];
						$.each(ret.historydata, function(i, item){
							if (i > 3) {
								return false;
							}
							sb.push('<img faceid="' + item[0] + '" src="' + item[1] + '">');
						});
						$('.my-face > div').html(sb.join(''));
					}
				}, 'json');

				$('.recommend-face img, .my-face img').die('click').live('click', function(){
					hide_cut();
					faceid = $(this).attr('faceid');
					$('.recommend-face img, .my-face img').removeClass('active');
					$(this).addClass('active');
					$('.preview .shadow img').attr('src', $(this).attr('src'));
				});
			}
		},
		initUpload: function(){
			/* upload */
			$('.change-face-layer .upload').on('dragover', function(e){
				$(this).addClass('hover');
				return false;
			});
			$('.change-face-layer .upload').on('dragleave', function(){
				$(this).removeClass('hover');
				return false;
			});
			$('.change-face-layer .upload').on('drop', function(e){
				$(this).removeClass('hover');
				var fileList = e.originalEvent.dataTransfer.files;
				if (fileList.length > 0) {
					var file = fileList[0];
					if (cropper.isImage(file)) {
						show_cut();
						cropper.loadImage(file, function(dataUrl){
							ChangeFace.localeImgData = dataUrl;
						}, function(){
							hide_cut();
							show_format_error();
						});
						return false;
					} else {
						show_format_error();
						return false;
					}
				}
			});
			
			$('.file-open a').click(function(){
				$('.upload form')[0].reset();
				$('.upload input').click();
			});
	
			$('.upload input').change(function(){
				var file = this.files[0];
				if (cropper.isImage(file)) {
					show_cut();
					cropper.loadImage(file, function(dataUrl){
						ChangeFace.localeImgData = dataUrl;
					}, function(){
						hide_cut();
						show_format_error();
					});
				} else {
					show_format_error();
				}
			});
			tab.onshow(function(e, index){
				if (index == 1) {
					var childs = tab.currentPanel.children();
					if (childs.length == 1 && childs.first().css('display') == 'none') {
						childs.first().show();
					}
				}
			});
			function show_format_error() {
				$('.upload .format-error').css({opacity:0}).stop(true, true).animate({opacity:1}, 'normal').delay(5000).animate({opacity:0});
			}
		},
		initCamera: function(){
			/* camera */
			function open_camera() {
					if (!ChangeFace.camera_ok) {
						$('#camera_stream, .shutter').hide();
						$('.camera .tips').removeClass('nocam');
						$('.camera .tips, .change-face-camera-tip').show();
						clearInterval(ChangeFace._cam_tt);
						ChangeFace._cam_tt = setTimeout(function(){
							navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
							if (navigator.getUserMedia) {
								ChangeFace.open_camera_tip = true;
								navigator.getUserMedia({video:true}, function(stream) {
									ChangeFace.camera_ok = true;
									$('.camera .tips, .change-face-camera-tip').hide();
									$('.shutter').css('display', 'inline-block');
									$('#camera_stream').attr('src', window.webkitURL.createObjectURL(stream)).css('display', 'block');;
									ChangeFace.open_camera_tip = false;
								}, function(err) {
									$('.change-face-camera-tip').hide();
									$('.camera .tips').addClass('nocam');
									console.log(err);
									ChangeFace.open_camera_tip = false;
								});
								console.log('call open camera');
							} else {
								console.log('not support navigator.getUserMedia');
							}
						}, 50);
					}
			}
			tab.onshow(function(e, index){
				if (index == 2) {
					if (ChangeFace.open_camera_tip == true) {
						location.reload();
					}
					var childs = tab.currentPanel.children();
					if (childs.length == 1 && childs.first().css('display') == 'none') {
						childs.first().show();
						return;
					}
					open_camera();
				} else {
					$('.change-face-camera-tip').hide();
				}
			});
			Dialog.onshow(function(){
				/*if ($('.change-face-layer .tab-cont').children().last().css('display') == 'block') {
					open_camera();
				}*/
			});
			Dialog.onhide(function(){
				ChangeFace.camera_ok = false;
				$('.change-face-camera-tip').hide();
			});
			$('.shutter').click(function(){
				show_cut();
				
				var video = $('#camera_stream')[0];
				var canvas =document.createElement('canvas');  
				canvas.height = 287;
				canvas.width = video.videoWidth / video.videoHeight * canvas.height;
	
				
				var context = canvas.getContext('2d');  
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				ChangeFace.cameraDataUrl = canvas.toDataURL('image/png');
				cropper.setImage(ChangeFace.cameraDataUrl);
			});
		},
		initCut: function(){
			/* cut */
			cropper = new ImageCropper(419, 257, 140, 140);
			cropper.setCanvas("cropper");
			cropper.addPreview("p110");
			cropper.addPreview("p48");
	
			$('.rotate').click(function(){
				if ($(this).hasClass('rotate-left')) {
					cropper.rotate(-90);
				} else if ($(this).hasClass('rotate-right')) {
					cropper.rotate(90);
				}
			});
			
			$('.cancel-cut').click(hide_cut);
			$('.save-cut').click(post_img);
		},
		updateFace: function(url) {
			$('img.change-face').attr('src', url);
			user.imgUrl = url;
			try {
				external.AppCmd(external.GetSID(window), "loginenrol", "GetQid", "", "", function(code, qid){
					if (qid == user.qid) {
						external.AppCmd(external.GetSID(window), "loginenrol", "NotifyUserHeadImageChanged", url, "", function(){});
					}
				});
			} catch(e) {
			}
		}
	}
}();

var Tab = function(title, cont){
	var _this = this;
	var init = function() {
		$(title).find('a').click(function(){
			_this.show($(this).parent().index());
			return false;
		});
	};
	this.show = function(index) {
		$(title).find('a').removeClass('active');
		$(title).find('li:eq(' + index + ')').find('a').addClass('active');
		this.hide();
		this.currentPanel = $(cont).children('div:eq(' + index + ')').show();
		$(this).trigger('onshow', index);
	};
	this.hide = function() {
		$(cont).children('div').hide();
	};
	this.onshow = function(handler) {
		$(this).on('onshow', handler);
	}
	init();
};

var Http = function(){
	return {
		request: function(name) {
			try {
				var re = new RegExp("(?:\\?|&)" + name + "=(.*?)(?=&|$)", "i");
				var matches = location.search.match(re);
				return matches && matches[1];
			} catch (e) {
				return null;
			}
		}
	};
}();

var Dialog = function(){	
	var block, dialog;
	var ele_parent;
	function init(){
		if (block) {
			return;
		}
		block = $('<div class="block"></div>');
		$(document.body).append(block);
		dialog = $('<div class="dialog"></div>');
		$(document.body).append(dialog);
		$(document).keydown(function(e){
			switch(e.keyCode) {
				case 27: // esc
					Dialog.hide();
					break;
			}
		});
	}
	return {
		show: function(ele){
			ele_parent = ele.parent();
			init();
			dialog.append(ele.show());
			Dialog.repos();
			block.show();
			dialog.show();
			$(Dialog).trigger('onshow');
		},
		hide: function(){
			init();
			ele_parent.append(dialog.children().hide());
			dialog.hide().empty();
			block.hide();
			$(Dialog).trigger('onhide');
		},
		repos: function() {
			var offset = document.body.scrollTop;
			var top = offset + ($(window).height() - dialog.height()) / 3;
			dialog.css('top', Math.max(top, 10));
		},
		onshow: function(handler) {
			$(Dialog).on('onshow', handler);
		},
		onhide: function(handler) {
			$(Dialog).on('onhide', handler);
		}
	};
}();


(function(scope){
 
var ImageCropper = function(width, height, cropWidth, cropHeight)
{	
	this.width = width;
	this.height = height;
	this.cropWidth = cropWidth;
	this.cropHeight = cropHeight;	
	
	this.image = null;	
	this.imageCanvas = null;
	this.imageContext = null;	
	this.imageScale = 1;
	this.imageRotation = 0;

	this.imageLeft = 0;
	this.imageTop = 0;
	this.imageViewLeft = 0;
	this.imageViewTop = 0;
	this.imageViewWidth = 0;
	this.imageViewHeight = 0;

	this.canvas = null;
	this.context = null;
	this.previews = [];
	
	this.maskGroup = [];
	this.maskAlpha = 0.60;
	this.maskColor = "#fff";

	this.cropLeft = 0;
	this.cropTop = 0;
	this.cropViewWidth = cropWidth;
	this.cropViewHeight = cropHeight;

	this.dragSize = 7;
	this.dragColor = "#000";

	this.mouseX = 0;
	this.mouseY = 0;
	this.inCropper = false;
	this.inDragger = false;
	this.isMoving = false;
	this.isResizing = false;
	
	//move and resize help properties
	this.mouseStartX = 0;
	this.mouseStartY = 0;
	this.cropStartLeft = 0;
	this.cropStartTop = 0;
	this.cropStartWidth = 0;
	this.cropStartHeight = 0;
	
	this.diagonal_pos = {};
}
scope.ImageCropper = ImageCropper;

ImageCropper.prototype.setCanvas = function(canvas)
{
	//working canvas
	this.canvas = document.getElementById(canvas) || canvas;
	this.context = this.canvas.getContext("2d");
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	//this.canvas.oncontextmenu = this.canvas.onselectstart = function(){return false;};
	
	//caching canvas
	this.imageCanvas = document.createElement("canvas");
	this.imageContext = this.imageCanvas.getContext("2d");
	this.imageCanvas.width = this.width;
	this.imageCanvas.height = this.height;
	
	// ori canvas
	this.oriCanvas = document.createElement("canvas");
	this.oriContext = this.oriCanvas.getContext("2d");
	this.prevOriCanvas = document.createElement("canvas");
	this.prevOriContext = this.prevOriCanvas.getContext("2d");
}

ImageCropper.prototype.addPreview = function(canvas)
{
	var preview = document.getElementById(canvas) || canvas;
	var context = preview.getContext("2d");
	this.previews.push(context);
}

ImageCropper.prototype.loadImage = function(file, onload, onerror)
{
	if(!this.isAvaiable() || !this.isImage(file)) return;
	var reader = new FileReader();
	var me = this;
	me.clear();
	reader.onload = function(evt)
	{
		var url = evt.target.result;
		if(!me.image) me.image = new Image();
		me.image.onload = function(){
			me._init()
			onload && onload(evt.target.result);
		};
		if (me.image.src == url) {
			me.image.onerror = null;
			me.image.src = '';
		}
		me.image.onerror = function(){
			onerror && onerror();
		};
		me.image.src = url;
	}
	reader.readAsDataURL(file);
}

ImageCropper.prototype.setImage = function(dataUrl)
{
	var me = this;
	me.clear();
	if(!me.image) me.image = new Image();
	me.image.onload = function(e){me._init()};
	me.image.src = dataUrl;
}

ImageCropper.prototype.clear = function(){
	this.context.clearRect(0, 0, this.width, this.height);
};

ImageCropper.prototype._init = function()
{
	this.oriCanvas.width = this.image.width;
	this.oriCanvas.height = this.image.height;
	this.oriContext.drawImage(this.image, 0, 0);
		
	this.prevOriCanvas.width = this.image.width;
	this.prevOriCanvas.height = this.image.height;
	this.prevOriContext.drawImage(this.oriCanvas, 0, 0);
		
	this.imageRotation = 0;
	this._calc();
	this._update();
	
	//register event handlers
	var me = this;
	var handler = function(e){
		me._mouseHandler.call(me, e);
		return false;
	}
	$(this.canvas).mousedown(handler);
	$(document).mousemove(handler).mouseup(handler);
}

ImageCropper.prototype._mouseHandler = function(e)
{
	if(e.type == "mousemove")
	{
		var clientRect = this.canvas.getClientRects()[0];
		if (!clientRect) {
			return;
		}
		this.mouseX = e.clientX - clientRect.left;
		this.mouseY = e.clientY - clientRect.top;
		this.mouseAction = this._checkMouseBounds();
		if (this.isResizing) {
			var eventPos = {x: this.mouseX, y: this.mouseY};
			var dist = this._distance(this.diagonal_pos, eventPos);
			var ratio = {
				x: dist / this.startDist.left * (eventPos.x - this.diagonal_pos.x > 0 ? 1 : -1),
				y: dist / this.startDist.top * (eventPos.y - this.diagonal_pos.y > 0 ? 1 : -1)
			};
			var left = (this.cropStartLeft - this.diagonal_pos.x) * ratio.x + this.diagonal_pos.x;
			var top = (this.cropStartTop - this.diagonal_pos.y) * ratio.y + this.diagonal_pos.y;
			this._resize2(left, top, this.cropStartWidth * ratio.x, this.cropStartHeight * ratio.y);
		} else if (this.isMoving) {
			this._move();
		} else {
			switch (this.mouseAction) {
				case 'nw': case 'ne': case'se': case 'sw':
					this.canvas.style.cursor = this.mouseAction + '-resize';
					break;
				default:
					this.canvas.style.cursor = this.mouseAction;
					break;
			}
		}
	}else if(e.type == "mousedown")
	{
		this.mouseStartX = this.mouseX;
		this.mouseStartY = this.mouseY;
		this.cropStartLeft = this.cropLeft;
		this.cropStartTop = this.cropTop;
		this.cropStartWidth = this.cropViewWidth;
		this.cropStartHeight = this.cropViewHeight;
		var cropRect = {left: this.cropLeft, top: this.cropTop, right: this.cropLeft + this.cropViewWidth, bottom:this.cropTop + this.cropViewHeight};
		switch (this.mouseAction) {
			case 'nw':
				this.diagonal_pos.x = cropRect.right;
				this.diagonal_pos.y = cropRect.bottom;
				break;
			case 'ne':
				this.diagonal_pos.x = cropRect.left;
				this.diagonal_pos.y = cropRect.bottom;
				break;
			case 'se':
				this.diagonal_pos.x = cropRect.left;
				this.diagonal_pos.y = cropRect.top;
				break;
			case 'sw':
				this.diagonal_pos.x = cropRect.right;
				this.diagonal_pos.y = cropRect.top;
				break;
		}
		switch (this.mouseAction) {
			case 'nw': case 'ne': case'se': case 'sw':
				var eventPos = {x: this.mouseX, y: this.mouseY};
				this.startDist = this._distance(this.diagonal_pos, eventPos);
				this.startDist = {
					left:this.startDist * (eventPos.x - this.diagonal_pos.x > 0 ? 1 : -1),
					top: this.startDist * (eventPos.y - this.diagonal_pos.y > 0 ? 1 : -1)
				};
				this.isResizing = true;
				break;
			case 'move':
				this.isMoving = true;
				break;
		}
	} else if(e.type == "mouseup") {
		this.isMoving = this.isResizing = false;
	}
}

ImageCropper.prototype._distance = function(point1, point2)
{
	return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

ImageCropper.prototype._mouseInRect = function(rect)
{
	return this.mouseX >= rect.left && this.mouseX <= rect.right &&
			this.mouseY >= rect.top && this.mouseY <= rect.bottom;
}

ImageCropper.prototype._checkMouseBounds = function()
{
	if (this._mouseInRect(this.nw_rect)) {
		return 'nw';
	} else if (this._mouseInRect(this.ne_rect)) {
		return 'ne';
	} else if (this._mouseInRect(this.se_rect)) {
		return 'se';
	} else if (this._mouseInRect(this.sw_rect)) {
		return 'sw';
	} else if (this._mouseInRect({left:this.cropLeft, top:this.cropTop, right:this.cropLeft+this.cropViewWidth, bottom:this.cropTop+this.cropViewHeight})) {
		return 'move';
	}
	return '';
}

ImageCropper.prototype._move = function()
{
	var deltaX = this.mouseX - this.mouseStartX;
	var deltaY = this.mouseY - this.mouseStartY;

	this.cropLeft = Math.max(this.imageViewLeft, this.cropStartLeft + deltaX);
	this.cropLeft = Math.min(this.cropLeft, this.imageViewLeft + this.imageViewWidth - this.cropViewWidth);
	this.cropTop = Math.max(this.imageViewTop, this.cropStartTop + deltaY);
	this.cropTop = Math.min(this.cropTop, this.imageViewTop + this.imageViewHeight - this.cropViewHeight);
	
	this._update();
}

ImageCropper.prototype._resize = function()
{
	var delta = Math.min(this.mouseX - this.mouseStartX, this.mouseY - this.mouseStartY);	
	
	var cw = Math.max(10, this.cropStartWidth + delta);
	var ch = Math.max(10, this.cropStartHeight + delta);
	var cw = Math.min(cw, this.width-this.cropStartLeft-this.imageViewLeft);
	var ch = Math.min(ch, this.height-this.cropStartTop-this.imageViewTop);
	this.cropViewWidth = this.cropViewHeight = Math.floor(Math.min(cw, ch));

	this.dragLeft = this.cropLeft + this.cropViewWidth - this.dragSize/2;
	this.dragTop = this.cropTop + this.cropViewHeight - this.dragSize/2;
	
	this._update();
}

ImageCropper.prototype._resize2 = function(left, top, width, height)
{
	console.log(this.width-this.cropStartLeft-this.imageViewLeft, this.height-this.cropStartTop-this.imageViewTop);
	if (width > this.dragSize && height > this.dragSize  && 
		left >= this.imageViewLeft && top >= this.imageViewTop &&
		left + width <= this.imageViewLeft + this.imageViewWidth &&
		top + height <= this.imageViewTop + this.imageViewHeight) {
	this.cropViewWidth = this.cropViewHeight = Math.min(width, height);

	this.cropLeft = Math.max(left, this.imageViewLeft);
	this.cropTop = Math.max(top, this.imageViewTop);

	this._update();
	}
}

ImageCropper.prototype._calc = function()
{
	var rotateVertical = Math.abs(this.imageRotation%180) == 90;
	var imgWidth = rotateVertical ? this.image.height : this.image.width;
	var imgHeight = rotateVertical ? this.image.width : this.image.height;
	//初始化图片的缩放比例和位置
	var scale = Math.min(this.width/imgWidth, this.height/imgHeight);
	//if (scale > 1) scale = Math.min(this.cropViewWidth/imgWidth, this.cropViewHeight/imgHeight);
	if (imgWidth*scale<this.cropViewWidth) scale = Math.min(scale, this.cropViewWidth/imgWidth);
	if (imgHeight*scale<this.cropViewHeight) scale = Math.min(scale, this.cropViewHeight/imgHeight);

	this.imageScale = scale;
	this.imageViewWidth = Math.floor(imgWidth * this.imageScale);
	this.imageViewHeight = Math.floor(imgHeight * this.imageScale);
	this.imageViewLeft = this.imageLeft = Math.floor((this.width - this.imageViewWidth)/2);
	this.imageViewTop = this.imageTop = Math.floor((this.height - this.imageViewHeight)/2);

	//crop view size
	var minSize = Math.floor(Math.min(imgWidth*scale, imgHeight*scale));
	this.cropViewWidth = Math.min(minSize, this.cropWidth);
	this.cropViewHeight = Math.min(minSize, this.cropHeight);
	this.cropLeft = Math.floor((this.width - this.cropViewWidth)/2);
	this.cropTop = Math.floor((this.height - this.cropViewHeight)/2);
}

ImageCropper.prototype.rotate = function(angle)
{
	if(!this.image) return;
	this.imageRotation += angle;
	
	var rotateVertical = Math.abs(this.imageRotation%180) == 90;
	this.prevOriCanvas.width = rotateVertical ? this.image.height : this.image.width;
	this.prevOriCanvas.height = rotateVertical ? this.image.width : this.image.height;	
	this.prevOriContext.rotate(this.imageRotation*Math.PI/180);
	angle = this.imageRotation%360;	
	switch((360-angle)%360)
	{		
		case 90:
			this.prevOriContext.drawImage(this.oriCanvas, -this.image.width, 0);
			break;
		case 180:
			this.prevOriContext.drawImage(this.oriCanvas, -this.image.width, -this.image.height);
			break;
		case 270:
			this.prevOriContext.drawImage(this.oriCanvas, 0, -this.image.height);
			break;
		case 0:
		default:
			this.prevOriContext.drawImage(this.oriCanvas, 0, 0);
			break;
	}	

	//根据旋转角度来改变图片视域的left和top
	this._calc();	
	this._update();
}

ImageCropper.prototype._update = function()
{
	this.context.clearRect(0, 0, this.width, this.height);
	
	this._drawImage();
	this._drawMask();	
	this._drawDragger();
	this._drawPreview();
}

ImageCropper.prototype._drawImage = function()
{	
	this.imageContext.clearRect(0, 0, this.width, this.height);
	this.imageContext.save();	

	var angle = this.imageRotation%360;	
	this.imageContext.translate(this.imageViewLeft, this.imageViewTop);	
	this.imageContext.scale(this.imageScale, this.imageScale);
	this.imageContext.rotate(this.imageRotation*Math.PI/180);

	switch((360-angle)%360)
	{		
		case 90:
			this.imageContext.drawImage(this.oriCanvas, -this.image.width, 0);
			break;
		case 180:
			this.imageContext.drawImage(this.oriCanvas, -this.image.width, -this.image.height);
			break;
		case 270:
			this.imageContext.drawImage(this.oriCanvas, 0, -this.image.height);
			break;
		case 0:
		default:
			this.imageContext.drawImage(this.oriCanvas, 0, 0);
			break;
	}
	this.imageContext.restore();
	
	this.context.drawImage(this.imageCanvas, 0, 0);
}

ImageCropper.prototype._drawPreview = function()
{
	for(var i = 0; i < this.previews.length; i++)
	{
		var preview = this.previews[i];
		preview.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
		preview.save();
		preview.drawImage(this.prevOriCanvas, Math.floor((this.cropLeft - this.imageViewLeft)/this.imageScale), Math.floor((this.cropTop - this.imageViewTop)/this.imageScale), Math.floor(this.cropViewWidth/this.imageScale), Math.floor(this.cropViewHeight/this.imageScale), 0, 0, preview.canvas.width, preview.canvas.height);
		preview.restore();
	}	
}

ImageCropper.prototype._drawMask = function()
{
	// left
	this._drawRect(this.imageViewLeft, this.imageViewTop, this.cropLeft-this.imageViewLeft, this.imageViewHeight, this.maskColor, null, this.maskAlpha);
	// right
	this._drawRect(this.cropLeft+this.cropViewWidth, this.imageViewTop, this.width-this.cropViewWidth-this.cropLeft-this.imageViewLeft, this.imageViewHeight, this.maskColor, null, this.maskAlpha);
	// top
	this._drawRect(this.cropLeft, this.imageViewTop, this.cropViewWidth, this.cropTop-this.imageViewTop, this.maskColor, null, this.maskAlpha);
	// bottom
	this._drawRect(this.cropLeft, this.cropTop+this.cropViewHeight, this.cropViewWidth, this.imageViewHeight-this.cropViewHeight-this.cropTop+this.imageViewTop, this.maskColor, null, this.maskAlpha);
}

ImageCropper.prototype._drawDragger = function()
{
	this.nw_rect = {left:this.cropLeft - this.dragSize/2, top:this.cropTop - this.dragSize/2};
	this.ne_rect = {left:this.cropLeft + this.cropViewWidth - this.dragSize/2, top:this.nw_rect.top};
	this.se_rect = {left:this.ne_rect.left, top:this.cropTop + this.cropViewHeight - this.dragSize/2};
	this.sw_rect = {left:this.nw_rect.left, top:this.se_rect.top};
	this._fixDraggerRects([this.nw_rect, this.ne_rect, this.se_rect, this.sw_rect]);
	this._drawRectR(this.nw_rect, null, this.dragColor, .6);
	this._drawRectR(this.ne_rect, null, this.dragColor, .6);
	this._drawRectR(this.se_rect, null, this.dragColor, .6);
	this._drawRectR(this.sw_rect, null, this.dragColor, .6);
}

ImageCropper.prototype._fixDraggerRects = function(rects)
{
	var _this = this;
	rects.forEach(function(item){
		item.right = item.left + _this.dragSize;
		item.bottom = item.top + _this.dragSize;
	});
}

ImageCropper.prototype._drawRectR = function(rect, color, border, alpha)
{
	return this._drawRect(rect.left, rect.top, rect.right-rect.left, rect.bottom-rect.top, color, border, alpha);
}

ImageCropper.prototype._drawRect = function(x, y, width, height, color, border, alpha)
{
	this.context.save();
	if(color !== null) this.context.fillStyle = color;
	if(border !== null) this.context.strokeStyle = border;
	if(alpha !== null) this.context.globalAlpha = alpha;
	this.context.beginPath();
	this.context.rect(x, y, width, height);
	this.context.closePath();
	if(color !== null) this.context.fill();
	if(border !== null) this.context.stroke();
	this.context.restore();
}

ImageCropper.prototype.isAvaiable = function()
{
	return typeof(FileReader) !== "undefined";
}

ImageCropper.prototype.isImage = function(file)
{
	return (/image/i).test(file.type);
}

})(window);