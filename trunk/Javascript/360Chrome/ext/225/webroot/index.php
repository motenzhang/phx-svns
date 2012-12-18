<?php
header ('Content-Type: text/html; charset=UTF-8');
ini_set('include_path', ini_get ('include_path').':/data/htdocs/frm');

//此宏定义必须设置，由框架调用设置控制器路径
define("SITE_PATH", dirname(__DIR__) . '/' );


require("gEntry.php");

gRun();
