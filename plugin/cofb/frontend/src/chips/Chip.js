#lx:macros Const {lexedo.games.Cofb.Constants};

class Chip #lx:namespace lexedo.games.Cofb {
	constructor(game, info) {
		this.game = game;
		this.mesh = null;
		this.info = info;
		this.locus = null;
		this.game.world.registerStaff(this);
	}

	genGeometry() {
		var w, h, d, angles;

		if ( this.info.id !== undefined ) {

			var w = >>>Const.FIELD_SIZE * 0.0375,
				h = >>>Const.FIELD_SIZE * 0.03125,
				w2 = w * 0.5,
				d = w,
				angles = [w2, w2, w2, w2];

		} else if ( this.info.groupe <= >>>Const.GROUPE_BUILDING || this.info.groupe == >>>Const.GROUPE_100 ) {
			var w = >>>Const.FIELD_SIZE * 0.0625,
				h = >>>Const.FIELD_SIZE * 0.00625,
				d = w,
				w2 = w * 0.5,
				w4 = w * 0.25,
				angles = [[w2, w4], [w2, w4], [w2, w4], [w2, w4]];
		} else if (this.info.groupe == >>>Const.GROUPE_GOODS || this.info.groupe == >>>Const.GROUPE_BONUS_MAX) {
			var w = >>>Const.FIELD_SIZE * 0.0625,
				h = >>>Const.FIELD_SIZE * 0.00625,
				d = w,
				angles = [0, 0, 0, 0];
		} else if (this.info.groupe == >>>Const.GROUPE_BONUS_MIN || this.info.groupe == >>>Const.GROUPE_WORKER) {
			var w = >>>Const.FIELD_SIZE * 0.046875,
				h = >>>Const.FIELD_SIZE * 0.00625,
				d = w,
				angles = [0, 0, 0, 0];
		} else if (this.info.groupe == >>>Const.GROUPE_SILVER) {
			var w = >>>Const.FIELD_SIZE * 0.046875,
				h = >>>Const.FIELD_SIZE * 0.00625,
				d = w,
				w4 = w * 0.3,
				angles = [[w4, w4], [w4, w4], [w4, w4], [w4, w4]];
		} 

		var geom = new lx3dGeometry.cutBox(w, h, d, angles, >>>Const.fisSMOOTH);

		return { geometry : geom, sizes : [w, h, d] };
	}

	create(textures) {
		var t1 = this.game.world.getTexture(textures.face),
			t2 = textures.back ? this.game.world.getTexture(textures.back) : t1,
			t3 = this.game.world.getTexture(textures.side);

		var material = [
			new THREE.MeshLambertMaterial({ map: t1 }),
			new THREE.MeshLambertMaterial({ map: t2 }),
			new THREE.MeshLambertMaterial({ map: t3 }),
			new THREE.MeshLambertMaterial({ map: t3 }),
			new THREE.MeshLambertMaterial({ map: t3 }),
			new THREE.MeshLambertMaterial({ map: t3 })
		];

		var geom = this.genGeometry();

		this.mesh = this.game.world.newMesh({
			geometry: geom.geometry,
			material,
			clickable: true
		});
		this.mesh.name = this.name;

		this.sizes = geom.sizes;
	}

	putOn(field) {
		this.mesh.position.x = field.mesh.position.x;
		this.mesh.position.z = field.mesh.position.z;
		this.mesh.position.y = field.surface() + this.sizes[1] * 0.5;
	}

	turn() {
		if ( this.mesh.rotation.z != 0 ) this.mesh.rotation.z = 0;
		else this.mesh.rotation.z = Math.PI;
	}

	setColor(color) {
		for (var i=0; i<6; i++) {
			var mat = this.mesh.material[i];
			mat.color.r = color[0];
			mat.color.g = color[1];
			mat.color.b = color[2];
		}
	}

	del() {
		this.game.world.removeMesh( this.mesh );
		this.info.chip = null;
		if (this.locus !== null) this.locus.remove(this);
		this.game.world.unregisterStaff(this);
	}
}
