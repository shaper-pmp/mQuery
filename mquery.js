var mQuery = function () {

	var test_div;
	var style;

	return {
		mediaTypesTestId: "mQuery-types-test",
		mediaTypesAll: ['all', 'aural', 'braille', 'embossed', 'handheld', 'print', 'projection', 'screen', 'speech', 'tty', 'tv'],
		mediaTypesTests: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-right-width', 'border-bottom-width'],
		mediaTypes: [],
		
		init: function () {
			this.doTests();
			this.getResults();
			this.cleanUp();
		},
		
		doTests: function() {
			test_div = document.createElement('div');
			test_div.innerHTML = "Test";
			test_div.id = this.mediaTypesTestId;
			
			style = document.createElement('style');
			style.type = "text/css";
			
			var reset = "#mQuery-types-test { display: none !important;}\n";
			var styles = "";
			for(var i=0; i<this.mediaTypesAll.length; i++) {
				reset += "#mQuery-types-test { "+this.mediaTypesTests[i]+": 0px !important;}\n";
				styles += "@media "+this.mediaTypesAll[i]+" { #mQuery-types-test { "+this.mediaTypesTests[i]+": 1px !important;} }\n";
			}

			if(style.styleSheet) {
				style.styleSheet.cssText = reset+styles;
			}
			else {
				var rules = document.createTextNode(reset+styles);
				style.appendChild(rules);
			}
			document.getElementsByTagName("head")[0].appendChild(style);
			document.body.appendChild(test_div);
		},
		getResults: function () {
			if(!test_div) {
				return false;
			}
			this.mediaTypes = [];
			for(var i=0; i<this.mediaTypesTests.length; i++) {
				var value = null;
				if(typeof document.defaultView == "undefined") {
					var iename = this.mediaTypesTests[i];
					var matches = iename.match(/\-([a-z])/gi);
					for(var j=0; j<matches.length; j++) {
						iename = iename.replace(matches[j], matches[j].toUpperCase());	// a global regexp in IE apparently ignores backreferences and only reports full-pattern results.  Gaaaah!
					}
					iename = iename.replace(/\-/g, "");
					value = test_div.currentStyle[iename];	
				}
				else {
					value = document.defaultView.getComputedStyle(test_div, null).getPropertyValue(this.mediaTypesTests[i]);
				}
				if(value == "1px") {
					this.mediaTypes.push(this.mediaTypesAll[i]);
				}
			}
		},
		cleanUp: function () {
			document.body.removeChild(test_div);
			test_div = null;
			document.getElementsByTagName("head")[0].removeChild(style);
			style = null;
		},
		
		i: 0,
		valid_tokens: ['\\,', 'and', 'or', 'not', '=', '\\>', '\\<', '\\>=', '\\<=', '\\(', '\\)'],
		tokens: [],
		
		query: function(query) {
			this.i = 0;
			this.tokens = [];
			/*var token = this.getNextToken(query, this.i, this.valid_tokens);
			console.log(token);
			if(token) {
				this.i += token.end;
			}*/
			do {
				var token = this.getNextToken(query, this.i, this.valid_tokens);
				if(token != null) {
					this.tokens.push(token.token);
					this.i += token.end;
				}
			}
			while (token != null);
		},
		
		getNextToken: function(raw_string, start, tokens) {
			var token = '';
			
			var padding = 0;
			
			while(start+padding<raw_string.length && raw_string[start+padding] == ' ') {
				padding++;
			}
			
			if(possible = raw_string.substr(start+padding).match(RegExp("^(?:"+tokens.join("|")+")"))) {
				return {
					'token': possible[0],
					'end': possible[0].length+padding
				};
			}
				
			for(var i=0; i+start<raw_string.length; i++) {
				var c = raw_string[i+start+padding];
				if((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_') {
					// else we haven't found the start of the token yet, so skip this character
					token += c;
				}
				else {
					if(token != '') {	// Hit a break after finding a token
						return {
							'token': token,
							'end': i+padding
						};
					}
				}
				
			}
			if(token != '') {	// Hit a end of string after finding a token
				return {
					'token': token,
					'end': i+padding
				};
			}
			
			return null;
		}
	};
}();
	