$(document).ready(function() {
  var medium_image_placeholder = $('#medium_image');
  
  function mediumImageFromSmallOne(small_image) {
    var a   = $('<a></a>');
    var img = $('<img>');
    var links = linksForImages(small_image);
    img.load(function() {
      moveImage(a);
    });
    img.attr('src', links.medium);
    a.attr('class', 'thickbox-rel');
    a.attr('rel', links.large);
    a.append(img);
  }

  function moveImage(a) {
    medium_image_placeholder.html(a);
    tb_init(a);
  }
  
  function linksForImages(small_image) {
    var large  = small_image.next('div.large_image_link').find('a:first');
    var medium = small_image.find('a:first');
    return {large: large.attr('href'), medium: medium.attr('href')};
  }

  $('div.large_image_link').hide();
  
  $('div.small_image').click(function(event) {
    event.preventDefault();
    mediumImageFromSmallOne($(this));
  });
});