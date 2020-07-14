<?php
/**
 * @var lx\Plugin $Plugin
 * @var lx\Snippet $Snippet
 * */

$Snippet->fill('white');
$Snippet->stream();

$gamersAmountBox = new lx\Box(['height' => '40px']);
$gamersAmountBox->text('Количество игроков');
$gamersAmountBox->begin();
	new lx\RadioGroup([
		'key' => 'gamersAmount',
		'size' => ['70%', '100%'],
		'labels' => [2, 3, 4],
		'grid' => ['cols' => 3],
	]);
$gamersAmountBox->end();
$gamersAmountBox->align([
	'horizontal' => lx::LEFT,
	'vertical' => lx::MIDDLE,
	'indent' => '20px',
]);

(new lx\Box(['top' => '40px', 'height' => '25px', 'text' => 'Игроки']))->align(lx::CENTER, lx::MIDDLE);
$header = new lx\Box(['top' => '65px', 'height' => '25px']);
$header->grid();
$header->begin();
	(new lx\Box(['text' => 'Имя',       'width' => 4]))->align(lx::CENTER, lx::MIDDLE);
	(new lx\Box(['text' => 'Цвет',      'width' => 2]))->align(lx::CENTER, lx::MIDDLE);
	(new lx\Box(['text' => 'Команда',   'width' => 3]))->align(lx::CENTER, lx::MIDDLE);
	(new lx\Box(['text' => 'Компьютер', 'width' => 3]))->align(lx::CENTER, lx::MIDDLE);
$header->end();

$matrix = new lx\Box(['top' => '90px', 'key' => 'gamers']);
$matrix->stream([
	'direction' => lx::VERTICAL,
]);

$pult = new lx\Box(['height' => '50px']);
$pult->gridProportional(['indent' => '10px']);
$pult->begin();
	new lx\Button(['key' => 'butBegin',  'width' => 6, 'text' => 'Начать' ]);
	new lx\Button(['key' => 'butCancel', 'width' => 6, 'text' => 'Закрыть']);
$pult->end();
