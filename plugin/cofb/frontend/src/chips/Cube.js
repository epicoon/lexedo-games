#lx:private;

#lx:macros Const {lexedo.games.Cofb.Constants};

var CUBE_COLOR = [ [0, 1, 0], [0.5, 0.5, 1], [1, 0.3, 0.3], [0.6, 0.6, 0.6, 0.6] ];

class Cube #lx:namespace lexedo.games.Cofb {
	constructor(game, id, num) {
		this.game = game;
		this.mesh = null;
		this.id = id;
		this.name = 'cube.' + num + '.' + id;
		this.tyle = null;
		this.value = 1;

		__create(this);
		this.game.world.registerStaff(this);
	}

	setColor(color) {
		for (var i=0; i<6; i++) {
			var mat = this.mesh.material[i];
			mat.color.r = color[0];
			mat.color.g = color[1];
			mat.color.b = color[2];
		}
	}

	applyValue(val) {
		this.value = val;

		if (val == 7) {
			for (var i=0; i<6; i++)
				this.mesh.material[i].map = this.game.world.getTexture('cubeJoker');
			return;
		}

		for (var i=0; i<6; i++) {
			var mat = this.mesh.material[i];
			mat.map = this.game.world.getTexture('cube' + val);
			val++;
			if (val > 6) val = 1;
		}
	}

	incValue(val) {
		var newVal = this.value + val;
		if (newVal > 6) newVal -= 6;
		if (newVal < 1) newVal += 6;

		this.applyValue(newVal);
	}

	genRandom() {
		var val = lx.Math.randomInteger(1, 6);
		this.applyValue(val);
	}

	putOn(field) {
		this.mesh.position.x = field.mesh.position.x;
		this.mesh.position.z = field.mesh.position.z;
		this.mesh.position.y = field.surface() + this.sizes[1] * 0.5;
	}

	del() {
		this.game.world.removeMesh( this.mesh );

		if (this.tyle !== null)
			this.tyle.chips.lxRemove(this);

		this.game.world.unregisterStaff(this);
	}
}

function __create(self) {
	var material = [
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube1') }),
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube2') }),
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube3') }),
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube4') }),
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube5') }),
		new THREE.MeshLambertMaterial({ map: self.game.world.getTexture('cube6') })
	];

	var w = >>>Const.FIELD_SIZE * 0.03,
		h = w,
		d = w,
		angles = [0, 0, 0, 0];

	self.mesh = self.game.world.newMesh({
		geometry: new lx3dGeometry.cutBox(w, h, d, angles, >>>Const.fisSMOOTH),
		material,
		clickable: true
	});
	self.mesh.name = self.name;

	self.sizes = [w, h, d];
	if (self.id != -1) self.setColor( CUBE_COLOR[ self.id ] );
}
