<?php

namespace lexedo\monopoly\map;

use lx\DataObject;

class MapObjectAngle extends MapObject {
	private $angleData;

	protected function __construct($plugin, $data) {
		parent::__construct($plugin, $data);

		$resp = $this->plugin->getRespondent('Respondent');
		$anglesData = $resp->getAnglesData();
		$this->angleData = DataObject::create($anglesData[$this->data->key]);
	}

	public function render() {
		parent::render();

		$this->box->text($this->angleData->name);
		$this->box->align(\lx::CENTER, \lx::MIDDLE);
		$this->box->get('text')->style('font-size', '30px');
	}
}
