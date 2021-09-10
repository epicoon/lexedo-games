<?php

namespace lexedo\games\cofb;

class Plugin extends \lx\Plugin
{
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
