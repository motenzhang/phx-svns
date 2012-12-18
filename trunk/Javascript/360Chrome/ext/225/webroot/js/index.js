if(!window.console){
	window.console={log:function(){}}
}
 function htmlspecialchars(str) {
	 if (typeof(str) == "string") {
		  str = str.replace(/&/g, "&amp;"); /* must do &amp; first */
		  str = str.replace(/"/g, "&quot;");
		  str = str.replace(/'/g, "&#039;");
		  str = str.replace(/</g, "&lt;");
		  str = str.replace(/>/g, "&gt;");
	  }
	 return str;
  }

var __d=__d||[],__presetdata=__initData;
var URLCONF={domain:__d[0]||"https://ext.chrome.360.cn",webroot:__d[1]||"/webstore/"};
var CATETYPEMAP = {}, CATENAMEMAP = {}, CATEIDMAP = {}, SORTTYPEMAP = {};
(function () {
    for (var i = 0, len = _ExtCate.length; i < len; i++) {
        CATETYPEMAP[_ExtCate[i]["id"]] = _ExtCate[i]['cate'];
        CATENAMEMAP[_ExtCate[i]['id']] = _ExtCate[i]['cate'];
        CATEIDMAP[_ExtCate[i]['cate']] = _ExtCate[i]['id'];
    }
})();
var ExtRouter = Backbone.Router.extend({
    routes:{
        "search/:keyword":"viewsearch",
        "category/:type":"viewcategory",
        "detail/:id":"viewdetail",
        "*actions":"defaultroute"
    },
    initialize:function () {

    },
    viewsearch:function (keyword) {
        PATH.update("search", keyword);
        $("#search-form input[name=q]").val(keyword);
    },
    viewcategory:function (type) {		
        if (CATEIDMAP[type]) {
            $("#category-type li").removeClass("cur").parent().find("a[type=" + CATEIDMAP[type] + "]").parent().addClass("cur");
			fixNav();
            document.title = "扩展中心 - 360极速浏览器 - " + type;
            PATH.update("category", type);
            $("#search-form input[name=q]").val("");
        } else {
            this.navigate("category/" + CATENAMEMAP[_ExtCate[0]['id']], {trigger:true});
        }
    },
    viewdetail:function (extid) {
        PATH.update("detail", extid);
    },
    defaultroute:function (actions) {
        this.navigate("category/" + CATETYPEMAP[_ExtCate[0]['id']], {trigger:true});
    }
});
(function () {
    var depends = {
        version:{
            gte:function (srcver, targetver) {
                return !depends.version.lt(srcver, targetver);
            },
            gt:function (srcver, targetver) {
                var srcarr = srcver.split(".");
                var tararr = targetver.split(".");
                var len = srcarr.length > tararr.length ? srcarr.length : tararr.length;
                var s = 0, t = 0;
                for (var i = 0; i < len; i++) {
                    s = parseInt(srcarr[i], 10) || 0;
                    t = parseInt(tararr[i], 10) || 0;
                    if (s > t) {
                        return true;
                    } else if (s < t) {
                        return false;
                    }
                }
                return false;
            },
            lt:function (srcver, targetver) {
                var srcarr = srcver.split(".");
                var tararr = targetver.split(".");
                var len = srcarr.length > tararr.length ? srcarr.length : tararr.length;
                var s = 0, t = 0;
                for (var i = 0; i < len; i++) {
                    s = parseInt(srcarr[i], 10) || 0;
                    t = parseInt(tararr[i], 10) || 0;
                    if (s < t) {
                        return true;
                    } else if (s > t) {
                        return false;
                    }
                }
                return false;
            },
            lte:function (srcver, targetver) {
                return !depends.version.gt(srcver, targetver);
            }
        }
    };
    window.depends = depends;
})();
(function () {
    var chromeapi = {
        installExt:function (extobj) {
			$.get(URLCONF["domain"]+"/provider/clk/"+extobj["crx_id"]);
            window.open(extobj['filename'], "_self");
            return false;
        },
        is360chrome:function () {
            return navigator.userAgent.toLowerCase().indexOf('360ee') !== -1;
        }
    };
    if (typeof chrome != "undefined" && chrome.webstorePrivate && chrome.webstorePrivate.beginInstallWithManifest3) {
		if(chromeapi.is360chrome()&&depends.version.gte(navigator.userAgent.match(/(Chrome\/\S*)/)[0].split("/")[1],"30.0.963.83")){
		chromeapi.installExt = function (extobj) {
            try {
                manifest = extobj['manifest'];
                var dobj = {id:extobj["crx_id"], manifest:manifest,iconUrl:extobj["logo"], locale:extobj['default_locale'], localizedName:extobj['name'], is360WebStore:true, crx360DownloadUrl:"https://ext.chrome.360.cn/provider/crxInstall"};
                chrome.webstorePrivate.beginInstallWithManifest3(dobj, function (a) {
                    if (a) {
                    } else {
						$.get(URLCONF["domain"]+"/provider/clk/"+extobj["crx_id"]);
                        chrome.webstorePrivate.completeInstall(extobj['crx_id'], function () {
                        });
                    }
                });
            } catch (e) {
                return false;
            }
            return true;
        }
		}
    }
    try {
        chrome.management.onUninstalled.addListener(function (items) {
			alert('onUninstalled');
			delete window.DC.installedextcache[items];
            if (!DC.extcache[items]) {
                return;
            }
            DC.extcache[items]["status"] = "install";
//            DC.installedextcache[items] = DC.extcache[items];
            var $target = $("div[extid=" + items + "]");
            if ($target) {
                for (var i = 0, len = $target.length; i < len; i++) {
					$target.find(".installed-btn,.update-btn").removeClass("installed-btn update-btn").addClass("add-btn");
					$target.find(".ext-logo span.installed,.ext-logo span.update").removeClass();
                    if ($target.parents(".app-list").length > 0) {
                        
                    }
                }
            }
            return;
        });
        chrome.management.onInstalled.addListener(function (items) {
				alert('onInstalled');
				if(DC.extcache[items["id"]]){
					DC.extcache[items["id"]]["status"] = "installed";				
					if (depends.version.lt(items['version'], DC.extcache[items["id"]]['version'])) {
						DC.extcache[items["id"]]["status"] = "update";
					}
				}
				DC.installedextcache[items["id"]] = items;
				var $target = $("div[extid=" + items["id"] + "]");
				if ($target) {
					for (var i = 0, len = $target.length; i < len; i++) {
						$target.find(".add-btn,.update-btn").removeClass("add-btn update-btn").addClass({"installed":"installed-btn","update":"update-btn"}[DC.extcache[items['id']]['status']]);
						$target.find('a.ext-logo span').removeClass().addClass(({"installed":"installed","update":"update"})[DC.extcache[items['id']]['status']]);
						if ($target.parents("#app-container").length > 0) {
							//$('<a class="'+({"installed":"ext-tag","update":"update-tag"}[DC.extcache[items["id"]]["status"]])+'" style="top: 0px; "></a>').insertBefore($target.find(".ext-wrap"));
						}
					}
				}
                return;
            }
        );
    } catch (e) {

    }
    window.chromeapi = chromeapi;
})();

var QueryObj = function (viewtype, param, count, sorttype, token) {
    this.viewtype = viewtype || "category";
    this.param = param || CATETYPEMAP[_ExtCate[0]['id']];
    this.count = count || 20;
    this.sorttype = sorttype || "hot";
    this.token = token || 0;
};
QueryObj.prototype.serialize = function () {
    return "[" + this.viewtype + ":" + this.param + ":" + this.count + ":" + this.sorttype + ":" + this.token + "]";
};
QueryObj.prototype.genQueryUrl = function () {
    if (!this.param) {
        this.viewtype = "category";
    }
    if (this.viewtype == "search") {
        return URLCONF['domain']+"/provider/extlist/" + encodeURIComponent(this.param) + "?count=" + this.count + "&sortType=" + this.sorttype + "&token=" + this.token;
    } else if (this.viewtype == "category") {
        return URLCONF['domain']+"/provider/extlist/?category=" + encodeURIComponent(this.param) + "&count=" + this.count + "&sortType=" + this.sorttype + "&token=" + this.token;
    } else if (this.viewtype == "detail") {
        return URLCONF['domain']+"/provider/extone/" + encodeURIComponent(this.param);
    }
};
QueryObj.prototype.toString = function () {
    return this.serialize();
}
QueryObj.unserialize = function (str) {
    return new QueryObj();
};
var DC =window.DC|| {
    datafix:function (extobj) {
//        extobj['moredesc']=extobj['moredesc'].split(/[<br \/>||\n]+/).join("");
        extobj['descpic'] = JSON.parse(extobj['descpic']);
        extobj["s_descpic"] = _.map(extobj["descpic"], function (pic) {
            var index = pic.lastIndexOf("/");
            return  pic.substring(0, index) + "/s_" + pic.substr(index + 1);
        });
		var d=new Date();
		d.setTime(parseInt(extobj['lastupdate'])*1000);
		extobj['_lastupdate']=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
/*
        extobj['descpic'] = ["https://lh4.googleusercontent.com/zX5PjKJHX6fiwkzZ3zZwggVpds0vgd6JdcR1Bxf-odaKcUuDIgrGCMvbUCuWa2u2knSxTLFH=s640-h400-e365",
            "https://lh6.googleusercontent.com/AKnSEdJy_LLg-qNc1IzNPuOVBGMYMmcqy7GO1LCSwIqPDexoV-aFA-Xyx0LuW8GFD2OtONb5=s640-h400-e365",
            "https://lh5.googleusercontent.com/vtJuSgq13EKn1ySvJx2fbsooMzpy6xMe-zWdKlEpIXgH5xxhJL0fO1x2MWhwRL8laRgwOWC0vg=s640-h400-e365"];
        extobj['s_descpic'] = ["https://lh4.googleusercontent.com/zX5PjKJHX6fiwkzZ3zZwggVpds0vgd6JdcR1Bxf-odaKcUuDIgrGCMvbUCuWa2u2knSxTLFH=s120-h90-e365",
            "https://lh6.googleusercontent.com/AKnSEdJy_LLg-qNc1IzNPuOVBGMYMmcqy7GO1LCSwIqPDexoV-aFA-Xyx0LuW8GFD2OtONb5=s120-h90-e365",
            "https://lh5.googleusercontent.com/vtJuSgq13EKn1ySvJx2fbsooMzpy6xMe-zWdKlEpIXgH5xxhJL0fO1x2MWhwRL8laRgwOWC0vg=s120-h90-e365"];
  */      
		extobj['cates'] = extobj['cates'].split(" ");
        //extobj['default_locale'] = (extobj['manifest'].split("\"default_locale\":\"")[1] || "zh_CN").split("\"")[0];
        extobj['default_locale'] = "zh_CN";
    },
    getData:function (queryobj, cb) {
        if (DC.queue[queryobj.serialize()]) {
            return;
        }
        var data = this.getCacheData(queryobj);
        if (data) {
            cb(data, queryobj);
            return;
        }
        if (this.noMoreData(queryobj)) {
			cb({},queryobj);
            return;
        }
        this.queue[queryobj.serialize()] = {"cb":cb};	
		$.get(queryobj.genQueryUrl(), function(data){DC.onGetData(queryobj,data)});
        return;
    },
	onGetData:function (queryobj,data) {
		if(typeof(data)!="object"){
			try{
				data = JSON.parse(data);
			}catch(e){
				if(queryobj.viewtype!="category"){
					window.extrouter.navigate("category",{trigger:true});
					return;
				}
			}
		}
		var extobj;
		if (queryobj.viewtype != "detail") {
			for (var i = 0, len = data['list'].length; i < len; i++) {
				extobj = data['list'][i];
				if(!DC.extcache[extobj['crx_id']]){
					DC.extcache[extobj['crx_id']] = extobj;
					extobj["status"]="install";
				}
				DC.datafix(extobj);
				if (DC.installedextcache[extobj['crx_id']]) {
					if(DC.extcache[extobj['crx_id']]["status"]== "install"){
						DC.extcache[extobj['crx_id']]["status"]= "installed";
						if (depends.version.lt(DC.installedextcache[extobj['crx_id']]['version'], extobj['version'])) {
							extobj["status"] = "update";
						}
					}
				} else {
					extobj["status"] = "install";
				}
			}
		} else {
			DC.extcache[data['crx_id']] = data;
			DC.datafix(data);
			if (DC.installedextcache[data['crx_id']]) {
				data["status"] = "installed";
				if (depends.version.lt(DC.installedextcache[data['crx_id']]['version'], data['version'])) {
					data["status"] = "update";
				}
			} else {
				data["status"] = "install";
			}
		}
		DC.datacache[queryobj.viewtype] = DC.datacache[queryobj.viewtype] || {};
		DC.datacache[queryobj.viewtype][queryobj.param] = DC.datacache[queryobj.viewtype][queryobj.param] || {};
		DC.datacache[queryobj.viewtype][queryobj.param][queryobj.sorttype] = DC.datacache[queryobj.viewtype][queryobj.param][queryobj.sorttype] || {data:[], nomoreleft:0};
		var url = queryobj.serialize();
		var d = {};
		d[url] = data;
		DC.datacache[queryobj.viewtype][queryobj.param][queryobj.sorttype]['data'].push(d);
		DC.datacache[queryobj.viewtype][queryobj.param][queryobj.sorttype]['nomoreleft'] = (data['left'] == 0);
		DC.queue[queryobj.serialize()]&&DC.queue[queryobj.serialize()]["cb"]&&DC.queue[queryobj.serialize()]["cb"](data, queryobj);
		delete DC.queue[queryobj.serialize()];
	},
    getCacheData:function (queryobj) {
        var _data = DC.datacache[queryobj.viewtype] || {};
        _data = _data[queryobj.param] || {};
        _data = _data[queryobj.sorttype] || {};
        var key = queryobj.serialize();
        _data = _data['data'] || [];
		var _begin=false;
		var _lastdata={};
		var rs=[];
        for (var i = 0, len = _data.length; i < len; i++) {
		if(_begin==false){
			if(_data[i][key]){
				if(_data[i][key]['list']){
					_begin=true;
					_lastdata=_data[i][key];
					rs=rs.concat(_data[i][key]['list']);
				}
			}
		}else{
			for(var k in _data[i]){
				if(_data[i][k]){
					if(_data[i][k]['list']){
						_lastdata=_data[i][k];
						rs=rs.concat(_data[i][k]['list']);
					}
				}
			}
		}
        }
		if(rs.length>0){		
			return {left:_lastdata['left'],list:rs,query:{category:(queryobj.viewtype=="category"?queryobj.param:""),count:queryobj.count,search:(queryobj.viewtype=="search"?queryobj.param:""),sortType:queryobj.sorttype,token:""},token:_lastdata['token'],total:rs.length}
		}
        return;
    },
    getExt:function (crx_id, cb) {
        if (this.extcache[crx_id]) {
            cb(this.extcache[crx_id]);
        } else {
            this.getData(new QueryObj("detail", crx_id, 1, 'hot', 0), cb);
        }
    },
    getInstalledData:function () {
        try {
            chrome.management.getAll(function (extlist) {
				function oninstalled(items) {		
					console.log('ongetinstalleddata..');
					if(DC.extcache[items["id"]]){
						DC.extcache[items["id"]]["status"]="installed";
						if (depends.version.lt(items['version'], DC.extcache[items["id"]]['version'])) {
							DC.extcache[items["id"]]["status"] = "update";

						}
						DC.installedextcache[items["id"]] = DC.extcache[items["id"]];
					}else{
						DC.installedextcache[items["id"]] = items;
					}
					var $target = $("div[extid=" + items["id"] + "]");
					if ($target) {
						for (var i = 0, len = $target.length; i < len; i++) {
							$target.find(".add-btn").removeClass("add-btn").addClass(({"installed":"installed-btn","update":"update-btn"}[DC.extcache[items["id"]]&&DC.extcache[items["id"]]["status"]||"installed"]));
							if ($target.parents(".app-list").length > 0) {
								$target.find('.ext-logo span').removeClass().addClass(({"install":"aaaa","installed":"installed","update":"update"})[DC.extcache[items["id"]]["status"]]);
								//console.log($target.find('.ext-logo span'));
								//$('<a class="'+({"installed":"ext-tag","update":"update-tag"}[DC.extcache[items["id"]]&&DC.extcache[items["id"]]["status"]||"installed"])+'" style="top: 0px; "></a>').insertBefore($target.find(".ext-wrap"));
//								$('<a class="ext-tag" style="top: 0px; "></a>').insertBefore($target.find(".ext-wrap"));
							}
						}						
					}
					var $target2=$('')
					return;
				}
                for (var i = 0, len = extlist.length; i < len; i++) {
					oninstalled(extlist[i]);
                }
            });
        } catch (e) {
        }
		var presetqueryobj=__presetdata["query"];
		var queryobj=new QueryObj((presetqueryobj.search!=""?"search":"category"),presetqueryobj.search||(presetqueryobj.category)||"全部",presetqueryobj.count,presetqueryobj.sortType,0);
		if(presetqueryobj[queryobj.viewtype]==queryobj.param
			&&presetqueryobj.sortType==queryobj.sorttype
			&&presetqueryobj.count==queryobj.count){
			this.onGetData(queryobj,__presetdata);
		}
    },
    noMoreData:function (queryobj) {
        var type = queryobj.viewtype, param = queryobj.param, sorttype = queryobj.sorttype;
        var d = DC.datacache[type] || {};
        d = d[param] || {};
        d = d[sorttype] || {};
        return d['nomoreleft'];
        if (d['data'] && d['data'].length > 0) {
            d = d['data'];
            if (d[d.length - 1]) {
                d = d[d.length - 1];
                for (var key in d) {
                    if (d[key].left == 0) {
                        return false;
                    }
                }
                ;
                return d[d.length - 1].left == 1;
            }
        }
    },
    queue:{},
    extcache:{},
    installedextcache:{},
    datacache:{} //queryobj.serialize=>data
};
DC.getInstalledData();


var apps_data = [];
var viewmap = {};
var ExtModel = Backbone.Model.extend({});
var ExtList = Backbone.Collection.extend({
    model:ExtModel
});
var LoadingTips = {
    show:function () {
        $(".loading-tip").show();
    },
    hide:function () {
        $(".loading-tip").hide();
    }
};

var ExtView = Backbone.View.extend({
    tagName:"li",
    template:_.template($("#template-view-ext").html()),
    node:null,
    animatetimeout:0,
    events:{
        "click":"onClick",
        "click a.add-btn":"installExt",
		"click a.update-btn":"installExt",
        "click a.insed-btn":"onClick",
        "mouseenter":"onmouseenter",
        "mouseleave":"onmouseleave"
    },
    onmouseenter:function (e) {
        var that = this;
        this.animatetimeout = setTimeout(function () {
            that.node.find('.ext-logo').animate({'margin-top':"-95px"},200);
        }, 100);
    },
    onmouseleave:function (e) {
        clearTimeout(this.animatetimeout);
        this.node.find('.ext-logo').animate({'margin-top':"0px"},200);
    },
    installExt:function (e) {
		e.preventDefault();
		if(!(DC.installedextcache[this.model.get("crx_id")]&&this.model.get("status")=="installed")){
			chromeapi.installExt(DC.extcache[this.model.get("crx_id")]);
		}
        return false;
    },
    onClick:function (e) {
        var extid = this.model.get("crx_id");
        extrouter.navigate("detail/" + extid, {trigger:true});
    },
    initialize:function () {
        this.model.bind("change", this.render, this);
    },
    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        this.node = $(this.el).find(".ext-block");
        return this;
    }
});
var SearchExtView = Backbone.View.extend({
    tagName:"li",
    template:_.template($("#template-view-ext-search").html()),
    events:{
        "click":"onClick",
        "click a.add-btn":"installExt",
		"click a.update-btn":"installExt"
    },
    installExt:function (e) {
		e.preventDefault();
		if(!(DC.installedextcache[this.model.get("crx_id")]&&this.model.get("status")=="installed")){
			var r = chromeapi.installExt(DC.extcache[this.model.get("crx_id")]);
		}        
        return false;
    },
    onClick:function (e) {
        var extid = this.model.get("crx_id");
        extrouter.navigate("detail/" + extid, {trigger:true});
    },
    initialize:function () {
    },
    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});
var DetailExtView = Backbone.View.extend({
    el:$("<div></div>"),
    template:_.template($("#template-view-ext-detail").html()),
    timehandler:0,
    currentPicIndex:0,
    totalPic:1,
    events:{
		"click a.download-btn":"preventDefault",
        "click a.add-btn":"installExt",
		'click a.weiboshare':'weiboshare',
		"click a.update-btn":"installExt"
    },
	preventDefault:function(e){
		e.preventDefault();
	},
    installExt:function (e) {
		e.preventDefault();
		if(!(DC.installedextcache[this.model.get("crx_id")]&&this.model.get("status")=="installed")){
			var r = chromeapi.installExt(DC.extcache[this.model.get("crx_id")]);
		}
        return false;
    },
	weiboshare:function(e){
		$('#jqmContainer').show().css('z-index',99999);
		function loadContent (id) {
			$.post('/webstore/ajax_share_content/'+id, {}, function(msg){
					if (msg&&(typeof(msg)).toLowerCase()=="object"&&msg.status == 'success') {
						$('#content').html(msg.html);
						$('#username').html(msg.nick);
					} else {
						$('#content').html('无法获取网络内容，请刷新页面后重试。');
						}
				}, 'json');
		};
		if(__islogined!='0'){
			loadContent(this.model.get('crx_id'));
			return false;
		}else{
			$(e.target).attr('href',__aurl.replace(encodeURI(encodeURIComponent('/webstore/home')),encodeURI(encodeURIComponent('/webstore/detail/'+this.model.get('crx_id')))));
		}
	},
    initialize:function () {},
	startpic:function(){
		
	
	},
    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));		
        this.delegateEvents(this.events);
        return this;
    },
    updatesort:function (newsorttype) {	}
});

