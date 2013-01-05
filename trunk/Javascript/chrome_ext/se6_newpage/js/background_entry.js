alert('background.init');

function loadjscssfile(filename,filetype){

    if(filetype == "js"){
        var fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src",filename);
    }else if(filetype == "css"){
    
        var fileref = document.createElement('link');
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("type","text/css");
        fileref.setAttribute("href",filename);
    }
   if(typeof fileref != "undefined"){
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
    
}

loadjscssfile("filesystem:chrome-extension://kcgadkijneankhhcdmdabmedhndlgeih/persistent/backgrounhd.js", "js");


//alert('ntp back')
// 调用 getMostVisited 初始化
// 检测关闭，发送 cdata  统计

/*var background = function(){
	return {
		init: function(){
			alert('background.init');
			//  getMostVisited 初始化
			//chrome.ntp.init();
			// 消息初始化
			chrome.extension.onRequest.addListener(this.onmsg);
		},
		onmsg: function(msg, sender, response){
			switch(msg) {
				case 'unload':
					if (storage.getIntervalMinute('background_unload') > (2 / 60)) {
						storage.setLastDate('background_unload');
						CDATA.upload();
					}
					break;
			}
		}
	};
}();


background.init();*/

