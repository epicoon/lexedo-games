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
            'imgBase' => '000big',
            'friendly' => true,
            'single' => true,
            'active' => false,
            'needFood' => 1,
        ],
        self::FAST => [
            'imgBase' => '001fast',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::INTERACT => [
            'imgBase' => '002interact',
            'friendly' => true,
            'single' => false,
            'active' => false,
            'pare' => true,
            'symmetric' => true,
        ],
        self::SWIM => [
            'imgBase' => '003swim',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::HIDE => [
            'imgBase' => '004hide',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::MIMICRY => [
            'imgBase' => '005mimicry',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::HOLE => [
            'imgBase' => '006hole',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::ACUTE => [
            'imgBase' => '007acute',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::DROP_TAIL => [
            'imgBase' => '008drop',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::SCAVENGER => [
            'imgBase' => '009scavenger',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::PARASITE => [
            'imgBase' => '010parasite',
            'friendly' => false,
            'single' => true,
            'active' => false,
            'needFood' => 2,
        ],
        self::PIRACY => [
            'imgBase' => '011piracy',
            'friendly' => true,
            'single' => true,
            'active' => true,
        ],
        self::SYMBIOSIS => [
            'imgBase' => '012simbios',
            'friendly' => true,
            'single' => false,
            'active' => false,
            'pare' => true,
            'symmetric' => false,
        ],
        self::COOP => [
            'imgBase' => '013coop',
            'friendly' => true,
            'single' => false,
            'active' => false,
            'pare' => true,
            'symmetric' => true,
        ],
        self::HIBERNATE => [
            'imgBase' => '014hibern',
            'friendly' => true,
            'single' => true,
            'active' => true,
        ],
        self::TRAMP => [
            'imgBase' => '015tramp',
            'friendly' => true,
            'single' => true,
            'active' => true,
        ],
        self::VENOM => [
            'imgBase' => '016venom',
            'friendly' => true,
            'single' => true,
            'active' => false,
        ],
        self::CARNIVAL => [
            'imgBase' => '017carniv',
            'friendly' => true,
            'single' => true,
            'active' => true,
            'needFood' => 1,
        ],
        self::FAT => [
            'imgBase' => '018fat',
            'friendly' => true,
            'single' => false,
            'active' => true,
        ],
    ];

    /**
     * @param int $type
     * @return bool
     */
    public static function isPare($type)
    {
        return in_array($type, self::$pareProperties);
    }

    /**
     * @param int $type
     * @return bool
     */
    public static function isHungry($type)
    {
        return in_array($type, self::$hungryProperties);
    }

    /**
     * @param int $type
     * @return bool
     */
    public static function isActiveDefense($type)
    {
        return in_array($type, self::$activeDefenseProperties);
    }

    /**
     * @param int $type
     * @return bool
     */
    public static function isFriendly($type)
    {
        return self::$data[$type]['friendly'] ?? false;
    }

    /**
     * @param int $type
     * @return bool
     */
    public static function isSingle($type)
    {
        return self::$data[$type]['single'] ?? false;
    }

    /**
     * @param int $type
     * @return bool
     */
    public static function isActive($type)
    {
        return self::$data[$type]['active'] ?? false;
    }

    /**
     * @param int $type
     * @return int
     */
    public static function getNeedFood($type)
    {
        return self::$data[$type]['needFood'] ?? 0;
    }

    /**
     * @param int $type
     * @return bool|null
     */
    public static function isSymmetric($type)
    {
        $data = self::$data[$type] ?? null;
        if (!$data) {
            return null;
        }

        if (!array_key_exists('pare', $data)) {
            return true;
        }

        return $data['symmetric'];
    }

    /**
     * @param int $type
     * @return string
     */
    public static function getName($type)
    {
        switch ($type) {
            case self::BIG: return 'prop.Big';
            case self::FAST: return 'prop.Fast';
            case self::INTERACT: return 'prop.Interact';
            case self::SWIM: return 'prop.Swim';
            case self::HIDE: return 'prop.Hide';
            case self::MIMICRY: return 'prop.Mimicry';
            case self::HOLE: return 'prop.Hole';
            case self::ACUTE: return 'prop.Acute';
            case self::DROP_TAIL: return 'prop.DropTail';
            case self::SCAVENGER: return 'prop.Scavenger';
            case self::PARASITE: return 'prop.Parasite';
            case self::PIRACY: return 'prop.Piracy';
            case self::SYMBIOSIS: return 'prop.Symbiosis';
            case self::COOP: return 'prop.Coop';
            case self::HIBERNATE: return 'prop.Hibernate';
            case self::TRAMP: return 'prop.Tramp';
            case self::VENOM: return 'prop.Venom';
            case self::CARNIVAL: return 'prop.Carnival';
            case self::FAT: return 'prop.Fat';
        }

        return '';
    }
}
