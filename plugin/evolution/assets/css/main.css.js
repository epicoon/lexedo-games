//TODO некрасиво подключается файл
#lx:require @core/js/classes/css/CssContext;

var cssList = new lx.CssContext();

cssList.addClass('ev-highlight', {
	boxShadow: '0px 0px 10px 3px green'
});

return cssList.toString();
