<?php

namespace lexedo\games\plugin\manage\server;

use lx;
use lexedo\games\GamesServer;
use lx\process\ProcessConst;
use lx\process\ProcessSupervisor;
use lx\Respondent as lxRespondent;
use lx\HttpResponseInterface;
use lx\auth\RbacResourceInterface;

class Respondent extends lxRespondent implements RbacResourceInterface
{
    private string $commonProcessName = 'games_server';
    private int $commonProcessIndex = 1;

    public function getPermissions(): array
    {
        return [
            'checkProcess' => ['admin_w', 'admin_r'],
            'rerunCommonProcess' => ['admin_w', 'admin_r'],
            'stopCommonProcess' => ['admin_w', 'admin_r'],
        ];
    }

    public function checkProcess(): HttpResponseInterface
    {
        /** @var ProcessSupervisor $processSupervisor */
        $processSupervisor = lx::$app->processSupervisor;
        if (!$processSupervisor) {
            return $this->prepareErrorResponse('Process supervisor doesn\'t defined in the project');
        }

        $processSupervisor->actualizeProcessStatuses();
        $process = $processSupervisor->getProcess(
            $this->commonProcessName,
            $this->commonProcessIndex
        );
        if ($process) {
            $pid = $process->getPid();
            $status = $process->getStatus();
            $date = $process->createdAt();
            $date = $date ? $date->format('Y-m-d H:i:s') : 0;
        } else {
            $pid = 0;
            $status = ProcessConst::PROCESS_STATUS_CLOSED;
            $date = 0;
        }
        $result = [
            'process' => [
                'pid' => $pid,
                'status' => $status,
                'date' => $date,
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

    public function rerunCommonProcess(): HttpResponseInterface
    {
        /** @var ProcessSupervisor $processSupervisor */
        $processSupervisor = lx::$app->processSupervisor;
        if (!$processSupervisor) {
            return $this->prepareErrorResponse('Process supervisor doesn\'t defined in the project');
        }

        $processSupervisor->actualizeProcessStatuses();
        $process = $processSupervisor->getProcess(
            $this->commonProcessName,
            $this->commonProcessIndex
        );
        if ($process && $process->isActive()) {
            $result = $processSupervisor->stopProcess($this->commonProcessName, $this->commonProcessIndex);
            if (!$result) {
                return $this->prepareWarningResponse('Can not stop the process');
            }
        }

        $result = null;
        $attempts = 0;
        $attemptsLimit = 10;
        while ($attempts < $attemptsLimit) {
            usleep(200000);
            if ($process) {
                $process->actualizeCurrentStatus();
            }
            if (!$process || !$process->isActive()) {
                $result = $processSupervisor->rerunProcess($this->commonProcessName, $this->commonProcessIndex);
                break;
            }
            $attempts++;
        }

        if (!$result) {
            return $this->prepareWarningResponse('Can not run the process');
        }

        return $this->prepareResponse('Ok');
    }

    public function stopCommonProcess(): HttpResponseInterface
    {
        /** @var ProcessSupervisor $processSupervisor */
        $processSupervisor = lx::$app->processSupervisor;
        if (!$processSupervisor) {
            return $this->prepareErrorResponse('Process supervisor doesn\'t defined in the project');
        }

        $processSupervisor->actualizeProcessStatuses();
        $result = $processSupervisor->stopProcess($this->commonProcessName, $this->commonProcessIndex);
        if (!$result) {
            return $this->prepareWarningResponse('Can not stop the process');
        }

        return $this->prepareResponse('Ok');
    }
}
