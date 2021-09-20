#lx:model-collection leadersList = TetrisLeader;

Plugin->>leadersTable.matrix({
	items: leadersList,
	itemBox: [ lx.Form, {grid: true} ],
	itemRender: function(form) {
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
	^Respondent.getLeaders().then((list)=>{
		leadersList.reset(list);
	});
}
loadLeaders();

lx.EventSupervisor.subscribe('tetris_change_leaders', ()=>loadLeaders());
