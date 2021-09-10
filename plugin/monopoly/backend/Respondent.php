<?php

namespace lexedo\games\monopoly\backend;

class Respondent extends \lx\Respondent {
	private static $mapData = null;
	private static $mapSequence = null;

	private static $companiesData = null;
	private static $eventsData = null;
	private static $anglesData = null;


	public function getMapData() {
		if (self::$mapData === null) {
			$path = $this->getPlugin()->getFilePath('data/map.yaml');
			$file = new \lx\DataFile($path);
			self::$mapData = $file->get();
		}

		return self::$mapData;
	}

	public function getMapSequence() {
		$this->recieveMapSequence();
		return self::$mapSequence;
	}

	public function getCompaniesData() {
		if (self::$companiesData === null) {
			$this->recieveObjectsData();
		}

		return self::$companiesData;
	}

	public function getEventsData() {
		if (self::$eventsData === null) {
			$this->recieveObjectsData();
		}

		return self::$eventsData;
	}

	public function getAnglesData() {
		if (self::$anglesData === null) {
			$this->recieveObjectsData();
		}

		return self::$anglesData;
	}

	public function getData() {
		if (self::$companiesData === null || self::$eventsData === null || self::$anglesData === null) {
			$this->recieveObjectsData();
		}

		$this->recieveMapSequence();

		return [
			'sequence' => self::$mapSequence,
			'companies' => self::$companiesData,
			'events' => self::$eventsData,
			'angles' => self::$anglesData,
		];
	}

	private function recieveMapSequence() {
		if (self::$mapSequence === null) {
			$path = $this->getPlugin()->getFilePath('data/mapSequence.yaml');
			$file = new \lx\DataFile($path);
			self::$mapSequence = $file->get();
		}
	}

	private function recieveObjectsData() {
		$path = $this->getPlugin()->getFilePath('data/data.yaml');
		$file = new \lx\DataFile($path);
		$data = $file->get();

		$getData = function($key) use ($data) {
			$result = [];
			foreach ($data[$key] as $category => $categoryData) {
				foreach ($categoryData as $info) {
					$info['category'] = $category;
					$result[$info['key']] = $info;
				}
			}
			return $result;
		};

		self::$companiesData = $getData('companies');
		self::$eventsData = $getData('events');
		self::$anglesData = $getData('angles');
	}
}
