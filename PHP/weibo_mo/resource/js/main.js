$(function() {
	$(':text[name=send_time]').datepicker();

	$('.close').click(function(){
		$(this).parent().slideUp();
	});
	
	$(':checkbox[name=time]').click(function(){
		var p = $(this).parent();
		p.next().attr('disabled', !this.checked);
		p.siblings(':submit').attr('value', (this.checked ? '定时' : '') + '发送');
	});
	
	function cb_color () {
		var color;
		if (this.disabled)	color = '#888';
		else	color = this.checked ? '#090':'inherit';
		$(this).parent().css('color', color);
	}
	$(':checkbox.cb').each(cb_color).change(cb_color);
	
	$('.check_all').click(function(){
		$(this).parents('fieldset:first').find(':checkbox[disabled!=true]').not(this).each(function(){
			this.checked = !this.checked;
			$(this).trigger('change');
		});
	});
		
	var frm_weibo = $('#frm_weibo');
	if (frm_weibo.length > 0) {
        function calcWord(textarea) {
			var text = textarea.val();
            var icl = 140 - count(text);
            frm_weibo.find('.calcword').html(icl >= 0 ? '还可以输入<em>' + icl + '</em>字' : '已超出<em style="color:#DA0000">' + (-icl) + '</em>字');
			frm_weibo.find(':submit').attr('disabled', icl < 0);
        }
		function bLength(str) {
			return str.replace(/[^\x00-\xff]/g, '..').length
		}
		function count(b) {
			var c = 41,
			d = 140,
			e = 20,
			f = b,
			g = b.match(/(http|https):\/\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+([-A-Z0-9a-z_\$\.\+\!\*\(\)\/\,\:;@&=\?~#%]*)*/gi) || [],
			h = 0;
			for (var i = 0,
			j = g.length; i < j; i++) {
				var k = bLength(g[i]);
				if (/^(http:\/\/t.cn)/.test(g[i])) continue;
				/^(http:\/\/)+(t.sina.com.cn|t.sina.cn)/.test(g[i]) || /^(http:\/\/)+(weibo.com|weibo.cn)/.test(g[i]) ? h += k <= c ? k: k <= d ? e: k - d + e: h += k <= d ? e: k - d + e;
				f = f.replace(g[i], "")
			}
			var l = Math.ceil((h + bLength(f)) / 2);
			return l
		}
		
        var textarea = frm_weibo.find('textarea');
        textarea.focus();
        calcWord(textarea);
        textarea.bind('keyup', function () { return calcWord(textarea) });
        textarea.bind('focus', function () { return calcWord(textarea) });
        textarea.bind('blur', function () { return calcWord(textarea) });
        frm_weibo.submit(function () {
		});
	}
});
