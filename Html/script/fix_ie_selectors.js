if (!Domestika || typeof Domestika != 'object') { throw new Error('Expected an existent Domestika object'); }
if (!Domestika.utils || typeof Domestika.utils != 'object') { throw new Error('Unable to load Domestika adapter'); }

(function() {
  var U = Domestika.utils;
  var newStyleSheet;
  var ieVersion = getInternetExplorerVersion();

  function init() {
    var stylesheets = document.styleSheets;
    newStyleSheet = document.createStyleSheet();
    for (var i=0; i < stylesheets.length; i++) {
      if (stylesheets[i].owningElement && stylesheets[i].owningElement.tagName == "STYLE" ) {
        for (var j=0; j < stylesheets[i].imports.length; j++) {
          U.httpget(stylesheets[i].imports[j].href, parseStyleSheet);	
        };
      }
      if(stylesheets[i].href) {
				U.httpget(stylesheets[i].href, parseStyleSheet);	
			} else {
				parseStyleSheet(stylesheets[i].innerHTML);
			}
    };
  }
  
  function parseStyleSheet(cssText) {
    if (!cssText) {
      return;
    }	
		var cssText = cssText.replace(/[\s\r\n\t]+/g,' '); // Remove extra spaces, tab or carriage returns
    cssText = cssText.replace(/\/\*\*?[^\*]*?\*\//g, ''); // Remove comments
		if (!cssText) {
		  return;
		}
		var rules = cssText.split("}");

    for (var i=0; i < rules.length; i++) {
		  if (rules[i] != '') {
		    parseRule(rules[i] + '}');
		  }
		};
  }
  
  function parseRule(rule) {
    var rule = splitRule(rule);
    if (rule === false) {
      return;
    }
    for (var i=0; i < rule.selectors.length; i++) {
  		if(ieVersion < 7 && (/:hover/).test(rule.selectors[i])) {
  			var selector = rule.selectors[i].replace(/:hover.*$/, '');
  			var subjects = U.query(selector);
  			for (var j=0; j < subjects.length; j++) {
  			  if(subjects[j].tagName == 'A') {
  			    continue;
  			  }
  			  U.on(subjects[j], 'mouseenter', function() { U.addClass(this, 'hover'); });
      	  U.on(subjects[j], 'mouseleave', function() { U.removeClass(this, 'hover'); });
  			};
  			newStyleSheet.addRule(selector + "." + 'hover', rule.style);
  		} else if ((/:last-child/.test(rule.selectors[i])) ||
          (/=/).test(rule.selectors[i]) ||
          (ieVersion < 7 && (/:first-child/).test(rule.selectors[i]))) {

        var newClassName = randomClassName();
        if (!(/=/).test(rule.selectors[i])) {      
          var selector = rule.selectors[i].replace(/:(first-child|last-child)/g, '').replace(/\s*$/, "") + "." + newClassName;
        } else {
          var selector = "." + newClassName;
        }
        
        var subjects = U.query(rule.selectors[i]);
  			for (var j=0; j < subjects.length; j++) {
          U.addClass(subjects[j], newClassName);
        };
        newStyleSheet.addRule(selector, rule.style);
      }      
    };
  }
  
  function splitRule(rule) {
    var selectors = rule.replace(/\{.*/, '').split(',');
    var style = rule.replace(/[^\{]+\{([^\}]+)\}.*/i, '$1');
    if (!style) {
      return false;
    }
    return {selectors: selectors, style: style};
  }
  
  function randomClassName() {
  	var chars = "abcdefghiklmnopqrstuvwxyz";
  	var randomstring = '';
  	for (var i=0; i<8; i++) {
  		var rnum = Math.floor(Math.random() * chars.length);
  		randomstring += chars.substring(rnum,rnum+1);
  	}
  	return randomstring;
  }
  
  function getInternetExplorerVersion()
  // Returns the version of Internet Explorer or a -1
  // (indicating the use of another browser).
  {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
      var ua = navigator.userAgent;
      var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
      }
    }
    return rv;
  }  
  
  if (ieVersion >= 5.0) {
    U.ready(init);
  }
})();