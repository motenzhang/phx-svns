<?php
require SITE_PATH . 'classes/ck.php';
require SITE_PATH . 'include/sconfig.php';
require SITE_PATH . 'classes/saetv2.ex.class.php';
class webstore extends gController {
	public function index () {
		$this->home();
	}
	
	public function home () {
		if(!isset($_REQUEST['category'])) {
	       $_REQUEST['category'] = '全部';
	    }
		//微博start
		/*$token = ck::get('token'); 
		$aurl = ''; 
        if (!empty($token) && isset($token['access_token']) ) {
            //已经登录
            $islogined = 1;
        } else {
            ck::del('token');//未认证
            $backUrl = '/webstore/home';
            $o = new SaeTOAuthV2( Sconfig::$weibo['APPKEY'] , Sconfig::$weibo['APPSECRET'] );
            $callback = Sconfig::$system['url'] . '?backurl=' . urlencode($backUrl);
            $aurl = $o->getAuthorizeURL( $callback );
            $islogined = 0;
        }
        $this->islogined = $_SESSION['islogined'] = $islogined;
		$this->aurl = $aurl;*/
		//微博end
		$category = gClass ('CateStorage')->get_cate_sort_list ();
		$this->initData = gClass ('provider', null, G_SITE_CONTROLLER_PATH)->extlist (FALSE);
		$this->cateJson = json_encode ($category);
		$this->islogined = 0;
		$this->aurl = '';
		$this->display ('extensions/home.html');
		
	}
	
	public function search () {
		$this->home();
	}
	
	public function skip() {
	    $this->display ('extensions/skip.html');
	}
	
	public function detail () 
	{
	    $extid = isset($GLOBALS['G']['url_args'][0]) ? urldecode(trim($GLOBALS['G']['url_args'][0])) : '';
		if(empty($extid)) {
		   exit ('非法访问！');
		}
		$extone = gClass ('ExtStorage')->find_one ($extid);
		if(empty($extone) || $extone['offline'])
		{
			$googleBaseUrl = $GLOBALS['G']['googleBaseUrl'];
			$this->jump($googleBaseUrl."/extensions/detail/".$extid);
		}
		$_REQUEST['request_action'] = 'detail';
		$this->home();
	}
	
	public function category () {
		$_REQUEST['category'] = isset($GLOBALS['G']['url_args'][0]) ? urldecode(trim($GLOBALS['G']['url_args'][0])) : '全部';
		$GLOBALS['G']['url_args'][0] = '';
		$this->home();
	}
	
	function send_action () {
        if (@$_SESSION['islogined'] <= 0 || empty($_SESSION['share_id'])) {
            exit ('非法访问！');
        }
        $token = ck::get('token');
        $c = new SaeTClientV2( Sconfig::$weibo['APPKEY'] , Sconfig::$weibo['APPSECRET'] , $token['access_token'] );

        $content = @$_POST['textarea'];
        $follow360 = @$_POST['follow360'];
        
        echo (json_encode(array ('status'=>'success')));
        fastcgi_finish_request();
        
        if ($follow360 == 'on') {
            //TODO: 调用关注极速360官方微博
            $r = $c->follow_by_id ('1808070557');
        }
       
        $shareContent = strip_tags(trim($content));
        $ext_info = gClass('ExtStorage')->find_one($_SESSION['share_id']);
        $detailpicArr = json_decode($ext_info['descpic'], true);
        $ext_info['detailpic'] = $detailpicArr[0];
        
        $r = $c->upload($shareContent, $ext_info['detailpic']);
		$r = $c->follow_by_id ('1230315942');
    }
    
    /**
     * 获取分享弹出框html，同时需要读取用户相互关注粉丝
     */
    function ajax_share_content () {
        $id = @$GLOBALS['G']['url_args'][0];
        if (empty($id)) exit;
        $_SESSION['share_id'] = $id;
        if (@$_SESSION['islogined']) {
            $token = ck::get('token');
            $c = new SaeTClientV2( Sconfig::$weibo['APPKEY'] , Sconfig::$weibo['APPSECRET'] , $token['access_token'] );
            
            //TODO: 获取用户互相关注用户列表
            $friends = $c->bilateral($token['uid'], 1, 100);
            $this->friends = $friends['users'];
            $ext_info = gClass('ExtStorage')->find_one($id);
            $detailpicArr = json_decode($ext_info['descpic'], true);
            $ext_info['detailpic'] = $detailpicArr[0];
            $this->ext_info = $ext_info;
 
            //授权用户详细信息
            $userinfo = $c->show_user_by_id($token['uid']);
 
            //取得微博发布内容
            require SITE_PATH . 'include/weibo_content.php';
            $this->weibo_content = rand_content ($cfg_content, $this->ext_info);
            
            
            $nick = !empty ($userinfo['screen_name']) ? $userinfo['screen_name'] : $userinfo['name'];
            exit (json_encode(array ('status'=>'success', 'html'=>$this->display('extensions/share.html', false), 'nick'=>$nick)));
        }
        exit (json_encode(array('status'=>'error', 'msg'=>'未登录')));
    }
    
    function change_user () {
        ck::del('token');//未认证
        $_SESSION['islogined'] = 0;
        
        $backUrl = !empty($_REQUEST['backurl']) ? $_REQUEST['backurl'] : '/webstore/home';
        $backUrl = urlencode($backUrl);
        
        $o = new SaeTOAuthV2( Sconfig::$weibo['APPKEY'] , Sconfig::$weibo['APPSECRET'] );
        $callback = Sconfig::$system['url'] . '?backurl='.$backUrl;
        $this->aurl = $o->getAuthorizeURL( $callback );
        $this->aurl .= '&forcelogin=true';  //强制重新登录
        header ('Location:'.$this->aurl);
    }
    
    function auth_callback () {
        $backUrl = trim(@$_REQUEST['backurl']);
        if (empty($backUrl)) {
            $backUrl = '/webstore/home';
        } else {
            $backUrl = urldecode($backUrl);
        }
        if (isset($_REQUEST['code'])) {
            $callback = Sconfig::$system['url'];
            $keys = array();
            $keys['code'] = $_REQUEST['code'];
            $keys['redirect_uri'] = $callback;
            $o = new SaeTOAuthV2( Sconfig::$weibo['APPKEY'] , Sconfig::$weibo['APPSECRET'] );
            
            try {
                $token = $o->getAccessToken( 'code', $keys ) ; 
            } catch (OAuthException $e) {}

            if ($token) {
                ck::set('token', $token);
            }
            header ('Location:'.$backUrl);
        }
    }
	
}