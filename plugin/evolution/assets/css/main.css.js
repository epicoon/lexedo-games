//TODO некрасиво подключается файл
#lx:require @core/js/classes/css/CssContext;

var cssList = new lx.CssContext();

cssList.addClass('ev-cart', {
	borderRadius: '10px',
	boxShadow: '3px 3px 8px 2px #555555'
});

cssList.addClass('ev-prop', {
	borderRadius: '6px',
	boxShadow: '3px 3px 8px 2px #555555'
});

cssList.addClass('ev-prop-highlight', {
	borderRadius: '6px',
	boxShadow: '0px 0px 10px 4px green'
});

return cssList.toString();
