core.provide('ui.Data');
ui.Data = core.Class(function(user,rank,userRank) {
	this.$user = $(user);
	this.$rank = $(rank);
	this.$urank = $(userRank);
	$(this).on('ajax:user',this.renderUser);
	$(this).on('ajax:rank',this.renderRank);
}, false, {
	ajax: function(types) {
		types = types.join(',').toLowerCase();
		var self = this;
		$.get('/fetch/fetch?types='+types,function(json) {
			if(json['error']) {

			}else{
				delete json['error'];
				for(var name in json) {
					$(self).trigger('ajax:'+name,[ json[name] ]);
				}
			}
		},'json');
	},
	renderUser: function(e, user) {
		// 顶部用户头像
		if( window.user.imgFlag ) { // 默认头像

		}else{
			$('img',this.$user).attr('src', window.user.imgUrl);
		}
		// 顶部用户信息
		var grade = new ui.Grade({grade: user.grade,number: true});
		grade.render( $('.grade span',this.$user) );
		$('.expr span',this.$user).text( user.exp + ' ( 距离下一等级还差 '+(user.max_exp-user.exp)+'经验 )' );
		$('.sign span',this.$user).html( '<b>'+user.lasts_day+'</b> 天' );
		$('.time span',this.$user).text( ui.Data.timeRange(user.online_time) );
		$('.total span',this.$user).text( ui.Data.timeRange(user.total_online_time) );
		// 右侧用户排行信息
		if(user.rank>1000000) {
			$('.current',this.$userRank).html('您当前排名 <span>大于100万</span>');
			$('.compare',this.$userRank).text('加油啦！');
		}else{
			$('.current',this.$userRank).html('您当前排名 <span>'+user.rank+'</span>');
			$('.compare',this.$userRank).html(this._renderCompare(user.rank,user.last_rank));
		}
	},
	_renderCompare: function(r,l) {
		if(r - l === 0) {
            return '较昨日排名未发生变化';
        }else if(r - l < 0){
            return '较昨日上涨了 <span>'+(l - r)+'</span> 名';
        }else{
            return '较昨日下降了 <span>'+(r - l)+'</span> 名';
        }
	},
	renderRank: function(e, rank) {
		for(var i=0;i<rank.length;++i) {
            var tr;
			if( rank[i].qid == window.user.qid ) { // 当前用户
				tr = '<tr class="rank-self">';
			}else if(i<3) { // 前三名
				tr = '<tr class="rank-top">';
			}else {
				tr = '<tr>';
			}
			tr += '<td><em class="ui-rank">'+(i+1)+'</em></td>';
			tr += '<td>'+ (new ui.Grade({grade: rank[i].grade}).render(true))+'</td>';
			tr += '<td>'+ rank[i].username +'</td>';
			this.$rank.append( tr );
		}
		ui.Grade.fixWidth( this.$rank );
	}
});


ui.Data.timeRange = function(m) {
	var y = parseInt( m / 365 / 24 / 60 );
	m = m % ( 365 * 24 * 60 );
	var d = parseInt( m / 24 / 60 );
	m = m % ( 24 * 60 );
	var h = parseInt( m / 60 );
	m = m % 60;
	var r = '';
	if( y ) {
		r += y + ' 年 ';
	}
	if( d ) {
		r += d + ' 天 ';
	}
	if( h ) {
		r += h + ' 小时 ';
	}
	if( m ) {
		r += m + ' 分 ';
	}
	return r;
};