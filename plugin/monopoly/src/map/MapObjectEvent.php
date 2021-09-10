<?php

namespace lexedo\monopoly\map;

use lx\Box;
use lx\DataObject;

class MapObjectEvent extends MapObject {
	private $eventData;

	protected function __construct($plugin, $data) {
		parent::__construct($plugin, $data);

		$resp = $this->plugin->getRespondent('Respondent');
		$eventsData = $resp->getEventsData();
		$this->eventData = DataObject::create($eventsData[$this->data->key]);
	}

	public function render() {
		parent::render();

		$this->box->fill($this->data->color['back']);
		$imageBox = new Box([
			'parent' => $this->box,
			'size' => $this->isVertical() ? [100, 25] : [25, 100],
		]);
		$image = new Box(['key' => 'image', 'parent' => $imageBox, 'geom' => [10, 10, 80, 80]]);
		$image->picture($this->getPictureName());

		$geom;
		if ($this->isVertical()) {
			$geom = [-100, 50, 300, 25];
		} else {
			$geom = [25, 0, 75, 100];
		}

		$textBox = new Box(['parent' => $this->box, 'geom' => $geom]);
		$textBox->text($this->eventData->name);
		$textBox->align(\lx::CENTER, \lx::MIDDLE);
		$textBox->get('text')->style('color', $this->data->color['text']);
		if ($this->isVertical()) {
			$textBox->rotate(90);
		}
	}

	private function isVertical() {
		return $this->data->geom[2] < $this->data->geom[3];
	}

	private function getPictureName() {
		return 'e_' . $this->eventData->category . '.png';
	}
}
