$(window).on('unload', function(){
	chrome.extension.sendRequest('unload');
});