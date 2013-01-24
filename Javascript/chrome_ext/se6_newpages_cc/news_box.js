var NewsBox = function(){
	var NewsBox = function(){
		this.init();
	};
	NewsBox.prototype = {
		init: function(){
			alert('init');
		}
	};
	return NewsBox;
}();