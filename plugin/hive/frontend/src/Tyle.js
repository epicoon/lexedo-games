#lx:private;

#lx:macros hive {lexedo.games.Hive}

class Tyle #lx:namespace lexedo.games.Hive {
    constructor(map, x, z) {
    	this.map = map;
    	this.x = x;
    	this.z = z;

    	this.mesh = null;
    	this.chips = [];
	}

	static getGeometry() {
		if (!this.geometry) {
			let size = >>>hive.Constants.GEOM_SIZE - >>>hive.Constants.GEOM_INDENT * 2;
			let height = Math.round(>>>hive.Constants.GEOM_SIZE / 6);
			let minStep = Math.round(>>>hive.Constants.GEOM_SIZE * 0.25 - >>>hive.Constants.GEOM_INDENT);
			let maxStep = Math.round(>>>hive.Constants.GEOM_SIZE * 0.5 - >>>hive.Constants.GEOM_INDENT);

			this.geometry = new lx3d.Geometry.cutBox(
				/*coords*/ size, height, size,
				/*angles*/ [[minStep, maxStep], [minStep, maxStep], [minStep, maxStep], [minStep, maxStep]],
				/*precision*/ >>>hive.Constants.GEOM_PRECISION
			);
		}

		return this.geometry;
	}

	static getMaterial() {
		if (!this.material) {
			this.material = new THREE.MeshLambertMaterial({ color: '#ffff00' });
			this.material.opacity = 0.5;
			this.material.transparent = true;
		}

		return this.material;
	}

	getWorld() {
		return this.map.getWorld();
	}

	isEmpty() {
		return this.chips.length === 0;
	}

	pushChip(chip) {
		if (this.chips.length) {
			//TODO фишки можно складывать стопкой
			return;
		}

		if (this.chips.includes(chip)) return false;

		this.highlightOff();
		chip.setPosition(this.calcChipPosition());
		this.chips.push(chip);
		return true;
	}

	removeChip(chip) {
		let result = this.chips.remove(chip);
		return result;
	}

	calcPosition() {
		let x = >>>hive.Constants.GEOM_SIZE * 0.75 * this.x;
		let z = >>>hive.Constants.GEOM_SIZE * this.z;
		if (this.x % 2) z -= (>>>hive.Constants.GEOM_SIZE * 0.5);
		return {x, y:0, z};
	}

	calcChipPosition() {
		//TODO учесть y для стопки
		return this.calcPosition();
	}

	highlightOn() {
		if (this.mesh) return;

		this.mesh = this.getWorld().newMesh({
			geometry: self::getGeometry(),
			material: self::getMaterial(),
			clickable: true
		});

		let pos = this.calcPosition();
		this.mesh.position.x = pos.x;
		this.mesh.position.y = pos.y;
		this.mesh.position.z = pos.z;
	}

	highlightOff() {
		if (!this.mesh) return;
		
		this.getWorld().removeMesh(this.mesh);
		this.mesh = null;
	}
}


