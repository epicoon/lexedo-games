<?php

namespace lexedo\games\cofb;

class Plugin extends \lx\Plugin {
	protected function widgetBasicCssList() {
		return [
			'lx.Table' => [
				'main' => 'cofb-Table',
				'row' => 'cofb-Table-row',
				'cell' => 'cofb-Table-cell'
			]
		];
	}
}
