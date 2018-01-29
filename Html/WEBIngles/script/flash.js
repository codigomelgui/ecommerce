$(document).ready(function() {  
  $('div.video').each(function(index, div) {
    var span = $('span', div);
    var a   = $('a', span);     
    var img = $('img', a);     
    swfobject.embedSWF(a.attr('href'), span.attr('id'), $(div).width(), $(div).width() * img.attr('height') / img.attr('width'), '7.0.0', '', null, {wmode: 'transparent'});
  });
});

