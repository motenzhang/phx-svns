chrome.webNavigation.onCompleted.addListener(function(e){
	switch (e.url) {
        case 'http://www.baidu.com/':
            console.log(e);
            
            chrome.pageCapture.saveAsMHTML({tabId:e.tabId}, function(mhtmlData){
                console.log(mhtmlData);
                var reader = new FileReader();
                reader.onload = function(e2){
                    var imgData = e2.target.result; 
                    console.log(imgData);
                } 
                reader.readAsDataURL(mhtmlData);  
            });
            break;
    }
});