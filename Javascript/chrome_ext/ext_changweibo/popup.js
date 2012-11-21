tinyMCE.init({
	// General options
	elements	: 'content',
	mode		: 'exact',
	theme		: 'advanced',
	skin		: 'o2k7',
	skin_variant: 'silver',
	plugins		: 'safari,table,advimage,inlinepopups,media,searchreplace,contextmenu,paste,fullscreen,iframe',
	language	: 'zh',
	width		: '650',
	height		: '450',
	element_format : 'html',
	remove_script_host : false,
	relative_urls : false,
	document_base_url : '../../',
	// Theme options
	theme_advanced_buttons1: 'bold,italic,underline,|,forecolor,backcolor,fontselect,fontsizeselect,justifyleft,justifycenter,justifyright,|,bullist,numlist,outdent,indent,|,table,image,link,unlink,|,code,fullscreen',
	theme_advanced_buttons2: '',
	theme_advanced_buttons3 : '',
	theme_advanced_toolbar_location : 'top',
	theme_advanced_toolbar_align : 'left',
	theme_advanced_statusbar_location : 'none',
	theme_advanced_resizing : false,
	//content_css : 'css/content.css',
	template_external_list_url : 'lists/template_list.js',
	external_link_list_url : 'lists/link_list.js',
	external_image_list_url : 'lists/image_list.js',
	media_external_list_url : 'lists/media_list.js',
	// Replace values for the template plugin
	template_replace_values : {
	}
});
