<?php /* Smarty version Smarty-3.0.6, created on 2012-11-21 16:27:34
         compiled from "/data/htdocs/ext.chrome.360.cn//view/template_dir/extensions/home.html" */ ?>
<?php /*%%SmartyHeaderCode:122854937750ac90764738e3-77948466%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e11f2ba147288b58d5b7d7bc47d3713964aa6d5d' => 
    array (
      0 => '/data/htdocs/ext.chrome.360.cn//view/template_dir/extensions/home.html',
      1 => 1353486440,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '122854937750ac90764738e3-77948466',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
)); /*/%%SmartyHeaderCode%%*/?>
<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<!--[if lt IE 8]>
		<meta http-equiv="X-UA-Compatible" content="IE=8" />
    <![endif]-->
    <title>扩展中心 - 360极速浏览器</title>
<meta name="keywords" content="双核浏览器,首款双核安全浏览器,360浏览器双核版,浏览器,360极速浏览器,360浏览器极速版,极速浏览器,360chrome,简洁浏览器,极速双核" />
<meta name="description" content="360极速浏览器(360chrome)无缝融合双核引擎，采用了最快速的Chromium内核及兼容性最好的IE内核。360极速浏览器简洁人性化的设计，更好用！360极速浏览器囊括超级拖放、鼠标手势等实用功能，大量扩展程序及皮肤任您使用！" />

    <!-- *** generated by qihoo *** -->
	<!--<link href="https://ext.chrome.360.cn/css/common.css" rel="stylesheet" charset="utf-8"/>	-->
	<link href="https://ext.chrome.360.cn/css/extend_all.css" rel="stylesheet" charset="utf-8"/>
	<!--<link href="https://ext.chrome.360.cn/css/jqModal.css" rel="stylesheet" charset="utf-8"/>-->
<!--[if lt IE 6]>
<script>
var ___lt8=5;
</script>
<![endif]-->
<!--[if lt IE 7]>
<script>
var ___lt8=6;
</script>
<![endif]-->
<!--[if lt IE 8]>
<script>
var ___lt8=7;
</script>
<![endif]-->
	<script type="text/javascript">var _ExtCate=<?php echo $_smarty_tpl->getVariable('cateJson')->value;?>
;</script>
	<script type="text/javascript">
		var __d=[
			'https://ext.chrome.360.cn',
			'/webstore/'
		];
	</script>
	<script>
	var __initData = <?php echo $_smarty_tpl->getVariable('initData')->value;?>
;
	var __islogined='<?php echo $_smarty_tpl->getVariable('islogined')->value;?>
';
	var __aurl='<?php echo $_smarty_tpl->getVariable('aurl')->value;?>
';
	</script>
</head>

<body>
<script type="text/template" id="template-content-wrapper">
<div class="main">
  <div class="navi" style="position:relative;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr id="category-type">
        <td>
			<div type='search' class="pos-box"><span></span><a class="search-btn" href="#nogo"><em></em></a>
            <div class="search-box">
             <form id="search-form" action="" method="" name="search">
              <input class="sch-txt" maxlength="20" type="text" value="" name="q" style="height:16px;"/>
              <input class="sch-btn" type="button" value="搜索" />
              </form>
            </div>
          </div>
		</td>
        <td>
			<div class="pos-box"><span></span><a class="custom-btn" href=""><em></em></a>
            <div class="search-box more">
              <p>您可以制作自己的浏览器扩展提交到扩展中心</p>
              <a class="more-btn" target="_blank" href="http://open.chrome.360.cn/">了解更多</a> </div>
          </div>
		</td>
      </tr>
    </table>
    <a href="https://ext.chrome.360.cn/webstore/skip" target="_blank" style="padding-left:18px;background:url('http://p6.qhimg.com/d/360browser/20121024/18-logo.png') no-repeat left;display:block;margin-top:22px;position:absolute;right:0;">Chrome网上应用店</a>
  </div>
  <div class="sort-list"> 排序方式：<a class="cur" href="">推荐度</a>|<a href="">下载量</a>|<a href="">更新时间</a> </div>  
  <div class="search-tips" style="display:none;">  "<span></span>" 的搜索结果 </div>  
  <div class="extend-list">
  <div id="app-container">
    <ul class="app-list">
    </ul>
    <ul class="search-app-list">
	</ul>
	</div>
	<div class="loading-tip" style="width:100%;height:180px; text-align:center;">
		<div class="spinner" style="width: 232px;height: 32px;background: url('http://w.qhimg.com/images/v2/chrome/2012/03/30/loading.gif') no-repeat;display: inline-block;line-height:34px;color:#888;">正在搜索中，请稍候...</div>
  </div>  
  </div>  
</div>
</script>
<script type="text/template" id="notsupport-tip">
	<div style="height:500px;padding:40px;text-align:left;font-size:14px;width:400px;margin:0 auto;">
		<div>
		您需要在360极速浏览器的极速模式下访问本站才能安装扩展。</div>
		<br /><br />
		<div style="text-align:left;">
			<a href="http://dl.360safe.com/cse/360cse_official.exe" style="color:#1c5ac4;">下载 360极速浏览器</a><br />
		</div>
	</div>