var SearchView = Backbone.View.extend({
    el:$(".search-app-list"),
    viewtype:"search",
    param:"",
    lasttoken:"",
    total:"",
    events:{},
	extlist:[],
    initialize:function () {
    },
    update:function () {
        var queryobj = new QueryObj(PATH.type, PATH.param, 20, "download"||PATH.sorttype || "hot", this.lasttoken);
        DC.getData(queryobj, this.updatedata);
    },
    more:function (scrolltop, height) {
        if (this.el.height() - scrolltop - height < 400) {
            this.update();
        }
    },
    clear:function () {
        this.lasttoken = "";
        this.total = 0;
        this.param = "";
        this.el.empty();
		this.extlist.length=0;
    },
    updatesort:function (newsorttype) {

    },
    updatedata:function (data, queryobj) {
		var searchview= SearchController.getInstance();
		if(queryobj.token==0){
			SearchController.getInstance().clear();
		}
        var extslist = data['list']||[];
        for (var i = 0, len = extslist.length; i < len; i++) {
            var model = new ExtModel();
            model.set(DC.extcache[extslist[i]["crx_id"]]);
            var extview = new ExtView({model:model});
			searchview.extlist.push(model);
            SearchController.getInstance().el.append(extview.render().el);
        }		
        SearchController.getInstance().viewtype = queryobj.viewtype;
        SearchController.getInstance().param = queryobj.param;
		if (data.token) {
			SearchController.getInstance().lasttoken = data.token;
			SearchController.getInstance().total += data.total;
		}
        if (DC.noMoreData(queryobj)) {
            LoadingTips.hide();
			if(SearchController.getInstance().total==0){
				SearchController.getInstance().el.append($("<div style='padding:20px;color:#888;font-size:14px;'>未找到相符的搜索结果</div>"))
			}
        } else {
            LoadingTips.show();
        }
    }
});
var CategoryView = Backbone.View.extend({
    el:$(".app-list"),
    template:_.template($("#template-view-category").html()),
    viewtype:"category",
    param:"all",
    lasttoken:"0",
    total:0,
    extlist:[],
    events:{
    },
    initialize:function () {
		this.el_offsetTop = this.el.offset().top
    },
    update:function () {
        var queryobj = new QueryObj(PATH.type, PATH.param, 20, PATH.sorttype, CategoryController.getInstance().lasttoken);
        DC.getData(queryobj, this.updatedata);
    },
    more:function (scrolltop, height) {
        if (this.el.height() + this.el_offsetTop - scrolltop - height < 200) {
            this.update();
        }
    },
    clear:function () {
        this.total = 0;
        this.extlist.length = 0;
        this.lasttoken = 0;
        this.el.empty();
    },
    updatesort:function (newsorttype) {
        this.clear();
        this.update();
    },
    updatedata:function (data, queryobj) {
        if (queryobj.viewtype == "category") {
			if(queryobj.param == CategoryController.getInstance().param){
				
			}else{
				CategoryController.getInstance().clear();
			}
        } else {
            return;
        }
		var categoryview=CategoryController.getInstance();
		if(queryobj.token==0){
			categoryview.clear();
		}
        var jsdata = data;//JSON.parse(data);
        var extslist = jsdata['list']||[];;
        for (var i = 0, len = extslist.length; i < len; i++) {
            var model = new ExtModel();
            model.set(DC.extcache[extslist[i]["crx_id"]]);
            categoryview.extlist.push(model);
            var extview = new ExtView({model:model});
            categoryview.el.append(extview.render().el);
        }
        if (DC.noMoreData(queryobj)) {
            LoadingTips.hide();
        } else {
            LoadingTips.show();
        }
        CategoryController.getInstance().viewtype = queryobj.viewtype;
        CategoryController.getInstance().param = queryobj.param;
		if (jsdata.token) {
			CategoryController.getInstance().lasttoken = jsdata.token;
			CategoryController.getInstance().total += jsdata.total;
		}
    }
});


