#lx:model-collection leadersList = tetris\Leader;

Plugin->>leadersTable.matrix({
	items: leadersList,
	itemBox: [ lx.Form, {grid: true} ],
	itemRender: function(form, model) {
		form.fields({
			place: [lx.Box, {width: 1}],
			name:  [lx.Box, {width: 5}],
			score: [lx.Box, {width: 3}],
			level: [lx.Box, {width: 3}]
		});
		form.getChildren().forEach(child=>child.align(lx.CENTER, lx.MIDDLE));
	}
});

function loadLeaders() {
	^Respondent.getLeaders().then(response=>{
		let list = response.data;
		leadersList.reset(list);
	});
}
loadLeaders();

Plugin.on('tetris_change_leaders', ()=>loadLeaders());