</script>

<script type="text/template" id="template-view-detail">
<div class="dialog dialog01" style="" > <a id="closed-btn" href="" title="关闭">×</a>
  <div class="dialog-cont">
	<div class="detail-ext-wrapper"></div>
	<div class="ext-list-wrapper">
		<div class="tab-btn">
			<a class="prev dir-btn" href="#nogo"></a><a class="next dir-btn " href="#nogo"></a>
			<div class="btn-list"><ul></ul></div>
		</div>
	</div>
  </div>
</div>
</script>
<script type="text/template" id="template-view-ext-detail">
	<div class="dialog_detail" extid="<<?php ?>%= crx_id %>">
    <div class="dialog-head"> <img class="ext-img fl" src="<<?php ?>%= logo %>" alt="">
      <div class="f-txt">
        <h2><<?php ?>%= name %></h2>
        <div class="f-infor">
          <div class="star"><span style="width:<<?php ?>%= parseInt(hot) %>%;"></span></div>
           <a class="weiboshare" href="" style="display:none;">| 分享到微博</a> </div>
        <a class="download-btn <<?php ?>%= ({"install":"add-btn","installed":"installed-btn","update":"update-btn"})[status] %>" href="">添加到浏览器</a> </div>
    </div>
    <div class="tab-cont clearfix">
      <div class="slide-box fl" id="slides">
        <div class="slide-cont">
		<<?php ?>% _.each(descpic,function(pic,index){ %><p class="slides"><img index="<<?php ?>%= index %>" class="slide-control-img" src="<<?php ?>%= pic %>" alt=""/></p><<?php ?>% }); %>		
        </div>
		<ul class="pagination">
		<<?php ?>% _.each(descpic,function(pic,index){ %><li><a hidefocus="">"<<?php ?>%= index %>" </a></li><<?php ?>% }); %>		
		</ul>
      </div>
      <div class="ext-info fr">
        <h2><<?php ?>%= name %><span><<?php ?>% _.each(cates,function(cate){%>
							<a href="javascript:void(0);" onclick="Dialoghandler.cates(this)"><<?php ?>%= cate||"全部分类" %></a>
							<<?php ?>% }); %> | 来自 <<?php ?>%= author %></span></h2>
        <p style="word-wrap:break-word;"><<?php ?>%= moredesc %></p>
      </div>
    </div>
	</div>
</script>

<script type="text/template" id="template-view-category">
<div>

</div>
</script>
<script type="text/template" id="template-view-search">
<div>

</div>
</script>

<script type="text/template" id="template-view-ext">
    <div class="ext-block" extid="<<?php ?>%= crx_id %>">
		<a class="ext-logo"><span class="<<?php ?>%= ({"install":"install","installed":"installed","update":"update"})[status] %> "></span>
			<div style="width:148px;height:87px;background:#f4f4f4;"><img src="<<?php ?>%= logo %>" style="margin:auto auto;top:50%;left:50%;position:absolute;margin-top:-24px;margin-left:-24px;" width="48" height="48"></div>
		</a>
        <h1><<?php ?>%= name %></h1>
        <p class="first-info"><<?php ?>%= shortdesc||"简短说明" %></p>
        <p class="two-info"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><<?php ?>%= author %></span>
          版本号：<<?php ?>%= version %><br>
          更新于：<<?php ?>%= _lastupdate %></p>
        <p><a class="ext-btn <<?php ?>%= ({"install":"add-btn","installed":"installed-btn","update":"update-btn"})[status] %> ">增加到浏览器</a></p>
    </div>
</script>

<div class="head-warp">
  <div class="head">
    <h1><a href="http://chrome.360.cn/">360极速浏览器</a></h1>
    <div class="nav-box">
      <ul>
        <li><a href="http://chrome.360.cn/">首页</a></li>
        <li><a href="http://chrome.360.cn/labs.html">实验室</a></li>
        <li class="cur"><a href="https://ext.chrome.360.cn">扩展</a></li>
        <li><a href="https://skin.chrome.360.cn/">皮肤</a></li>
        <li><a href="http://chrome.360.cn/newuplog.html">日志</a></li>
        <li><a href="http://chrome.360.cn/help/index.html">帮助</a></li>
        <li><a href="http://bbs.chrome.360.cn" target="_blank">论坛</a></li>
        <li class="last"><a href="http://www.360.cn/" target="_blank">360首页&gt;&gt;</a></li>
      </ul>
      <div class="nav-line"></div>
    </div>
  </div>
</div>
<script>

	if(typeof ___lt8=="undefined"){
		document.write(document.getElementById("template-content-wrapper").innerHTML);

	}else{
		document.write(document.getElementById("notsupport-tip").innerHTML);
	}

</script>
<div class="footer">
  <p>Copyright©2005-2012 360.CN All Rights Reserved 360安全中心<br>
    隐私权政策 京ICP证080047号 </p>
</div>
<div class="dialog-bg" style="display:none;"></div>