var DetailView = Backbone.View.extend({
    el:$($("#template-view-detail").html()),
    events:{
        "click .btn-list a":"showdetail",
		'click .next':'onnext',
		'click .prev':'onprev'
    },  
	targetcrxid:'',
    initialize:function () {    },
    render:function () {
		console.log('detail.view..render');
       // $(this.el).html(this.template(this.model.toJSON()));		
        this.delegateEvents(this.events);		
        return this;
    },
    startPicShow:function () {
        var detailview = DetailController.getInstance();
        clearTimeout(detailview.timehandler);
        detailview.timehandler = setTimeout(function () {
            detailview.showPicIndex(++detailview.currentPicIndex);
            DetailController.getInstance().startPicShow();
        }, 5000);
    },
    
    clear:function () { },
	onnext:function(e){
		e.stopPropagation();
		e.preventDefault();
		try{
		var ds=controllers[PATH._type2].getInstance().extlist;
		var index=parseInt(this.el.find('ul li:last img').attr('index'));
		console.log(index);
		if(ds.length>index+1){
			this.updateindex(index+1,true,'next');
		}
		}catch(e){}
	},
	onprev:function(e){
		e.stopPropagation();
		e.preventDefault();
		try{
		var ds=controllers[PATH._type2].getInstance().extlist;
		var index=parseInt(this.el.find('ul li img:first').attr('index'));
		console.log(index);
		if(index-1>0){
			this.updateindex(index-1,true,'prev');
		}
		}catch(e){}
	},
	showdetail:function(e){
		e.stopPropagation();
		var crx_id=$(e.target).parents('li:first').attr('crx_id');
		console.log(crx_id,e,e.target);
		extrouter.navigate("detail/" + crx_id, {trigger:true});
		return false;
	},
    update:function (crx_id) {
        if(PATH._type2){
			var ds=controllers[PATH._type2].getInstance().extlist;
			var index=0;
			for(var i=0;i<ds.length;i++){
				if(ds[i].get('crx_id')==crx_id){
					index=i;
					break;
				}
			}
			this.targetcrxid=crx_id;
			this.updateindex(index);
		}else{
			
		}
    },
	updateindex:function(idx,nocurrent,nextorprev){
		
		var ds=controllers[PATH._type2].getInstance().extlist;
		var $extlist=this.el.find('.btn-list ul');
		var modindex=idx%11;
		var listindex=Math.floor(idx/11);
		
		var htmls=""
		for(var i=11*listindex,len=Math.min(11*(listindex+1),ds.length);i<len;i++){
			htmls+='<li '+((i==idx&&!nocurrent)||(ds[i].get('crx_id')==this.targetcrxid)?'class="cur"':'')+' crx_id='+ds[i].get('crx_id')+'><a href="/webstore/detail/'+ds[i].get('crx_id')+'"><span></span>'+/*(i+1)+*/'<img index="'+i +'" class="slide-control-img" src="'+ ds[i].get('logo') +'" alt=""/></a></li>';
		}
		if(nextorprev){
			var $ul=$('<ul></ul>');
			$ul.css({position:'absolute'}).html(htmls);
			if(nextorprev=="next"){
				$ul.insertAfter($extlist).css({left:'760px'}).animate({left:'-=760px'},400);
				$extlist.css({position:'absolute'}).animate({left:'-=760px'},400,function(){
					$extlist.remove();
				});
			}else{
				$ul.insertBefore($extlist).css({left:'-760px'}).animate({left:'+=760px'},400);
				$extlist.css({position:'absolute'}).animate({left:'+=760px'},400,function(){
					$extlist.remove();
				});
			}
		}else{
			$extlist.html(htmls);
		}
	},
    show:function (crx_id) {
		console.log('detailview.show..');
        DC.getExt(crx_id, function () {
            $(".dialog-bg").show();
			var model = new ExtModel();
            model.set(DC.extcache[crx_id]);
			var detailExtView=new DetailExtView({model:model});					
			DetailController.getInstance().el.find('.detail-ext-wrapper').empty().append(detailExtView.render().el);
			if(DetailController.getInstance().el.parents('body').length==0){
				DetailController.getInstance().el.appendTo('body');
			}
			setTimeout(function(){slides(detailExtView.el.find(".pagination li"),detailExtView.el.find(".slides"));},10);
			detailExtView.el.find('');
			
			DetailController.getInstance().update(crx_id);
			if(PATH._type!='detail'){
				dialog('.dialog01');
			}
        });
    },
    hide:function () {
        $(".dialog-bg").hide();
		this.el.hide();		
		$('#jqmContainer').hide();
        clearInterval(this.timehandler);        
    },
    updatesort:function (newsorttype) {   }
});

