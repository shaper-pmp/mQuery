
var mQuery = function () {


	var test_div;
	var style;
	var debug=false;

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
		//valid_operators: [',', 'or', 'not', 'and', 'only', '=', '>', '<', '>=', '<=', '(', ')'],
		valid_operators: ['(', ')', '*', '/', '+', '-'],
		operator_precedence: {
			'(': 1,
			')': 1,
			'*': 2,
			'/': 2,
			'+': 3,
			'-': 3,
		},
		tokens: [],
		tree: null,
		
		query: function(query, debug) {
			this.debug = debug || false;
			this.i = 0;
			this.tokens = [];
			this.tree = null;

			do {
				var token = this.getNextToken(query, this.i, this.valid_operators);
				//console.log(token);
				if(token != null && token != 'only') {	// Strip out "only"s, as they're only there to hide the rule from non-CSS3 browsers
					this.tokens.push(token.token);
					this.i += token.end;
				}
			}
			while (token != null);
			
			this.tree = this.buildTree(this.tree, this.tokens);
			if(this.tree) {
				document.getElementById("mq_result").innerHTML += this.parseTree(this.tree);
			}
			
			//console.log(this.tree);
		},
		
		buildTree: function (root, tokens, depth) {
			depth = depth || 0;
			while(token = tokens.shift()) {
				var newitem = this.makeASTNode(token);
				
				//console.log(newitem.value);
				//if(!confirm(token)) break;
				
				if(root == null) {
					if(newitem.type == 'value' || newitem.value == 'not') {	// Start empty trees with a leaf/unary operator
						root = newitem;
					}
					else if(newitem.value == '(') {
						var temp = null;
						// Recursing for LHS
						root = this.buildTree(temp, tokens, depth+1);
						root.bracketed = true;
					}
					else {
						console.log("Error!  Can't start expression with "+newitem.type+" '"+newitem.value+"'");
					}
				}
				else if(root.type == "value") {
					if(newitem.value == ")") {
						// Returning from LHS
						return root;
					}
					else if(newitem.type == "operator") {
						newitem.leftchild = root;	root.parent = newitem;
						root = newitem;
					}
					else {
						console.log("Error!  value '"+newitem.value+"' can't follow value '"+root.value+"'");
					}
				}
				else {	//  if(root.type == "operator")
					if(newitem.type == "value") {	// Even unary NOTs will have their (single) child as their right child, for convenience
						root.rightchild = newitem;
						if(root.parent != null) {
							root = root.parent;	// Pop back up from where we moved down a level (below)
						}
					}
					else { 	// if(newitem.type == "operator")
					
						if(newitem.value == "(") {
							var temp = null;
							// Recursing for RHS
							root.rightchild = this.buildTree(temp, tokens, depth+1);
							root.rightchild.bracketed = true;
						}
						else if(newitem.value == ")") {
							// Returning from RHS
							return root;
						}
						
						else if(this.operator_precedence[newitem.value] >= this.operator_precedence[root.value] || root.bracketed) {
							newitem.leftchild = root;	root.parent = newitem;
							root = newitem;	// Move down one level until we hit the next value
						}
						else {
							console.log(newitem.value);
							newitem.leftchild = root.rightchild;	root.rightchild.parent = newitem;
							root.rightchild = newitem;	newitem.parent = root;
							root = newitem;	// Move down one level until we hit the next value
						}
					}
				}
				
				if(this.debug) {
					this.outputTree(root, depth);
				}

			}
			return root;
		},
		
		parseTree: function(root) {
		
			if(root.type == 'value') {
				return root.value;
			}
		
			var leftval = Number(this.parseTree(root.leftchild));
			var rightval =  Number(this.parseTree(root.rightchild));
			
			switch(root.value) {
				case '*': 
					return leftval * rightval;
				case '/': 
					return leftval / rightval;
				case '+': 
					return leftval + rightval;
				case '-':
					return leftval - rightval;
			}
		},
		
		makeASTNode: function (token) {
			return {
				"type": this.arrayContains(this.valid_operators, token) === false ? 'value': 'operator',
				"value": token,
				'leftchild': null,
				'rightchild': null,
				'parent' : null,
				'bracketed': false
			};
		},
		
		outputTree: function(root, recursiondepth) {
			var dbg = document.createElement("div");
			dbg.style.marginBottom = "1em";
			dbg.style.clear = "both";

			var top = dbg;
			while(recursiondepth > 0) {
				var rec = document.createElement("div");
				rec.className = "recurse";
				rec.appendChild(top);
				top = rec;
				recursiondepth--;
			}
			document.getElementById("mq_result").appendChild(top);
			dbg.innerHTML = this.renderTree(root)+'<hr />';
		},
		
		renderTree: function(root) {
			var output = '';
			if(root == null) {
				output = '';
			}
			else if(root.type == "value") {
				output = '<div class="container"><div class="parent">'+root.value+'</div></div>';
			}
			else {
				output = '<div class="container"><div class="parent">'+root.value+'</div>';
				output += '<div class="child">'+this.renderTree(root.leftchild)+'</div>';
				output += '<div class="child">'+this.renderTree(root.rightchild)+'</div></div>';
			}
			
			
			return output;
		},
		
		getNextToken: function(raw_string, start, tokens) {
			var token = '';
			
			re_escaped_tokens = [];
			for(var i in tokens) {
				re_escaped_tokens[i] = this.regexpEscape(tokens[i]);
			}
			
			var padding = 0;
			
			while(start+padding<raw_string.length && raw_string[start+padding] == ' ') {
				padding++;
			}
			
			if(possible = raw_string.substr(start+padding).match(RegExp("^(?:"+re_escaped_tokens.join("|")+")"))) {
				return {
					'token': possible[0],
					'end': possible[0].length+padding
				};
			}
				
			for(var i=0; i+start<raw_string.length; i++) {
				var c = raw_string[i+start+padding];
				if((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_'/* || c == '-'*/) {	// Temporarily disabled "-" while working out the expression parser
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
		},
		
		regexpEscape: function (text) {
			var specials = [
				'/', '.', '*', '+', '?', '|',
				'(', ')', '[', ']', '{', '}', '\\'
			];
			var re = new RegExp('(\\'+specials.join('|\\')+')', 'g');
			return text.replace(re, '\\$1');
		},
		
		arrayContains: function (arr, obj) {
			for(var i=0; i<arr.length; i++) {
				if (arr[i] == obj) return i;
			}
			return false;
		}
	};
}();
	