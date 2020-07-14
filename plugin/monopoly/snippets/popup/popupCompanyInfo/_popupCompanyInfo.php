<?php
/**
 * @var lx\Plugin $Plugin
 * @var lx\Snippet $Snippet
 * */

$Snippet->fill('white');

$Snippet->gridProportional([
	'cols' => 2,
	'rows' => 11,
	'indent' => '10px',
]);


$costs = new lx\Box(['size' => [1, 3]]);
$costs->fill('lightgray');

$currentData = new lx\Box(['size' => [1, 6]]);
$currentData->fill('lightgray');

$income = new lx\Box(['geom' => [0, 3, 1, 8]]);
$income->fill('lightgray');

$pult = new lx\Box(['key' => 'pult', 'geom' => [1, 6, 1, 5]]);
$pult->fill('lightgray');


$costs->gridProportional(['indent' => '10px']);
$costs->begin();
	new lx\Box(['text' => 'Цены']);

	(new lx\Box(['width' => 8, 'text' => 'Цена предприятия']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'cost', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Цена филиала']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'branchCost', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);
$costs->end();


$income->gridProportional(['indent' => '10px']);
$income->begin();
	new lx\Box(['text' => 'Доходы']);

	(new lx\Box(['width' => 8, 'text' => 'Базовый доход']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBase', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Монополия']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeMonopoly', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => '1 филиал']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBranch1', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => '2 филиала']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBranch2', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => '3 филиала']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBranch3', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => '4 филиала']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBranch4', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Корпорация']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'incomeBranch5', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);
$income->end();


$currentData->gridProportional(['indent' => '10px']);
$currentData->begin();
	new lx\Box(['text' => 'Текущая информация']);

	(new lx\Box(['width' => 8, 'text' => 'Владелец']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'n', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Статус']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'n', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Филиалов']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'n', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Корпорация']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'n', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);

	(new lx\Box(['width' => 8, 'text' => 'Доход']))->align(lx::LEFT, lx::MIDDLE);
	(new lx\Box(['width' => 4, 'field' => 'n', 'style'=> ['fill'=>'white']]))->align(lx::CENTER, lx::MIDDLE);
$currentData->end();


$pult->gridProportional(['cols' => 2, 'indent' => '20px']);
$pult->begin();
	new lx\Button(['key' => 'butSell',      'text' => 'Продать',  'width' => 1]);
	new lx\Button(['key' => 'butCredit',    'text' => 'Заложить', 'width' => 1]);
	new lx\Button(['key' => 'butAddBranch', 'text' => '+ филиал', 'width' => 1]);
	new lx\Button(['key' => 'butDelBranch', 'text' => '- филиал', 'width' => 1]);
	new lx\Button(['key' => 'butChange',    'text' => 'Обменять', 'width' => 1]);
	new lx\Button(['key' => 'butClose',     'text' => 'Закрыть',  'width' => 1]);
$pult->end();
