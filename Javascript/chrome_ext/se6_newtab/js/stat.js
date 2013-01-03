$(window).on('beforeunload', function(){
	chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});

});