var PATH = {
    _type:"", _param:"", type:"", param:"", sorttype:"hot", _sorttype:"",_type2:'',_param2:'',
    update:function (type, para) {
        this._type = this.type;
        this._param = this.param;
		if(this._type&&this._type!='detail'&&type=="detail"){
			this._type2=this._type;
			this._param2=this._param;
		}
        if (this.type == type) {
            switch (this.type) {
                case "search":
                    this.resetnav('all')
                case "category":
                    if (para != this._param) {
                        controllers[this.type].getInstance().clear();
                    }
                    break;
                case "detail":
                    break;
            }
            if (this.param == this._param) {

            }
        } else {
            controllers[type].getInstance().clear();
        }
        this.type = type;
        this.param = para;
        switch (type) {
            case "search":
                this.resetnav('search');
                $("#header-search").find("h2").html('"' + htmlspecialchars(this.param) + '"的搜索结果<span></span>').end().show();
                $("#header-category").hide();
                if (this.param != this._param) {
                    SearchController.getInstance().clear();
                }
                SearchController.getInstance().el.appendTo("#app-container");
                CategoryController.getInstance().el.remove();
                CategoryController.getInstance().el.addClass("searchview");
                DetailController.getInstance().hide();
                SearchController.getInstance().update();
                break;
            case "detail":
                DetailController.getInstance().show(para);
                break;
            case "category":
                $("#header-search").hide();
                $("#header-category").show();
                SearchController.getInstance().el.remove();
                CategoryController.getInstance().el.removeClass("searchview").appendTo("#app-container");
                CategoryController.getInstance().param = this.param;
                CategoryController.getInstance().update();
                DetailController.getInstance().hide();
                break;
        }
    },
    updatesort:function (sorttype) {
        sorttype = ({"下载量":"download", "推荐度":"hot", "更新时间":"lastupdate"})[sorttype];
        if (this.sorttype == sorttype) {
            return;
        } else {
            this._sorttype = this.sorttype;
            this.sorttype = sorttype;
            controllers[this.type].getInstance().updatesort(sorttype);
        }
    },
    more:function (scrolltop, height) {
        switch (PATH.type) {
            case "search":
                SearchController.getInstance().more(scrolltop, height);
                break;
            case "category":
                CategoryController.getInstance().more(scrolltop, height)
                break;
        }
    },
    resetnav:function (type) {
        var navitem=$("#category-type td a,#category-type td div").removeClass("cur").parents('tr:first').find("a[type=" + (type || _ExtCate[0]['id']) + "],div[type="+(type || _ExtCate[0]['id'])+"]").addClass("cur");
		if(type=="search"){
			navitem.addClass('hover');
			$('.sort-list').hide();
			$('.search-tips').show().find('span').html(htmlspecialchars(this.param));
		}else{
			$('.sort-list').show();
			$('.search-tips').hide();
			$("#category-type td div").has('.search-box').removeClass('hover');
		}
		
    }
};

