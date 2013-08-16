<?php
/**
 * 简单封装 Smarty 方法
 * @author 潘洪学 panliu888@gmail.com
 * @create_date	2011-10
 */
include_once '_CLASS/Smarty/Smarty.class.php';

class Template extends Smarty
{
	private $tpl_type ;  //静态文件的类型
	private $directory;  //模板子目录
	public function __construct($directory = '')
	{
		parent::__construct();
		$this->left_delimiter = '<{';
		$this->right_delimiter = '}>';
		$this->directory = $directory;
		$this->template_dir = TEMPLATE_PATH;
		$this->compile_dir = COMPILER_PATH;
		$this->tpl_type = TEMPLATE_TYPE;
	}
	/**
	 * @name d
	 * @desc 模板显示
	 **/
	public function d($resource_name, $cache_id = null, $compile_id = null)
	{
		$this->r($resource_name, $cache_id , $compile_id ,true);
	}
	/**
	 * @name r
	 * @desc 将模板值返回
	 **/
	public function r($resource_name, $cache_id = null, $compile_id = null, $display = false)
	{
		global $TEMPLATE ;
		$this->assign('TEMPLATE', $TEMPLATE);
		return $this->fetch($resource_name.".".$this->tpl_type, $cache_id , $compile_id , null, $display);
	}
}

?>