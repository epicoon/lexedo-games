#lx:private;

#lx:macros Const {lexedo.games.Cofb.Constants};

class World extends lx3dWorld #lx:namespace lexedo.games.Cofb {
	constructor(config) {
		super(config);
		
		this.game = config.game;

		// Таймер плавного перехода камеры
		__initTimer(this);
		// Агрегатор игровых 3д-объектов
		__initStaffList(this);
		// Обработчики событий
		__defineHandlers(this);

		// Агрегатор текстур
		this.texturesList = [];
		// Игровой стол
		this.table = null;
	}

	createTable() {
		var w = >>>Const.FIELD_SIZE * 3,
			d = >>>Const.FIELD_SIZE * 2;

		this.table = this.newMesh({
			geometry: lx3dGeometry.cutBox(w, 40, d, [0, 0, 0, 0], >>>Const.fisSMOOTH),
			material: new THREE.MeshLambertMaterial({ map : this.getTexture('olha') })
		});

		this.table.position.y = -22;
	}

	getTexture(name) {
		if (name in this.texturesList) return this.texturesList[name];

		var fileName = this.game.getPlugin().getImage(name + '.jpg');

		var texture = (new THREE.TextureLoader).load(fileName);
		texture.minFilter = texture.magFilter = THREE.LinearFilter;
		texture.anisotropy = 4;
		this.texturesList[name] = texture;

		return texture;
	}

	registerStaff(staff) {
		this.staffList.add(staff);
	}

	unregisterStaff(staff) {
		delete this.staffList.data[staff.name];
	}

	createSpiritStaff(chip, locs) {
		for (var i in locs) this.staffList.genSpiritChip(locs[i]);
		this.staffList.spiritInitiator = chip;
	}

	clearSpiritStaff() {
		this.staffList.delSpirit();
	}

	getSpiritInitiator() {
		return this.staffList.spiritInitiator;
	}

	getIntersectedStaff() {
		var intersects = this.intersects();
		if (!intersects.length) return null;

		var obj = intersects[0].object;
		if (obj.name && obj.name in this.staffList.data)
			return this.staffList.data[obj.name];

		return null;
	}
}
/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

function __initTimer(self) {
	self.cameraAnimator = new lx.Timer(300);
	self.cameraAnimator.on = function( position, mode, Y ) {
		if (this.inAction) return;

		var camera = self.camera;
		this.mode = mode || -1;

		// Записываем исходные положение и кватернион
		this.pos0 = camera.position.clone();
		this.q0 = camera.quaternion.clone();

		// Вычисляем положение, куда надо переместить камеру
		var pos1 = new THREE.Vector3();
		var y = Y || camera.position.y,
			vector = new THREE.Vector3(0, y, y);
		pos1.addVectors( position, vector );

		// Вычисляем кватернион окончательный, поместив камеру в место назначения и повернув
		camera.position.copy(pos1);
		camera.lookAt(position);
		this.q1 = camera.quaternion.clone();

		// Возвращаем камеру на место
		camera.position.copy(this.pos0);
		camera.quaternion.copy(this.q0);

		// Вычисляем вектор смещения
		this.shiftVector = new THREE.Vector3();
		this.shiftVector.subVectors( pos1, this.pos0 );
		this.shiftScalar = this.shiftVector.length();
		this.shiftVector.normalize();

		this.start();
	};

	self.cameraAnimator.whileCycle(function() {
		var k = this.shift();

		var camera = self.camera,
			q = new THREE.Quaternion();
		q.copy( this.q0 );
		q.slerp( this.q1, k );
		camera.quaternion.copy( q );

		var shift = this.shiftVector.clone();
		shift.multiplyScalar( this.shiftScalar * k );
		var pos = this.pos0.clone();
		pos.add( shift );
		camera.position.copy( pos );

		if (this.periodEnds()) {
			this.q0 = null;
			this.q1 = null;
			this.stop();

			if (this.mode != -1) self.game.status.set(this.mode);
		}
	});
}

function __initStaffList(self) {
	self.staffList = {
		data : [],
		counter : 0,
		spiritMeshes : [],
		spiritInitiator : null,

		add : function(obj) {
			if (obj.name !== undefined) this.data[obj.name] = obj;
			else {
				var name = 's' + this.counter;
				this.counter++;
				obj.name = name;
				this.data[name] = obj;
			}
		},

		genSpiritChip : function(loc) {
			var w = >>>Const.FIELD_SIZE * 0.0625,
				h = >>>Const.FIELD_SIZE * 0.00625,
				d = w,
				w2 = w * 0.5,
				w4 = w * 0.25,
				angles = [[w2, w4], [w2, w4], [w2, w4], [w2, w4]];

			var material = new THREE.MeshLambertMaterial({ color : 0xffff00 });
			material.opacity = 0.8;
			material.transparent = true;
			var mesh = self.newMesh({
				geometry: new lx3dGeometry.cutBox(w, h, d, angles, >>>Const.fisSMOOTH),
				material,
				clickable: true
			});

			var name = 'spirit.' + loc.name;
			mesh.name = name;
			this.data[name] = mesh;
			this.spiritMeshes.push( mesh );

			mesh.position.x = loc.parent.mesh.position.x + loc.x * >>>Const.FIELD_SIZE;
			mesh.position.z = loc.parent.mesh.position.z + loc.z * >>>Const.FIELD_SIZE;
			mesh.position.y = loc.parent.surface() + h * 0.5;
		},

		delSpirit : function() {
			for (var i in this.spiritMeshes) {
				var mesh = this.spiritMeshes[i];

				self.removeMesh(mesh);
				delete this.data[mesh.name];
			}

			this.spiritMeshes = [];
			this.spiritInitiator = null;
		}
	};
}

function __defineHandlers(self) {
	self.canvas.on('mouseup', (event)=>{
		event = event || window.event;

		// ищем пересечения
		var intersects = self.intersects();

		if (!intersects.length) return;

		// Направляем камеру на деталь
		if (event.button == 2) {
			self.cameraAnimator.on( intersects[0].object.position );
			return;
		}

		// Обработка клика по фишке
		if (event.button == 0) {
			var obj = intersects[0].object;
			if (obj.name && obj.name in self.staffList.data) {
				self.game.triggerLocalEvent('cofb_chip_clicked', [
					self.staffList.data[obj.name],
					event,
					intersects[0].point
				]);
			}
		}
	});
}