<div id="jqmContainer" class="jqmWindow" style="display:none;">
        <form id="weiboForm">
        <div class="share">
                <div class="sharebg"></div><!--end sharebg-->
            <div class="sharec">
                <div class="sharet">
                        <h2>分享你的360浏览器皮肤</h2>
                    <span>
                        <label id="username"></label>
                    <a class="change_user" href="" target="_self">更换帐户</a>
                    <!--<a href="javascript:void(0)" onclick="change_user()">更换帐户</a>-->
                    <a href="javascript:void(0)" class="cls jqmClose"></a>
                    </span>
                </div><!--end sharet-->
                <div class="share-list" id="content">
                        
                </div><!--end share-list-->
                <div class="shareb">
                    <input type="checkbox" name="follow360" id="checkbox" checked/>
                    关注360极速浏览器 
                    <input type="button" name="button" value="" onclick="sendToweibo()" class="share-btn"/>
                </div><!--end shareb-->
            </div><!--end sharec-->
        </div>
        </form>
    </div>
    <div id="jqmResult" class="jqmWindow" style="display:none;z-index:99999">
        <div class="share result">
                <div class="sharebg"></div><!--end sharebg-->
            <div class="resultc">
                <h3>分享成功</h3>
                <p>5秒钟之后窗口自动关闭，<a href="javascript:void(0)" class="jqmClose">点击这里</a>立即关闭</p>
                <a href="http://weibo.com" target="_blank" class="share-btn share-btn-result"></a>
            </div><!--end sharec-->
        </div><!--end share-->   
    </div>
	
	

<script type="text/template">
		<<?php ?>%= ({"installed":'<a class="ext-tag" style="top: 0px; "></a>',"update":'<a class="update-tag" style="top: 0px; "></a>'})[status]||"" %>
        <div class="ext-wrap">
            <a class="ext-logo" >
                <img src="<<?php ?>%= logo %>" width="48" height="48">
            </a>
            <div class="ext-desc">
                <h1><<?php ?>%= name %></h1>

                <p><<?php ?>%= shortdesc||"简短说明" %></p>
            </div>
            <div class="ext-install">
                <p class="line"><span>作者：</span><em><<?php ?>%= author %></em></p>

                <p class="line"><span>版本号：</span><em><<?php ?>%= version %></em></p>

                <p class="line"><span>更新于：</span><em><<?php ?>%= _lastupdate %></em></p>
				<a class="btn <<?php ?>%= ({"install":"add-btn","installed":"installed-btn","update":"update-btn"})[status] %>" href="javascript:void(0)"><<?php ?>%= ({"install":"安装到浏览器","installed":"已添加此扩展","update":"更新此扩展"})[status] %></a>
            </div>
        </div>
</script>


<script type="text/template" id="template-view-ext-search">
    <div class="ext-block-search" extid="<<?php ?>%= crx_id %>">
        <a href="/webstore/detail/<<?php ?>%= crx_id %>" target="_blank">
            <img src="<<?php ?>%= logo %>" alt="<<?php ?>%= shortdesc %>" width="48" height="48">
        </a>

        <div class="txt">
            <h3><a href="/webstore/detail/<<?php ?>%= crx_id %>" target="_blank"><<?php ?>%= name %></a></h3>

            <p><<?php ?>%= shortdesc||"shortdesc" %></p>

            <p><<?php ?>%= author %></p>
        </div>
        <div class="star"><span style="width:<<?php ?>%= parseInt(hot) %>%;"></span></div>
        <a class="btn <<?php ?>%= ({"install":"add-btn","installed":"installed-btn","update":"update-btn"})[status] %>" href="javascript:void(0)"><span>╋</span> <<?php ?>%= ({"install":"安装到浏览器","installed":"已添加此扩展","update":"更新此扩展"})[status] %></a>
    </div>
</script>

<script type="text/template" id="template-category-type">
	<td><a href="javascript:void(0)" type="<<?php ?>%= catetype %<?php ?>>"><<?php ?>%= catename %<?php ?>></a></td>
</script>


<script src="https://ext.chrome.360.cn/js/jquery.js"></script>
<script src="https://ext.chrome.360.cn/js/jqModal.js"></script>
<script src="https://ext.chrome.360.cn/js/underscore-1.1.6.js"></script>
<script src="https://ext.chrome.360.cn/js/backbone.js"></script> 
<script src="https://ext.chrome.360.cn/js/main.js"></script>
<script>

$(function(){
//	srollList(".dialog01","11");
	if(typeof JSON=="undefined"){
		JSON={parse:function(str){try{eval("var ___r=("+str+")");return ___r;}catch(e){return null;}},stringify:function(){}}
	}
	if(typeof ___lt8=="undefined"){
		var ___jss=["/js/index.js"];
		var href=document.location.href;
		for(var i=0,len=___jss.length;i<len;i++){
			var sc=document.createElement("script");
			sc.type="text/javascript";
			sc.src="https://ext.chrome.360.cn"+___jss[i];
			document.body.appendChild(sc);
		}
	}
});

</script>
</body>
</html>
