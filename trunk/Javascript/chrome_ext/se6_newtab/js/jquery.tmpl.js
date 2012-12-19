(function( jQuery, undefined ){
  jQuery.extend({
    tmpl: function( tmpl, data, options, parentItem ) {
		var result = tmpl.replace(/\$\{(\w+)\}/g, function($0, $1){
			return data[$1];
		});
		return jQuery(result);
    }
	
});
  
})( jQuery );
