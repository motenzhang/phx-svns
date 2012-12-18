<?php
$cfg_content = array (
    0 => ' @360极速浏览器 扩展{name}，下载地址{detailUrl}'
);
function rand_content ($data, $info) {   
    $all = $data[0];   
    return str_replace(array('{name}','{detailUrl}'), array($info['name'], Sconfig::$system['domainurl'].'webstore/detail/'.$info['crx_id']), $all);
}