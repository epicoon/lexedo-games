#lx:macros evConst {lexedo.games.Evolution.Constants};

class Creature #lx:namespace lexedo.games.Evolution extends lx.BindableModel {
	#lx:schema
		state: {default:'base'};  /*base, active, attaked, poisoned, dead*/

	constructor(gamer, id) {
		super();
		this.id = id;
		this.gamer = gamer;

		this.properties = new lx.Collection();
		this.properties.add(
			lexedo.games.Evolution.Property.create(this, #evConst.PROPERTY_EXIST)
		);
	}

	getEnvironment() {
		return this.gamer.getEnvironment();
	}

	addProperty(propertyType, propertyId) {
		this.properties.add(
			lexedo.games.Evolution.Property.create(this, propertyType, propertyId)
		);
	}

	getPicture() {
		var catalog = this.getEnvironment().dataCatalog;
		switch (this.state) {
			case 'active': return catalog.getActiveCreaturePicrute();
			case 'attaked': return catalog.getAttakedCreaturePicrute();
			case 'poisoned': return catalog.getPoisonedCreaturePicrute();
			case 'dead': return catalog.getDeadCreaturePicrute();
		}
		return '';
	}

	getProperties() {
		return this.properties;
	}

	setHungry(bool) {
		this.properties.each(property=>property.setHungry(bool));
	}
}
