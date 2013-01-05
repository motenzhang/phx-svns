//alert('ntp back')
// 调用 getMostVisited 初始化
// 检测关闭，发送 cdata  统计

var background = function(){
	return {
		init: function(){
			//alert('background.init');
			//  getMostVisited 初始化
			//chrome.ntp.init();
			// 消息初始化
			chrome.extension.onRequest.removeListener(this.onmsg);
			chrome.extension.onRequest.addListener(this.onmsg);
		},
		onmsg: function(msg, sender, response){
			switch(msg) {
				case 'unload':
					if (/*true || */storage.getIntervalMinute('background_unload') > (2 / 60)) {
						storage.setLastDate('background_unload');
						CDATA.upload();
					}
					break;
			}
		}
	};
}();


background.init();