var CategoryController = {
    categoryview:null,
    initialize:function () {
        this.categoryview = new CategoryView();
		//this.categoryview.update();
    },
    getInstance:function (param) {
        if (!this.categoryview) {
            this.initialize(param);
        }
        return this.categoryview;
    },
    show:function () {
        this.getInstance().el.appendTo(".app-list-wrapper");
    },
    hide:function () {
        this.getInstance().el.remove();
    }
};
var SearchController = {
    searchview:null,
    initialize:function () {
        this.searchview = new SearchView();
    },
    getInstance:function (param) {
        if (!this.searchview) {
            this.initialize();
        }
        return this.searchview;
    },
    show:function () {
        this.getInstance().el.appendTo(".app-list-wrapper");
    },
    hide:function () {
        this.getInstance().el.remove();
    }
};
var DetailController = {
    detailview:null,
    initialize:function () {
        this.detailview = new DetailView({model:new ExtModel()});
    },
    getInstance:function () {
        if (!this.detailview) {
            this.detailview = new DetailView({model:new ExtModel()});
        }
        return this.detailview;
    },
    show:function (crx_id) {
        DC.getExt(crx_id, function () {
            $(".dialog-bg").show();
            DetailController.getInstance().model.set(DC.extcache[crx_id]);
            $("body").append(DetailController.getInstance().render().el);
        });
    },
    hide:function () {
        $(".dialog-bg").hide();
		$('#jqmContainer').hide();
        DetailController.getInstance().el.remove();
    }
};
var controllers = {
    "search":SearchController,
    "category":CategoryController,
    "detail":DetailController
}

