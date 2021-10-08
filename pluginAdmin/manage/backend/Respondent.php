<?php

namespace lexedo\games\pluginAdmin\manage\backend;

use lx;
use lexedo\games\GamesServer;
use lx\process\ProcessConst;
use lx\process\ProcessSupervisor;
use lx\Respondent as lxRespondent;
use lx\ResponseInterface;

class Respondent extends lxRespondent
{
    public function checkProcess(): ResponseInterface
    {
        /** @var ProcessSupervisor $processSupervisor */
        $processSupervisor = lx::$app->processSupervisor;
        if (!$processSupervisor) {
            return $this->prepareErrorResponse('Process supervisor doesn\'t defined in the project');
        }

        $process = $processSupervisor->getProcess('games_server', 1);
        $pid = $process ? $process->getPid() : 0;
        $status = $process ? $process->getStatus() : ProcessConst::PROCESS_STATUS_CLOSED;
        $result = [
            'process' => [
                'pid' => $pid,
                'status' => $status,
            ],
        ];
        
        if ($status == ProcessConst::PROCESS_STATUS_ACTIVE) {
            $processes = $this->getService()->getConfig('processes');
            $serverConfig = $processes['games_server']['config'];
            $result['connectionData'] = [
                'protocol' => $serverConfig['protocol'],
                'port' => $serverConfig['port'],
                'channelName' => GamesServer::COMMON_CHANNEL_KEY,
            ];
        }

        return $this->prepareResponse($result);
    }
}
