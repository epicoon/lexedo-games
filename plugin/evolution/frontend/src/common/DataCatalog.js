class DataCatalog #lx:namespace lexedo.games.Evolution {
	constructor(data) {
		this.properties = data.properties;
	}

	isPropertyFiendly(code) {
		var prop = this.properties[code];
		if (!prop) return false;
		return prop.friendly;
	}

	isPropertySingle(code) {
		var prop = this.properties[code];
		if (!prop) return false;
		return prop.single;
	}

	isPropertyPare(code) {
		var prop = this.properties[code];
		if (!prop) return false;
		return prop.pare || false;	
	}

	isPropertySymmetric(code) {
		var prop = this.properties[code];
		if (!prop) return false;
		return prop.symmetric === undefined ? true : prop.symmetric;
	}

	getPropertyPictureMax(code) {
		return this.properties[code].imgBase + '.jpg';
	}

	getPropertyPictureMin(code) {
		return this.properties[code].imgBase + '-m.png';
	}

	getPropertyPictureUse(code, asymm) {
		if (this.properties[code].symmetric === false)
			return this.properties[code].imgBase + '-u-' + asymm + '.png';
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