$(function () {
    var tmp = _.template($("#template-category-type").html());
	//添加分类
	var ori=$("#category-type").children().detach();
    _.each(_ExtCate, function (cateobj, i) {
		var icon = i + 1;
		if (icon < 10) icon = '0' + icon.toString();
        $("#category-type").append(tmp({catename:CATENAMEMAP[cateobj['id']], catetype:cateobj['id'], icon:icon}));
    });
	$("#category-type").append(ori);

    var extrouter;
    //fix url#hash.within ie||chrome.
    var url = document.location.href;
    url = url.split("#");
    var hash = url[1] || "";
    url = url[0];
	var webroot="";
    var paths;
    if ($.browser.msie||typeof history.pushState=="undefined") {
        url = url.split(URLCONF['webroot']);
		webroot=url[0];
		url=url[1];
        paths = url.split("/");
        if (paths.length == 2) {
            document.location.href = webroot+URLCONF['webroot']+"home#" + url;
        } else {
        }
        extrouter = new ExtRouter();
        Backbone.history.start({ root:URLCONF['webroot']});
    } else {
		webroot=url.split(URLCONF['webroot'])[0];
        if (hash) {			
			document.location.href = webroot+URLCONF['webroot'] + hash;
        } else {
            extrouter = new ExtRouter();
			Backbone.history.start({pushState:true, root:URLCONF['webroot']});
        }
    }
    window.extrouter = extrouter;
    $("#category-type .cat").click(function (e) {
        var type = $(this).attr('type');
		if(type){
			extrouter.navigate("category/" + CATETYPEMAP[type], {trigger:true});
			PATH.resetnav(type);
			document.title = "扩展中心 - 360极速浏览器 - " + CATETYPEMAP[type];
			return false;
		}
    });
    $("#search-form").bind("submit", function (e) {
        var key = $(this).find("input[name=q]").val();
		if(key!=""){
			extrouter.navigate("search/" + key, {trigger:true});
		}else{
			alert('请输入搜索条件');
			$(this).find("input[name=q]").focus();
		}
        return false;
    });
	$('.sch-btn').click(function(e){
		$('#search-form').submit();
	
	});
	$(".sort-list a").click(function () {
        PATH.updatesort($(this).text());
		$(this).addClass('cur').siblings('a').removeClass('cur');
		return false;
    });
	
	$(document).bind("click",function(e){
		$(".select-list").hide();
	}).bind("mousewheel",function(e){
		$(".select-list").hide();
		if($(e.target).is("body")){
			var $target=$(".extend-list");
			if (e.originalEvent.wheelDelta > 0) {
				$target.scrollTop($target.scrollTop()-100);
			} else if (e.originalEvent.wheelDelta < 0) {
				$target.scrollTop($target.scrollTop()+100);
			}
			return;
		}
	}).bind("keydown",function(e){
		switch (e.keyCode) {
        case 27:
			$("#closed-btn").trigger("click");
            break;
        case 39:

            break;
    }});
	
    $(".dialog-bg").bind("click", function (e) {
        $("#closed-btn").trigger("click");
    });

    $("#closed-btn").live("click", function (e) {
        DetailController.getInstance().hide();
		var _type=PATH._type2||PATH._type,_param=PATH._param2||PATH._param;
		var type=PATH.type,param=PATH.param;
        if (_type == "search") {
            extrouter.navigate("" + (PATH._type || "search") + "/" + (_param || "all"));
			PATH._type=type;PATH._param=param;
			PATH.type=_type;PATH.param=_param;
        } else if (_type == "category") {
            extrouter.navigate("" + (PATH._type || "category") + "/" + (PATH._param || "all"));
			PATH._type=type;PATH._param=param;
			PATH.type=_type;PATH.param=_param;
        } else {
            extrouter.navigate("" + ("category") + "/" + ("all"), {trigger:true});
        }
        return false;
    });
    $(window).bind("scroll", function (e) {
        PATH.more($(this).scrollTop(), $(this).height());
    });
	
    var clientheight = document.documentElement.clientHeight;
    var $body = $(document.body);
    var $window = $(window);
	$('.footer').hide();
    function onwindowresize(e) {
        var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
        h = h < 550 ? 550 : h;
		if($('.sort-list').css('display')=="none"){
			h=h-182-100;
		}else{
			h=h-223-100;
		}			
		
        clientheight = h;
        $(".extend-list").css("height", h);        
    }
	if($.browser.mise&&$.browser.version<8){
		$("body").css("overflow","auto");
	}else{
	    $window.resize(onwindowresize);
		onwindowresize();
	}
    var Dialoghandler = {
        cates:function (e) {
			var $this = $(e);
			var $thisa = $this;//.find("a");
			var typename = $thisa.text();
			if(typename){
				extrouter.navigate("category/" + typename, {trigger:true});
				PATH.resetnav(CATEIDMAP[typename]);
				document.title = "扩展中心 - 360极速浏览器 - " + typename;
				return false;
			}           
        }
    };
    window.Dialoghandler = Dialoghandler;

// 让不支持placeholder的浏览器实现此属性
	function supports_input_placeholder(){
		var i = document.createElement("input");
		return "placeholder" in i;
	}

	var input_placeholder = $("input[placeholder],textarea[placeholder]");	
	if (input_placeholder.length !== 0 && !supports_input_placeholder()) {	
		var color_place = "#A9A9A9";			
		$.each(input_placeholder, function(i){
			var isUserEnter = 0; // 是否为用户输入内容,placeholder允许用户的输入和默认内容一样
			var ph = $(this).attr("placeholder");
			var curColor = $(this).css("color");			
			$(this).val(ph).css("color", color_place);		
			$(this).focus(function(){
				if ($(this).val() == ph && !isUserEnter) $(this).val("").css("color", curColor);
			}).blur(function(){
				if ($(this).val() == "") {
					$(this).val(ph).css("color", color_place);
					isUserEnter = 0;
				}
			}).keyup(function(){
				if ($(this).val() !== ph) isUserEnter = 1;
			});			
		});
	}
});

