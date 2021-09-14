<?php

namespace lexedo\games\cofb;

use lexedo\games\cofb\backend\CofbChannel;
use lexedo\games\GamePlugin;

class Plugin extends GamePlugin
{
    public function getGameSlug(): string
    {
        return 'cofb';
    }

    public function getTitleImage(): string
    {
        return 'cofb.png';
    }

    public function getGameChannelClass(): string
    {
        return CofbChannel::class;
    }

    public function getMinGamers(): string
    {
        return 2;
    }

    public function getMaxGamers(): string
    {
        return 4;
    }

	protected function widgetBasicCssList(): array
    {
		return [
			'lx.Table' => [
				'main' => 'cofb-Table',
				'row' => 'cofb-Table-row',
				'cell' => 'cofb-Table-cell'
			]
		];
	}
}
