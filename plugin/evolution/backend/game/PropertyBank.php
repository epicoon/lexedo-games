<?php

namespace lexedo\games\evolution\backend\game;

/**
 * Class PropertyBank
 * @package lexedo\games\evolution\backend
 */
class PropertyBank
{
    const EXIST = 0;
    const BIG = 1;
    const FAST = 2;
    const INTERACT = 3;
    const SWIM = 4;
    const HIDE = 5;
    const MIMICRY = 6;
    const HOLE = 7;
    const ACUTE = 8;
    const DROP_TAIL = 9;
    const SCAVENGER = 10;
    const PARASITE = 11;
    const PIRACY = 12;
    const SYMBIOSIS = 13;
    const COOP = 14;
    const HIBERNATE = 15;
    const TRAMP = 16;
    const VENOM = 17;
    const CARNIVAL = 18;
    const FAT = 19;

    public static $pareProperties = [
        self::INTERACT,
        self::SYMBIOSIS,
        self::COOP,
    ];

    public static $hungryProperties = [
        self::BIG,
        self::PARASITE,
        self::CARNIVAL,
    ];

    public static $activeDefenseProperties = [
        self::FAST,
        self::MIMICRY,
        self::DROP_TAIL,
    ];

    public static $data = [
        self::BIG => [
            'name' => 'большой',
            'imgBase' => '000big',
            'friendly' => true,
            'single' => true,
            'needFood' => 1,
        ],
        self::FAST => [
            'name' => 'быстрый',
            'imgBase' => '001fast',
            'friendly' => true,
            'single' => true,
        ],
        self::INTERACT => [
            'name' => 'взаимодействие',
            'imgBase' => '002interact',
            'friendly' => true,
            'single' => false,
        ],
        self::SWIM => [
            'name' => 'плавание',
            'imgBase' => '003swim',
            'friendly' => true,
            'single' => true,
        ],
        self::HIDE => [
            'name' => 'камуфляж',
            'imgBase' => '004hide',
            'friendly' => true,
            'single' => true,
        ],
        self::MIMICRY => [
            'name' => 'мимикрия',
            'imgBase' => '005mimicry',
            'friendly' => true,
            'single' => true,
        ],
        self::HOLE => [
            'name' => 'норное',
            'imgBase' => '006hole',
            'friendly' => true,
            'single' => true,
        ],
        self::ACUTE => [
            'name' => 'острое зрение',
            'imgBase' => '007acute',
            'friendly' => true,
            'single' => true,
        ],
        self::DROP_TAIL => [
            'name' => 'отбрасывание хвоста',
            'imgBase' => '008drop',
            'friendly' => true,
            'single' => true,
        ],
        self::SCAVENGER => [
            'name' => 'падальщик',
            'imgBase' => '009scavenger',
            'friendly' => true,
            'single' => true,
        ],
        self::PARASITE => [
            'name' => 'паразит',
            'imgBase' => '010parasite',
            'friendly' => false,
            'single' => true,
            'needFood' => 2,
        ],
        self::PIRACY => [
            'name' => 'пиратство',
            'imgBase' => '011piracy',
            'friendly' => true,
            'single' => true,
        ],
        self::SYMBIOSIS => [
            'name' => 'симбиоз',
            'imgBase' => '012simbios',
            'friendly' => true,
            'single' => false,
        ],
        self::COOP => [
            'name' => 'сотрудничество',
            'imgBase' => '013coop',
            'friendly' => true,
            'single' => false,
        ],
        self::HIBERNATE => [
            'name' => 'спячка',
            'imgBase' => '014hibern',
            'friendly' => true,
            'single' => true,
        ],
        self::TRAMP => [
            'name' => 'топотун',
            'imgBase' => '015tramp',
            'friendly' => true,
            'single' => true,
        ],
        self::VENOM => [
            'name' => 'ядовитое',
            'imgBase' => '016venom',
            'friendly' => true,
            'single' => true,
        ],
        self::CARNIVAL => [
            'name' => 'хищник',
            'imgBase' => '017carniv',
            'friendly' => true,
            'single' => true,
            'needFood' => 1,
        ],
        self::FAT => [
            'name' => 'жировой запас',
            'imgBase' => '018fat',
            'friendly' => true,
            'single' => false,
        ],
    ];

    /**
     * @param integer $type
     * @return bool
     */
    public static function isPare($type)
    {
        return in_array($type, self::$pareProperties);
    }

    /**
     * @param integer $type
     * @return bool
     */
    public static function isHungry($type)
    {
        return in_array($type, self::$hungryProperties);
    }

    /**
     * @param integer $type
     * @return bool
     */
    public static function isActiveDefense($type)
    {
        return in_array($type, self::$activeDefenseProperties);
    }

    /**
     * @param integer $type
     * @return bool
     */
    public static function isFriendly($type)
    {
        return self::$data[$type]['friendly'] ?? false;
    }

    /**
     * @param integer $type
     * @return bool
     */
    public static function isSingle($type)
    {
        return self::$data[$type]['single'] ?? false;
    }

    /**
     * @param integer $type
     * @return integer
     */
    public static function getNeedFood($type)
    {
        return self::$data[$type]['needFood'] ?? 0;
    }
}
