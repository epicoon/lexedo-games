class Gamer extends lx.BindableModel #lx:namespace lxMonopoly {
	#lx:schema
		name,
		color,
		team,
		isComputer,
		index;

	static get defaultList() {
		return [
			{
				name: 'Красный',
				color: 'red',
				team: 0,
				isComputer: false,
				index: 0
			},
			{
				name: 'Синий',
				color: 'blue',
				team: 1,
				isComputer: false,
				index: 1
			},
			{
				name: 'Зеленый',
				color: 'green',
				team: 2,
				isComputer: false,
				index: 2
			},
			{
				name: 'Желтый',
				color: 'yellow',
				team: 3,
				isComputer: false,
				index: 3
			}
		]
	}
}
