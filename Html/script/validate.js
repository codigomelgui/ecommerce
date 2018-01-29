if (typeof Domestika == 'undefined') { throw 'Unable to load Domestika base object'; }

if (typeof Domestika.Form == 'undefined') {
  Domestika.Form = {};
}

Domestika.Form.Validate = function() {
  var U = Domestika.utils;

  var addFormRule = function(selector, validations) {
    U.on('form.form_validate', 'submit', function(e) {
      var fields, errors, stop = false;
      if(fields = U.query(selector, this)) {
        for (var i = fields.length - 1; i >= 0; i--) {
          errors = applyValidationsToField(validations, fields[i]);
          if (errors.length > 0) {
            markAsInvalid(fields[i], errors);
            stop = true;
          } else {
            markAsValid(fields[i]);
          }
        };

        if (stop) {
          U.stopEvent(e);
        }
      }
    });
  };

  var addRule = function(selector, events, validations) {
    addFormRule(selector, validations);
    U.on("form.form_validate " + selector, events, function() {
      var errors;
      errors = applyValidationsToField(validations, this);
      if (errors.length == 0) {
        markAsValid(this);
      } else {
        markAsInvalid(this, errors);
      }
    });
  };

  var applyValidationsToField = function(validations, field) {
    var errors = [];
    for (var i = validations.length - 1; i >= 0; i--) {
      try {
        validations[i](field); // Executing each validation
      } catch (e) {
        if (e.name != 'ValidationError') { // If it is not a ValidationError, let it go
          throw e;
        }
        errors.push(e.message);  // Store error messages so we can show them later
      }
    }; 
    return errors;
  };

  var markAsInvalid = function(field, messages) {
    switch(field.tagName.toUpperCase()) {
      case 'FIELDSET':
        U.addClass(field, 'form_invalid');
        U.removeClass(field, 'form_valid');    
        break;
      default:
        U.addClass(field.parentNode, 'form_invalid');
        U.removeClass(field.parentNode, 'form_valid');    
        break;
    }
    addMessagesToField(field, messages);
  };

  var addMessagesToField = function(field, messages) {
    var box = errorMessagesBoxForField(field);
   
    if (!box) {
      box = document.createElement('em');
      box.className = 'form_errors';
      switch(field.tagName.toUpperCase()) {
        case 'FIELDSET':
          field.appendChild(box);
          break;
        default:
          field.parentNode.appendChild(box);
          break;
      }
    }
    
    box.innerHTML = '';
    
    for (var i = messages.length - 1; i >= 0; i--){
      box.innerHTML += '<span>' + messages[i] + '</span>';
    };
  };

  var markAsValid = function(field) {
    switch(field.tagName.toUpperCase()) {
      case 'FIELDSET':
        U.addClass(field, 'form_valid');
        U.removeClass(field, 'form_invalid');    
        break;
      default:
        U.addClass(field.parentNode, 'form_valid');
        U.removeClass(field.parentNode, 'form_invalid');    
        break;
    }
    removeMessagesFromField(field);
  };

  var removeMessagesFromField = function(field) {
    var box = errorMessagesBoxForField(field);

    if (box) {
      box.parentNode.removeChild(box);
    }
  };

  var errorMessagesBoxForField = function(field) {
    var box;
    switch(field.tagName.toUpperCase()) {
      case 'FIELDSET':
        box = U.query('em.form_errors', field, true);
        break;
      default:
        box = U.query('em.form_errors', field.parentNode, true);
        break;
    }
    return box;
  };

  var valueForField = function(field) {
    switch(field.tagName.toUpperCase()) {
      case 'FIELDSET':
        var checkedRadio = U.query('input[type=radio]:checked', field, true);
        if (checkedRadio) {
          return checkedRadio.value;
        } else {
          return '';
        }
      default:
        return field.value || '';
    }
  };
  
  var valueForFieldset = function(field) {
    var checkedRadio = U.query('input[type=radio]:checked', field, true);
    if (checkedRadio) {
      return checkedRadio.value;
    } else {
      return '';
    }
  };

  var init = function() {    
    addRule('label.form_validate_email input', 'keyup', Domestika.Form.Validate.Format({'with': /^[a-z0-9_\.-]+@[a-z0-9_\.-]+\.[a-z]{2,5}$/i}));
    addRule('.form_required input[type=checkbox]', 'change', Domestika.Form.Validate.Acceptance());
    addRule('label.form_required input', 'keyup', Domestika.Form.Validate.Presence());
    addRule('label.form_validate_integer input', 'keyup', Domestika.Form.Validate.Numericality({onlyInteger: true}));
    addFormRule('fieldset.form_required', Domestika.Form.Validate.Presence());
  };

  U.ready(init);

  return {
    addRule: addRule,
    addFormRule: addFormRule,
    valueForFieldset: valueForFieldset
  };
}();

/**
A hash with messages. You can override these by creating your very own
Domestika.Form.Validate.CustomMessages object.
*/
Domestika.Form.Validate.Messages = {
  too_long:  "{i18n:validation.too_long}",
  too_short: "{i18n:validation.too_short}",
  wrong_length: "{i18n:validation.wrong_length}",
  not_included: "{i18n:validation.not_included}",
  is_invalid: "{i18n:validation.is_invalid}",
  missing: "{i18n:validation.missing}",
  not_a_number: "{i18n:validation.not_a_number}",
  not_an_integer: "{i18n:validation.not_an_integer}",
  too_low: "{i18n:validation.too_low}",
  too_high: "{i18n:validation.too_high}",
  unaccepted: "{i18n:validation.unaccepted}"
};

