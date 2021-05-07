<?php

namespace lexedo\games\tetris\backend;

//TODO устарел - править ОРМ и возвращаемые типы
class Respondent extends \lx\Respondent {
	public function getLeaders() {
		$leaders = $this->getModelManager('TetrisLeader')->loadModels([
			'ORDER BY' => 'place ASC',
		]);

		$result = [];
		foreach ($leaders as $leader) {
			$result[] = $leader->getFields();
		}

		return $result;
	}

	public function checkLeaderPlace($score) {
		return $this->checkLeaderPlaceProcess($score);
	}

	public function updateLeaders($data) {
		$place = $this->checkLeaderPlaceProcess($data['score']);
		if (!$place) {
			return;
		}

		$leaders = $this->loadLeaders();
		for ($i = 4; $i >= $place; $i--) {
			$prevLeaderFields = $leaders[$i - 1]->getFields(['name', 'level', 'score']);
			$leaders[$i]->setFields($prevLeaderFields);			
		}

		$leaders[$place - 1]->setFields($data);

		$this->getModelManager('TetrisLeader')->saveModels($leaders);
	}

	private function checkLeaderPlaceProcess($score) {
		$leaders = $this->loadLeaders();
		foreach ($leaders as $leader) {
			if ($score > $leader->score) {
				return $leader->place;
			}
		}

		return false;
	}

	private function loadLeaders() {
		return $this->getModelManager('TetrisLeader')->loadModels([
			'ORDER BY' => 'place ASC',
		]);
	}
}
