<?php

namespace lexedo\monopoly\map;

use lx\Box;

class MapObject {
	const TYPE_ANGLE = 'angle';
	const TYPE_COMPANY = 'company';
	const TYPE_EVENT = 'event';

	protected $plugin;
	protected $data;
	protected $box;

	protected function __construct($plugin, $data) {
		$this->plugin = $plugin;
		$this->data = $data;
	}

	public function create($plugin, $data) {
		switch ($data->type) {
			case self::TYPE_ANGLE: return new MapObjectAngle($plugin, $data);
			case self::TYPE_COMPANY: return new MapObjectCompany($plugin, $data);
			case self::TYPE_EVENT: return new MapObjectEvent($plugin, $data);
		}

		return null;
	}

	public function render() {
		$this->box = new Box([
			'key' => $this->data->key,
			'geom' => $this->data->geom,
		]);
	}
}
