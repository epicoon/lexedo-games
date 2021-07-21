<?php

namespace lexedo\games\evolution\backend;

use lexedo\games\GamesServer;
use lx;
use lx\I18nHelper as Helper;
use lx\socket\Channel\ChannelEvent;

/**
 * Class I18nHelper
 * @package lexedo\games\evolution\backend
 */
class I18nHelper
{
    /**
     * @param string $key
     * @param string $lang
     * @param array $params
     * @return string
     */
    public static function t($key, $lang, $params = [])
    {
        /** @var GamesServer $app */
        $app = lx::$app;

        return Helper::translate($key, $app->getI18nMap('lexedo/games:evolution'), $params, $lang);
    }

    /**
     * @param ChannelEvent $event
     */
    public static function localizeEvent($event)
    {
        $data = $event->getData();
        $log = $data['log'] ?? null;
        unset($data['log']);
        $message = $data['message'] ?? null;
        unset($data['message']);
        $event->setData($data);

        /** @var GamesServer $app */
        $app = lx::$app;
        $recievers = $event->getReceivers();
        /** @var Connection $reciever */
        foreach ($recievers as $reciever) {
            $user = $event->getChannel()->getUser($reciever);
            $cookie = $app->getCommonChannel()->getUserCookie($user);
            $lang = $cookie['lang'] ?? 'en-EN';

            if ($message) {
                $tMessage = self::t($message, $lang);
                $event->addDataForConnection($reciever, ['message' => $tMessage]);
            }

            if ($log) {
                if (is_array($log)) {
                    $tLog = self::t($log[0], $lang, $log[1]);
                } else {
                    $tLog = self::t($log, $lang);
                }
                $event->addDataForConnection($reciever, ['log' => $tLog]);
            }
        }
    }
}
