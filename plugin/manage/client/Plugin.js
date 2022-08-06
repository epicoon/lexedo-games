#lx:require -R src/;

/*
1. Процесс [[lexedo/games games_server]]
    + отображение статуса (запущен, остановлен, крашнут)
    - отображение даты старта
    - отображение лога
    - отображение ошибок
    - можно запустить
    - можно остановить
    - можно перезапустить

2. Состояние главного канала [[common]]
    - отображение даты старта
    + отображение подключений к каналу согласно п.4.

3. Список игровых каналов
    + отображение: ключ, имя игры, игра
    - отображение: создатель?, дата старта
    - можно удалить канал
    + можно просмотреть список подключений к каналу игры согласно п.4.

4. Отображение подключений к каналу
    + отображение: id юзера, логин юзера, ключ соединения, тип соединения (игрок, наблюдатель)
    - отображение: дата подключения
    - можно отправить сообщение подключению
    - можно дропнуть подключение
    - можно забанить подключение (до определенной даты, навсегда)
    - можно посмотреть все подключения юзера (таблица: подключение, ключ канала, имя игры, игра, дата подключения)
*/

class Plugin extends lx.Plugin {
    initCss(css) {
        css.inheritClass('lga-Box', 'AbstractBox');
    }
    
    run() {
        this.core = new lexedo.games.manage.Core(this);
        this.core.run();


        // this.core.channels.add({
        //     type: '__common__',
        //     name: 'common'
        // });
        // this.core.channelInfo.set( this.core.channels.at(0) );

        // this.core.connections.add({
        //     userId: 1,
        //     userAuthValue: 'dfdf',
        //     key: 'dfwefwefwefwef',
        //     type: 'gamer',
        //     date: ''
        // });
    }
}
