<?php

namespace lexedo\games\tetris\backend;

use lexedo\games\models\tetris\Leader;
use lx\model\modelTools\ModelsCollection;
use lx\Respondent as lxRespondent;
use lx\ResponseInterface;

class Respondent extends lxRespondent
{
	public function getLeaders(): ResponseInterface
    {
        $leaders = $this->loadLeaders();
        return $this->prepareResponse($leaders->toArray());
	}

	public function checkLeaderPlace(int $score): ResponseInterface
    {
        $place = $this->checkLeaderPlaceProcess($score);
        if ($place === null) {
            return $this->prepareResponse(false);
        }
        
        return $this->prepareResponse($place);
	}

	public function updateLeaders(iterable $data): void
    {
		$place = $this->checkLeaderPlaceProcess($data['score']);
		if ($place === null) {
			return;
		}

        $data['place'] = $place;

        Leader::getModelRepository()->hold();
        $leadersCount = Leader::getCount();
        if ($leadersCount < 5) {
            $oldLeaders = $this->loadLeaders();
            foreach ($oldLeaders as $leader) {
                if ($leader->place >= $place) {
                    $leader->place++;
                    $leader->save();
                }
            }
            $newLeader = new Leader($data);
            $newLeader->save();
        } else {
            $leaders = $this->loadLeaders();
            for ($i = 4; $i >= $place; $i--) {
                $leader = $leaders[$i];
                $prevLeader = $leaders[$i - 1];
                $leader->setFields($prevLeader->getFields(['name', 'level', 'score']));
                $leader->save();
            }
            $newLeader = $leaders[$place - 1];
            $newLeader->setFields($data);
            $newLeader->save();
        }
        Leader::getModelRepository()->commit();
	}

	private function checkLeaderPlaceProcess(int $score): ?int
    {
        if ($score == 0) {
            return null;
        }
        
		$leaders = $this->loadLeaders();
		foreach ($leaders as $leader) {
			if ($score > $leader->score) {
				return $leader->place;
			}
		}

        $leadersCount = Leader::getCount();
        if ($leadersCount < 5) {
            return $leadersCount + 1;
        }

		return null;
	}

    /**
     * @return ModelsCollection & iterable<Leader>
     */
	private function loadLeaders(): ModelsCollection
    {
		return Leader::find(['ORDER BY' => 'place ASC']);
	}
}
