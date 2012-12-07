jQuery(function($){
	if (ImageCropper.prototype.isAvaiable()) {
		$('.face img').addClass('change-face');
		$('.change-face').show();
	}
	ChangeFace.init();
});

var ChangeFace = function(){
	var tab, cropper;
	function show_change_face() {
		Dialog.show($('.change-face-layer'));
		return false;
	}
	function show_cut() {
		$('.recommend-face img').removeClass('active');
		tab.currentPanel.children().first().hide();
		tab.currentPanel.append($('.change-face-layer .cut').show());
		$('.preview .shadow canvas').show();
		$('.preview .shadow img').hide();
	}
	function hide_cut(){
		$('.change-face-layer div.cut').hide().prev().show();
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
			$('.change-face').live('click', show_change_face);
			$('.close').live('click', Dialog.hide);
			if (Http.request('avatar') == 1) {
				show_change_face();
			}
		},
		initTab: function(){
			tab = new Tab($('.tab-title'), $('.tab-cont'));
		},
		initRecommend: function(){
			/* recommend */
			var user = window.user || {};
			var recom_list = window.systemdefaultimg || {};
			if (user.imgFlag == 1) {
				$.get('Fetch/editHead', {imgid: '2702154q11581'}, function(ret){
					if (ret.url) {
						ChangeFace.updateFace(ret.url);
					}
				}, 'json');
			}
			var faceid = user.imageId;
			$('.preview .shadow img').attr('src', user.imgUrl);
			var sb = [];
			for (var x in recom_list) {
				sb.push('<img faceid="' + x + '" src="' + recom_list[x].url + '"' + (faceid == x ? ' class="active"' : '') + '>');
			}
			$('.recommend-face').html(sb.join(''));
			$('.recommend-face img').click(function(){
				hide_cut();
				faceid = $(this).attr('faceid');
				$('.recommend-face img').removeClass('active');
				$(this).addClass('active');
				$('.preview .shadow img').attr('src', $(this).attr('src'));
				$('.preview .shadow canvas').hide();
				$('.preview .shadow img').show();
			});
			$('.save-recommend').click(function(){
				$.get('Fetch/editHead', {imgid: faceid}, function(ret){
					if (ret.url) {
						ChangeFace.updateFace(ret.url);
					}
					Dialog.hide();
				}, 'json');
			});
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
						});
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
					});
				}
			});
			tab.onshow(function(e, index){
				if (index == 1) {
					var childs = tab.currentPanel.children();
					if (childs.length == 1 && childs.first().css('display') == 'none') {
						childs.first().show();
						/* show_cut();
						cropper.setImage(ChangeFace.localeImgData);
						*/
					}
				}
			});
		},
		initCamera: function(){
			/* camera */
			function open_camera() {
					if (!ChangeFace.camera_ok) {
						$('#camera_stream').hide();
						$('.camera .tips').removeClass('nocam');
						$('.camera .tips').show();
						$('.shutter').hide();
						navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
						if (navigator.getUserMedia) {
							navigator.getUserMedia({video:true}, function(stream) {
								ChangeFace.camera_ok = true;
								$('.camera .tips').hide();
								$('.shutter').css('display', 'inline-block');
								$('#camera_stream').attr('src', window.webkitURL.createObjectURL(stream)).css('display', 'block');;
							}, function(err) {
								$('.camera .tips').addClass('nocam');
								console.log(err);
							});
						} else {
							console.log('not support navigator.getUserMedia');
						}
					}
			}
			tab.onshow(function(e, index){
				if (index == 2) {
					var childs = tab.currentPanel.children();
					if (childs.length == 1 && childs.first().css('display') == 'none') {
						childs.first().show();
						/*
						show_cut();
						cropper.setImage(ChangeFace.cameraDataUrl);
						*/
						return;
					}
					open_camera();
				}
			});
			Dialog.onshow(function(){
				if ($('.change-face-layer .tab-cont').children().last().css('display') == 'block') {
					open_camera();
				}
			});
			Dialog.onhide(function(){
				ChangeFace.camera_ok = false;
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
			cropper = new ImageCropper(257, 257, 140, 140);
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
			
			$('.cancel-cut').click(function(){
				$(this).parents('div.cut').hide().prev().show();
			});
			$('.save-cut').click(function(){
				$.post('Fetch/uploadHead', {imgdata: getBase64('p110')/*, img48: getBase64('p48')*/}, function(ret){
					if (ret.url) {
						ChangeFace.updateFace(ret.url);
					}
					Dialog.hide();
				}, 'json');
			});
			
			function getBase64(canvasid) {
				return $('#' + canvasid + '')[0].toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
			}
		},
		updateFace: function(url) {
			$('img.change-face').attr('src', url);
			try {
				external.AppCmd(external.GetSID(window), "loginenrol", "NotifyUserHeadImageChanged", url, "", function(){});
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
			ele_parent.append(dialog.children());
			dialog.hide().empty();
			block.hide();
			$(Dialog).trigger('onhide');
		},
		repos: function() {
			var offset = document.body.scrollTop;
			var top = offset + ($(window).height() - dialog.height()) / 3;
			dialog.css('top', top);
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
	this.dragColor = "#fff";
	this.dragLeft = 0;
	this.dragTop = 0;

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
}

ImageCropper.prototype.addPreview = function(canvas)
{
	var preview = document.getElementById(canvas) || canvas;
	var context = preview.getContext("2d");
	this.previews.push(context);
}

ImageCropper.prototype.loadImage = function(file, callback)
{
	if(!this.isAvaiable() || !this.isImage(file)) return;
	var reader = new FileReader();
	var me = this;
	me.clear();
	reader.onload = function(evt)
	{
		if(!me.image) me.image = new Image();
		me.image.onload = function(e){me._init()};
		me.image.src = evt.target.result;
		callback(evt.target.result);
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
	//初始化图片的缩放比例和位置
	var scale = Math.min(this.width/this.image.width, this.height/this.image.height);
	//if (scale > 1) scale = Math.min(this.cropViewWidth/this.image.width, this.cropViewHeight/this.image.height);
	if (this.image.width*scale<this.cropViewWidth) scale = Math.min(scale, this.cropViewWidth/this.image.width);
	if (this.image.height*scale<this.cropViewHeight) scale = Math.min(scale, this.cropViewHeight/this.image.height);

	this.imageRotation = 0;
	this.imageScale = scale;
	this.imageViewWidth = this.image.width * this.imageScale;
	this.imageViewHeight = this.image.height * this.imageScale;
	this.imageViewLeft = this.imageLeft = (this.width - this.imageViewWidth)/2;
	this.imageViewTop = this.imageTop = (this.height - this.imageViewHeight)/2;

	//crop view size
	var minSize = Math.min(this.image.width*scale, this.image.height*scale);
	this.cropViewWidth = Math.min(minSize, this.cropWidth);
	this.cropViewHeight = Math.min(minSize, this.cropHeight);
	this.cropLeft = (this.width - this.cropViewWidth)/2;
	this.cropTop = (this.height - this.cropViewHeight)/2;

	//resize rectangle dragger
	this.dragLeft = this.cropLeft + this.cropViewWidth - this.dragSize/2;
	this.dragTop = this.cropTop + this.cropViewHeight - this.dragSize/2;

	this._update();
	
	//register event handlers
	var me = this;
	var handler = function(e){
		me._mouseHandler.call(me, e);
		return false;
	}
	$(this.canvas).mousedown(handler).mousemove(handler);
	$(document).mouseup(handler);
}

ImageCropper.prototype._mouseHandler = function(e)
{
	if(e.type == "mousemove")
	{
		var clientRect = this.canvas.getClientRects()[0];
		this.mouseX = e.clientX - clientRect.left;
		this.mouseY = e.clientY - clientRect.top;
		this._checkMouseBounds();
		this.canvas.style.cursor = (this.inCropper || this.isMoving)  ? "move" : (this.inDragger || this.isResizing) ? "se-resize" : "";
		this.isMoving ? this._move() : this.isResizing ? this._resize() : null;
	}else if(e.type == "mousedown")
	{
		this.mouseStartX = this.mouseX;
		this.mouseStartY = this.mouseY;
		this.cropStartLeft = this.cropLeft;
		this.cropStartTop = this.cropTop;
		this.cropStartWidth = this.cropViewWidth;
		this.cropStartHeight = this.cropViewHeight;
		this.inCropper ? this.isMoving = true : this.inDragger ? this.isResizing = true : null;
	}else if(e.type == "mouseup")
	{
		this.isMoving = this.isResizing = false;
	}
}

ImageCropper.prototype._checkMouseBounds = function()
{
	this.inCropper = (this.mouseX >= this.cropLeft && this.mouseX <= this.cropLeft+this.cropViewWidth &&
					  this.mouseY >= this.cropTop && this.mouseY <= this.cropTop+this.cropViewHeight);

	this.inDragger = (this.mouseX >= this.dragLeft && this.mouseX <= this.dragLeft+this.dragSize &&
					  this.mouseY >= this.dragTop && this.mouseY <= this.dragTop+this.dragSize);
	
	this.inCropper = this.inCropper && !this.inDragger;
}

ImageCropper.prototype._move = function()
{
	var deltaX = this.mouseX - this.mouseStartX;
	var deltaY = this.mouseY - this.mouseStartY;

	this.cropLeft = Math.max(this.imageViewLeft, this.cropStartLeft + deltaX);
	this.cropLeft = Math.min(this.cropLeft, this.width-this.imageViewLeft-this.cropViewWidth);
	this.cropTop = Math.max(this.imageViewTop, this.cropStartTop + deltaY);
	this.cropTop = Math.min(this.cropTop, this.height-this.imageViewTop-this.cropViewHeight);

	this.dragLeft = this.cropLeft + this.cropViewWidth - this.dragSize/2;
	this.dragTop = this.cropTop + this.cropViewHeight - this.dragSize/2;
	
	this._update();
}

ImageCropper.prototype._resize = function()
{
	var delta = Math.min(this.mouseX - this.mouseStartX, this.mouseY - this.mouseStartY);	
	
	var cw = Math.max(10, this.cropStartWidth + delta);
	var ch = Math.max(10, this.cropStartHeight + delta);
	var cw = Math.min(cw, this.width-this.cropStartLeft-this.imageViewLeft);
	var ch = Math.min(ch, this.height-this.cropStartTop-this.imageViewTop);
	this.cropViewWidth = this.cropViewHeight = Math.round(Math.min(cw, ch));

	this.dragLeft = this.cropLeft + this.cropViewWidth - this.dragSize/2;
	this.dragTop = this.cropTop + this.cropViewHeight - this.dragSize/2;
	
	this._update();
}

ImageCropper.prototype.rotate = function(angle)
{
	if(!this.image) return;
	this.imageRotation += angle;
	
	//根据旋转角度来改变图片视域的left和top
	var rotateVertical = Math.abs(this.imageRotation%180)==90;
	this.imageViewLeft = rotateVertical ? this.imageTop : this.imageLeft;
	this.imageViewTop = rotateVertical ? this.imageLeft : this.imageTop;
	this.imageViewWidth = rotateVertical ? this.image.height * this.imageScale : this.image.width * this.imageScale;
	this.imageViewHeight = rotateVertical ? this.image.width * this.imageScale : this.image.height * this.imageScale;
	
	//更新裁剪和变形的位置
	this.cropLeft = (this.width - this.cropViewWidth)/2;
	this.cropTop = (this.height - this.cropViewHeight)/2;
	this.dragLeft = this.cropLeft + this.cropViewWidth - this.dragSize/2;
	this.dragTop = this.cropTop + this.cropViewHeight - this.dragSize/2;
	
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
			this.imageContext.drawImage(this.image, -this.image.width, 0);
			break;
		case 180:
			this.imageContext.drawImage(this.image, -this.image.width, -this.image.height);
			break;
		case 270:
			this.imageContext.drawImage(this.image, 0, -this.image.height);
			break;
		case 0:
		default:
			this.imageContext.drawImage(this.image, 0, 0);
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
		preview.drawImage(this.imageCanvas, this.cropLeft, this.cropTop, this.cropViewWidth, this.cropViewHeight, 0, 0, preview.canvas.width, preview.canvas.height);
		preview.restore();
	}	
}

ImageCropper.prototype._drawMask = function()
{
	// left
	this._drawRect(this.imageViewLeft, this.imageViewTop, this.cropLeft-this.imageViewLeft + .2, this.imageViewHeight, this.maskColor, null, this.maskAlpha);
	// right
	this._drawRect(this.cropLeft+this.cropViewWidth - .2, this.imageViewTop, this.width-this.cropViewWidth-this.cropLeft-this.imageViewLeft, this.imageViewHeight, this.maskColor, null, this.maskAlpha);
	// top
	this._drawRect(this.cropLeft, this.imageViewTop, this.cropViewWidth, this.cropTop-this.imageViewTop, this.maskColor, null, this.maskAlpha);
	// bottom
	this._drawRect(this.cropLeft, this.cropTop+this.cropViewHeight, this.cropViewWidth, this.imageViewHeight-this.cropViewHeight-this.cropTop+this.imageViewTop, this.maskColor, null, this.maskAlpha);
}

ImageCropper.prototype._drawDragger = function()
{
	this._drawRect(this.dragLeft, this.dragTop, this.dragSize, this.dragSize, null, this.dragColor, null);
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

ImageCropper.prototype.getCroppedImageData = function(width, height, mime)
{
	var output = document.createElement("canvas");
	output.width = width || this.cropWidth;
	output.height = height || this.cropHeight;
	output.getContext("2d").drawImage(this.imageCanvas, this.cropLeft, this.cropTop, this.cropViewWidth, this.cropViewHeight, 0, 0, output.width, output.height);
	return output.toDataURL(mime || "image/jpeg");
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