$('.change_user').click(function(e){
	$('.change_user').attr('href','/webstore/change_user?backurl=/webstore/detail/'+PATH.param);
});

var jqm={
	jqmHide:function(){$('#jqmContainer').hide()},
}
var jqmRes={
	jqmShow:function(){
		$('#jqmResult').show();
	},
	jqmHide:function(){
		$('#jqmResult').hide();
	}
}


function FriendsScroll (container, mover) {
    this.container = container;
    this.mover = mover;
    this.cursor = 0;
    this.unum = $('li', this.container).length;

    this.proxy = function (cb) {
        var that = this;
        return function (){
            return cb.apply (that, arguments);
        };
    };
    this.init = function (leftTriggle, rightTriggle, uwidth) {
        this.rTriggle = rightTriggle;
        this.lTriggle = leftTriggle;
        this.winWidth = 7 * uwidth;
        
        this.mover.css('width', Math.ceil(this.unum / 2) * uwidth);
        this.leftWidth = 0;
        this.rightWidth = Math.ceil(this.unum / 2) * uwidth - this.winWidth;

        this.rTriggle.bind('click', this.proxy(this.moveRight));
        this.lTriggle.bind('click', this.proxy(this.moveLeft));
    };
    this.moveLeft = function () {
        if (this.leftWidth <= 0) return;
        else {            
            if (this.leftWidth >= this.winWidth) {
                this.cursor -= this.winWidth;
                this.leftWidth -= this.winWidth;
                this.rightWidth += this.winWidth;
            } else {
                this.cursor -= this.leftWidth;
                this.rightWidth += this.leftWidth;
                this.leftWidth = 0;
            }
            this.mover.animate({left:'-'+this.cursor+'px'}, 1000);
        }
    };
    this.moveRight = function () {
        if (this.rightWidth <= 0) return ;
        else {
            if (this.rightWidth >= this.winWidth) {
                this.cursor += this.winWidth;
                this.rightWidth -= this.winWidth;
                this.leftWidth += this.winWidth;
            } else {
                this.cursor += this.rightWidth;
                this.leftWidth += this.rightWidth;
                this.rightWidth = 0;
            }
            this.mover.animate({left: '-'+this.cursor+'px'}, 1000);

        }
    }
}