/**
Custom Error type for wrong validations.
@param message {string} a key name of Messages or CustomMessages
@paran replacements {object} a hash of replacements to do on the message
*/
Domestika.Form.Validate.Error = function(message, replacements) {
  this.name = "ValidationError";
  this.message = Domestika.Form.Validate.CustomMessages &&
                 Domestika.Form.Validate.CustomMessages[message] ||
                 Domestika.Form.Validate.Messages[message];

  if (replacements) {
    for (r in replacements) {
      this.message = this.message.replace(new RegExp("\{" + r + "\}"), replacements[r]);
    }
  }
};

/**
Validates the presence of a field
*/
Domestika.Form.Validate.Presence = function() {
  return [function(input) {
    var value;
    if (input.tagName.toUpperCase() == 'FIELDSET') {
      value = Domestika.Form.Validate.valueForFieldset(input);
    } else {
      value = input.value;
    }
    if(String(value) === '') {
      throw new Domestika.Form.Validate.Error('missing');
    }
  }];
};

/**
Validates the status of a checkbox field
*/
Domestika.Form.Validate.Acceptance = function() {
  return [function(input) {
    if (!input.checked) {
      throw new Domestika.Form.Validate.Error('unaccepted');
    }
  }];
};

/**
Validates the inclusion of the value on a list of values

"in" option must be specified. And it must be an Array
*/
Domestika.Form.Validate.Inclusion = function(options) {
  if (options['in']) {
    if (options['in'] instanceof Array) {
      return [function(input) {
        for (var i = options['in'].length - 1; i >= 0; i--){
          if (options['in'][i] == input.value) {
            return;
          }
        }
        throw new Domestika.Form.Validate.Error('not_included');
      }];
    } else {
      throw new TypeError('"in" option must be an Array');
    }
  } else {
    throw 'You should specify an "in" option';
  }
};

/**
Validation that accepts the following options:

is: The exact length the value should have
within: a range (Array) with two elements, being the first one a minimum, and the second one the maximum length.
maximum: the maximum length of the value
minimum: the minimum length of the value

@param options {object}
*/
Domestika.Form.Validate.Length = function(options) {
  if (options.is) {
    if (typeof options.is != 'number') {
      throw new TypeError('Expected "is" option to be a number');
    }
    return [function(input) {
      if(input.value.length != options.is) {
        throw new Domestika.Form.Validate.Error('wrong_length', {is: options.is});
      }
    }];
  }

  if (options.within) {
    if (typeof options.within[0] == 'number' && typeof options.within[1] == 'number') {
      return [function(input) {
        if (input.value.length < options.within[0]) {
          throw new Domestika.Form.Validate.Error('too_short', {minimum: options.within[0]});
        } else if(input.value.length > options.within[1]) {
          throw new Domestika.Form.Validate.Error('too_long', {maximum: options.within[1]});
        }
      }];
    } else {
      throw new TypeError('Expected "within" option to be an array with two numbers');
    }
  }

  if (options.maximum) {
    if (typeof options.maximum != 'number') {
      throw new TypeError('Expected "maximum" option to be a number');
    }
    return [function(input) {
      if(input.value.length > options.maximum) {
        throw new Domestika.Form.Validate.Error('too_long', {maximum: options.maximum});
      }
    }];
  }

  if (options.minimum) {
    if (typeof options.minimum != 'number') {
      throw new TypeError('Expected "minimum" option to be a number');
    }
    return [function(input) {
      if(input.value.length < options.minimum) {
        throw new Domestika.Form.Validate.Error('too_short', {minimum: options.minimum});
      }
    }];
  }
  throw 'You should specify one of "is", "within", "maximum" or "minimum" options';
};

/**
Tests the value against a Regular expression specified in options['with']
*/
Domestika.Form.Validate.Format = function(options) {
  if (!options['with']) {
    throw 'You must provide a "with" option';
  }
  if (!options['with'] instanceof RegExp) {
    throw new TypeError('Expected "with" to be a Regular Expression');
  }

  return [function(input) {
    if (!options['with'].test(input.value)) {
      throw new Domestika.Form.Validate.Error('is_invalid');
    }
  }];
};

/**
Validates numeric values with the following options:

minimum: minimum value of the number
maximum: maximum value of the number
onlyInteger: only accepts integers
if no options are passed, it just checks if the value is a number

*/
Domestika.Form.Validate.Numericality = function(options) {
  var validations = [];
  validations.push(
    function(input) {
      if (input.value != '' && !isFinite(Number(input.value))) {
        throw new Domestika.Form.Validate.Error('not_a_number');
      }
    }
  );
  
  if (options && options.onlyInteger) {
    validations.push(
      function(input) {
        if (input.value != '' && input.value != parseInt(input.value)) {
          throw new Domestika.Form.Validate.Error('not_an_integer');
        }
      }
    );
  }
  
  if (options && options.maximum) {
    if (typeof options.maximum != 'number') {
      throw new TypeError('Expected "maximum" option to be a number');
    }
    validations.push(
      function(input) {
        if (input.value != '' && input.value > options.maximum) {
          throw new Domestika.Form.Validate.Error('too_high', {maximum: options.maximum});
        }
      }
    );
  }
  
  if (options && options.minimum) {
    if (typeof options.minimum != 'number') {
      throw new TypeError('Expected "minimum" option to be a number');
    }
    validations.push(
      function(input) {
        if (input.value != '' && input.value < options.minimum) {
          throw new Domestika.Form.Validate.Error('too_low', {minimum: options.minimum});
        }
      }
    );
  }
  return validations;
};
