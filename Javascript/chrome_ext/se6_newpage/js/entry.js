(function(){

require.config({baseUrl: "js/"});

require(["jquery-1.8.0.min", "main"], function(_$) {
	alert($)
});


return;
window.st = Date.now();

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

var default_mainjs = 'js/main.js';
var mainjs = localStorage['newver'] || default_mainjs;


$(function(){
	FileSystem2.exec('getFile', [mainjs.replace('filesystem:chrome-extension://kcgadkijneankhhcdmdabmedhndlgeih/persistent/', ''), function(url){
		console.log('check getFile:', Date.now() - window.st);
		console.log('main.js exist:', url);
	}, function(url){
		console.error('main.js not exist');
	}]);
});

var newver_path = mainjs.replace(default_mainjs, '');
loadjscssfile(mainjs, "js");

window.loadDefault = setTimeout(function(){
	var default_mainjs = 'js/main.js';
	var mainjs = default_mainjs;
	window.newver_path = mainjs.replace(default_mainjs, '');
	loadjscssfile(mainjs, "js");
}, 1000);

})();
