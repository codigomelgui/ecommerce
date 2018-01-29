Domestika.Base = {};

Domestika.Base.DummyText = function() {
  U = Domestika.utils;
  
  function dummyTextRestore(e) {
    var dummyText = this.getAttribute('dummyText');
    if (dummyText && this.value === '') {
      this.value = dummyText;
    }
  }
  
  function dummyTextClean(e) {
    if (!this.getAttribute('dummyText')) {
      this.setAttribute('dummyText', this.value);      
    } if (this.value == this.getAttribute('dummyText')) {
      this.value = ''; 
    }
  }
  
  function formDummyTextsClean(e) {
    var inputs = U.query("input.dummy_text[type=text], textarea.dummy_text", this);
    for (var i = inputs.length - 1; i >= 0; i--){
      dummyTextClean.call(inputs[i]);
    };
  }
  
  function init() {
    U.on(document.getElementsByTagName('form'), 'submit', formDummyTextsClean);
    U.on("input.dummy_text[type=text], textarea.dummy_text", 'focus', dummyTextClean);
    U.on("input.dummy_text[type=text], textarea.dummy_text", 'blur', dummyTextRestore);    
  }
  
  U.ready(init);
}();
