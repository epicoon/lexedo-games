<?php

namespace lexedo\monopoly\map;

use lx\DataObject;

class MapBuilder {
	private $plugin;
	private $field;
	private $mapData;

	public function __construct($plugin, $field) {
		$this->plugin = $plugin;
		$this->field = $field;

		$resp = $this->plugin->getRespondent('Respondent');
		$this->mapData = $resp->getMapData();
	}

	public function build() {
		$this->field->begin();
		foreach ($this->mapData['Objects'] as $data) {
			$data = DataObject::create($data);
			$mapObject = MapObject::create($this->plugin, $data);
			$mapObject->render();
		}
		$this->field->end();
	}
}
