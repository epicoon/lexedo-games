<?php

namespace lexedo\games\requestHandling;

use lx\auth\RbacResourceVoter;

class RequestVoter extends RbacResourceVoter
{
    protected function actionRightsMap(): array
    {
        return [
            'admin' => ['admin_r', 'admin_w'],
        ];
    }
}
