<?php
/**
 * @var lx\Application $App
 * @var lx\Plugin $Plugin
 * @var lx\Snippet $Snippet
 * */

use lexedo\monopoly\map\MapBuilder;

// Квадрат игрового поля
$box = new lx\Box(['key' => 'main']);
$box->slot([
	'indent' => '10px',
	'cols' => 1,
	'rows' => 1
]);
$field = $box->child(0);
$field->fill('#c5d9f1');
$field->gridProportional([
	'cols' => 34,
	'rows' => 34,
]);

// Создается игровое поле
$builder = new MapBuilder($Plugin, $field);
$builder->build();
$field->getChildren()->call('border', ['color' => 'gray']);

// Для визуализации событий, происходящих в игре
$field->begin();
	$gameInfo = new lx\Box([
		'key' => 'gameInfo',
		'geom' => [9, 9, 16, 4],
	]);
	$gameInfo->fill('white');
	$log = new lx\Box([
		'key' => 'gameLog',
		'geom' => [9, 14, 16, 8],
	]);
	$log->fill('white');
	$gamePult = new lx\Box([
		'key' => 'gamePult',
		'geom' => [9, 23, 16, 2]
	]);
$field->end();

// Пульт управления всей игрой
$gamePult->gridProportional(['step' => '10px']);
$gamePult->begin();
	new lx\Button([ 'key' => 'butAllLog',  'width' => 3, 'text' => 'Весь лог'   ]);
	new lx\Button([ 'key' => 'butSave',    'width' => 3, 'text' => 'Сохранить'  ]);
	new lx\Button([ 'key' => 'butLoad',    'width' => 3, 'text' => 'Загрузить'  ]);
	new lx\Button([ 'key' => 'butNewGame', 'width' => 3, 'text' => 'Новая игра' ]);
$gamePult->end();

// Попапы
$tools = $App->getService('lx/tools');
$tools->renderSnippet('inputPopup');
$tools->renderSnippet('confirmPopup');
$Snippet->setRenderPath('popup');
$Snippet->addPopups([
	'popupCompanyInfo' => [ 'header' => 'Данные о компании', 'geom' => ['25%', '20', '50%', '50%'], 'style' => ['border' => []] ],
	'popupNewGame' =>     [ 'header' => 'Новая игра',        'geom' => ['25%', '20', '50%', '50%'], 'style' => ['border' => []] ],
]);
