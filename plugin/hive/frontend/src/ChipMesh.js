#lx:macros hive {lexedo.games.Hive}

class ChipMesh #lx:namespace lexedo.games.Hive {
    constructor(world) {
        this.world = world;

        this.mesh = null;
        this.tyle = null;
    }

    //TODO разный материал для разных игроков
    static getMaterial() {
        if (!this.material) {
            this.material = new THREE.MeshLambertMaterial({ color: '#ff0000' });
        }

        return this.material;
    }

    getEnvironment() {
        return this.world.env;
    }

    getWorld() {
        return this.world;
    }

    getMap() {
        return this.world.map;
    }

    getRelatedCoords() {
        let result = [];
        if (!this.tyle) return result;

        let x = this.tyle.x;
        let z = this.tyle.z;

        result.push({x: x,     z: z - 1});
        result.push({x: x,     z: z + 1});
        result.push({x: x - 1, z: z    });
        result.push({x: x + 1, z: z    });
        if (x % 2) {
            result.push({x: x - 1, z: z - 1});
            result.push({x: x + 1, z: z - 1});
        } else {
            result.push({x: x - 1, z: z + 1});
            result.push({x: x + 1, z: z + 1});
        }

        return result;
    }

    locateInMap(x, z) {
        let map = this.getMap();
        let tyle = map.addTyle(x, z);

        if (!this.mesh) __genMesh(this);
        tyle.pushChip(this);
        this.tyle = tyle;
    }

    setPosition(position) {
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
    }
}

/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

function __genMesh(self) {
    self.mesh = self.getWorld().newMesh({
        geometry: >>>hive.Tyle.getGeometry(),
        material: >>>hive.ChipMesh.getMaterial(),
        clickable: true
    });
}
