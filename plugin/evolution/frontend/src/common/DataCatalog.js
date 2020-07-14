class DataCatalog #lx:namespace lexedo.games.Evolution {
	constructor(data) {
		this.properties = data.properties;

		console.log(this);
	}

	isPropertyFiendly(code) {
		var prop = this.properties[code];
		if (!prop) return false;
		return prop.friendly;
	}

	getPropertyPictureMax(code) {
		return this.properties[code].imgBase + '.jpg';
	}

	getPropertyPictureMin(code) {
		return this.properties[code].imgBase + '-m.png';
	}

	getPropertyPictureUse(code) {
		return this.properties[code].imgBase + '-u.png';
	}

	getCreaturePicrute() {
		return '_creature.png';
	}

	getActiveCreaturePicrute() {
		return '_activeCreature.png';
	}

	getAttakedCreaturePicrute() {
		return '_attakedCreature.png';
	}

	getPoisonedCreaturePicrute() {
		return 'tools/venom.png';
	}

	getDeadCreaturePicrute() {
		return 'tools/scull.png';
	}

}
