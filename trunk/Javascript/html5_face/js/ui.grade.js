core.provide('ui.Grade');
ui.Grade = core.class(function(options) {
	this.init(options);
}, false, {
	init: function(options) {
		this._options = {
			grade: 1,
			number: false
		};
		core.merge(this._options, options);
		this._options._grade = this._parse_grade(this._options.grade);
	},
	_parse_grade: function(grade) {
		grade = grade.toString(4);
		while (grade.length < 3) {
			grade = '0' + grade;
		}
		return grade;
	},
	render: function(target) {
		if(target === true) {
			return this._render();
		}else if( $(target).length > 0 ) {
			$(target).html( this._render() );
		}else{
			document.write( this._render() );
		}
	},
	_render: function() {
		var html = '<em class="ui-grade">';
		if(this._options.number) {
			html += '<span>' + this._options.grade + '</span> ';
		}
		for(var i=0;i<this._options._grade.length;++i){
			for(var j=parseInt(this._options._grade.charAt(i));j>0;--j) {
				 html += '<i class="ui-grade-'+i+'"></i>';
			}
		}
		html += '</em>';
		return html;
	}
});
ui.Grade.fixWidth = function(ctr) {
	var max_width = 0;
	$(ctr).find('.ui-grade').each(function() {
		if(max_width < $(this).width()) {
			max_width = $(this).width();
		}
	});
	$(ctr).find('.ui-grade').css('width',max_width);
};