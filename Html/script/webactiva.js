$(document).ready(function(){
	var print_li = $('li.utilities_print');
	var new_html = '<a href="javascript:window.print();">'+print_li.html()+'</a>';
	print_li.html(new_html);
});
