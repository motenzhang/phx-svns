/**
 * ChromeWebUIApis unit test
 *
 * @mail: lichao3@360.cn
 */
(function(host, undef){
  var ntpApis = new ChromeWebUIApis({
    methods: 'setItem,getItem,getJoinPrivateStatus,addBlackListURL,isInBlackListURL,getBrowserData'
  });

  ntpApis.setItem('name', 'cc');
  ntpApis.getItem('name',function(k){
    console.log(k);
  });

  ntpApis.getJoinPrivateStatus(function(){
    console.log(arguments);
  });

  ntpApis.getBrowserData(function(){
    console.log(arguments);
  });

})(window);
