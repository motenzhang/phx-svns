<?php
/**
 * 跨域关闭父窗口代理
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../init.php';
?>
<script>
opener.location=opener.location;
window.close();
</script>