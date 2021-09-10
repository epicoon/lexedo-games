<?php

namespace lexedo\monopoly\map;

use lx\Box;
use lx\DataObject;

class MapObjectCompany extends MapObject {
	private $companyData;

	protected function __construct($plugin, $data) {
		parent::__construct($plugin, $data);

		$resp = $this->plugin->getRespondent('Respondent');
		$companiesData = $resp->getCompaniesData();
		$this->companyData = DataObject::create($companiesData[$this->data->key]);
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
		$image->style('cursor', 'pointer');

		$geom;
		if ($this->isVertical()) {
			if ($this->isGrouped()) {
				$geom = [-50, 37.5, 200, 25];
			} else {
				$geom = [-100, 50, 300, 25];
			}
		} else {
			if ($this->isGrouped()) {
				$geom = [25, 0, 50, 100];
			} else {
				$geom = [25, 0, 75, 100];
			}
		}

		$textBox = new Box(['parent' => $this->box, 'geom' => $geom]);
		$textBox->text($this->companyData->name);
		$textBox->align(\lx::CENTER, \lx::MIDDLE);
		$textBox->get('text')->style('color', $this->data->color['text']);
		if ($this->isVertical()) {
			$textBox->rotate(90);
		}

		if ($this->isGrouped()) {
			$brancContainer = new Box([
				'parent' => $this->box,
				'geom' => $this->isVertical() ? [0, 75, 100, 25] : [75, 0, 25, 100],
			]);
			$brancContainer->picture('branch_container.png');
			$brancContainer->gridProportional([
				'cols' => 2,
				'rows' => 2,
			]);
		}
	}

	private function isVertical() {
		return $this->data->geom[2] < $this->data->geom[3];
	}

	private function isGrouped() {
		return $this->companyData->index !== null;
	}

	private function getPictureName() {
		return 'c_' . $this->companyData->category . ($this->companyData->index !== null ? $this->companyData->index : '') . '.png';
	}
}
