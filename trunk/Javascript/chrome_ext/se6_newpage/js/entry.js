(function(){

	var mainJs = '/js/main.js';
	
	window.currentVerPath = localStorage['currentVerPath'] || '';
	require([currentVerPath + mainJs]);
	
	window._t_loadDefault = setTimeout(function(){
		window.currentVerPath = '';
		require([currentVerPath + mainJs]);
	}, 1000);

})();
