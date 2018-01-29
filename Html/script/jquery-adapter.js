if (!jQuery || typeof jQuery != 'function') { throw new Error('Expected an existent jQuery function'); }

Domestika = {};

Domestika.utils = {
  query: function(selector, scope, first) {
    if (first) {
      return jQuery(selector, scope).get(0);
    } else {
      return jQuery(selector, scope).get();
    }
  },
  
  test: function(node, selector) {
    return jQuery(node).is(selector);
  },

  get: function(id) {
    return jQuery('#' + id).get(0);
  },

  ready: function(fn) {
    jQuery(document).ready(fn);
  },

  stopEvent: function(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
    
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
  },
  on: function(selector, events, fn) {
    jQuery(selector).bind(events, fn);
  },

  hasClass: function(el, className) {    
    return jQuery(el).hasClass(className);
  },
  
  addClass: function(el, className) {
    jQuery(el).addClass(className);
  },
  
  removeClass: function(el, className) {
    jQuery(el).removeClass(className);
  },
  
  getAncestorBySelector: function(el, selector) {
    return jQuery(el).parents(selector)[0];
  },
  
  httpget: function(url, callback, data) {
    jQuery.get(url, data, callback);
  }
};
