var storage = function(){
	var defaultGridCount = 8;
	return {
		'getMostVisited': function(callback){
			
		},
		'getCustomGrids': function(){
			if (localStorage['sync_custom_grids']) {
				return JSON.parse(localStorage['sync_custom_grids']);
			}
			var grids = [];
			for (var i=0; i<defaultGridCount; i++) {
				grids.push({filler:true});
			}
			return grids;
		},
		'setCustomGrids': function(grids){
			localStorage['sync_custom_grids'] = JSON.stringify(grids);
		},
	}
}();

