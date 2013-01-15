/**
 * PlaceHolder
 *
 * @version: 1.0
 * @mail: lichao3@360.cn
 */
var PlaceHolder = {
    _support: (function() {
        return '_placeholder' in document.createElement('input');
    })(),
 
    className: 'input-txt-place',
 
    init: function() {
        if (!PlaceHolder._support) {
            var inputs = document.getElementsByTagName('input');
            PlaceHolder.create(inputs);
        }
    },
 
    create: function(inputs) {
        var input;
        if (!inputs.length) {
            inputs = [inputs];
        }
        for (var i = 0, length = inputs.length; i <length; i++) {
            input = inputs[i];
            if (!PlaceHolder._support && input.attributes && input.attributes._placeholder) {
                PlaceHolder._setValue(input);
                input.addEventListener('focus', function(e) {
                    if (this.value === this.attributes._placeholder.nodeValue) {
                        this.value = '';
                        this.classList.remove(PlaceHolder.className);
                    }
                }, false);
                input.addEventListener('blur', function(e) {
                    if (this.value === '') {
                        PlaceHolder._setValue(this);
                    }
                }, false);
            }
        }
    },
 
    _setValue: function(input) {
		if (input.attributes._placeholder) {
			$(input).val(input.attributes._placeholder.nodeValue);
			input.classList.add(PlaceHolder.className);
		}
    }
};
