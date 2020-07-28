#lx:macros evConst {lexedo.games.Evolution.Constants};

class Creature extends lx.BindableModel #lx:namespace lexedo.games.Evolution {
	#lx:schema
		state: {default:'base'};  /*base, active, attaked, poisoned, dead*/

	constructor(gamer, id) {
		super();
		this.id = id;
		this.gamer = gamer;

		//TODO - убрать такую механику. Существа, погибающие в течение фазы питания должны сбрасываться сразу же.
		this._isDead = false;

		this.properties = new lx.Collection();
		this.properties.add(
			lexedo.games.Evolution.Property.create(this, #evConst.PROPERTY_EXIST)
		);
	}

	getEnvironment() {
		return this.gamer.getEnvironment();
	}

	isDead() {
		return this._isDead;
	}

	canAttachCart(cart) {
		if (!cart.isPropertySingle()) return true;
		var selected = this.properties.select(prop=>prop.type==cart.getTitleProperty());
		return selected.isEmpty;
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

	getPropertyById(id) {
		var selected = this.properties.select(item=>item.id==id);
		if (selected.isEmpty) return null;
		return selected.at(0);
	}

	getExistProperty() {
		return this.properties.at(0);
	}

	setFeedMode(bool) {
		this.properties.each(property=>property.setFeedMode(bool));
	}

	isHungry() {
		if (this.isDead()) return false;
		return (this.getNeedFood() > 0);
	}

	canEat() {
		if (this.isDead()) return false;
		if (this.isHungry()) return true;
		return (this.getCurrentFat() < this.getTotalFat());
	}

	getNeedFood() {
		if (this.isDead()) return 0;
		return this.getTotalNeedFood() - this.getEatenFood();
	}

	getTotalNeedFood() {
		if (this.isDead()) return 0;
		var result = 0;
		this.properties.each(property=>result+=property.getNeedFood());
		return result;
	}

	getEatenFood() {
		if (this.isDead()) return 0;
		var result = 0;
		this.properties.each(property=>result+=property.getEatenFood());
		return result;
	}

	getTotalFat() {
		if (this.isDead()) return 0;
		var selected = this.properties.select(prop=>prop.type==#evConst.PROPERTY_FAT);
		return selected.len;
	}

	getCurrentFat() {
		if (this.isDead()) return 0;
		var selected = this.properties.select(prop=>prop.type==#evConst.PROPERTY_FAT);
		var totalFat = 0;
		selected.each(fat=>totalFat+=fat.hasFat());
		return totalFat;
	}

	feed(propertyId, foodType) {
		if (this.isDead()) return;
		var property = (propertyId == 0)
			? this.getExistProperty()
			: this.getPropertyById(propertyId);
		property.feed(foodType);
	}

	prepareToGrow() {
		this.properties.each(property=>{
			property.setFeedMode(false);
			property.reset();
		});
	}
}
