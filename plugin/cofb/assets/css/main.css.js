var cssList = new lx.CssContext();
// cssList.addStyle('', {});
// cssList.addClass('', {}, {});

cssList.addClass('cofbBut', {
	backgroundColor: 'black',
	color: 'white',
	cursor: 'pointer',
	opacity: 0.7
}, {
	hover: {
		opacity: 1
	}
});

cssList.addClass('cofb-Table', {});
cssList.addClass('cofb-Table-row', {});
cssList.addClass('cofb-Table-cell', {});

return cssList.toString();
