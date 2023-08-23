## Lexedo games

### Create new game plugin:
- use CLI command `new-lexedo-game-plugin`

### To use actions architecture:
#### Client side
- use js-module `lexedo.games.localActions` or `lexedo.games.onlineActions` respectively to game version
- response actions are immitation of server work for local game version

- example for game class js-code:
    ```js
    #lx:use lexedo.games;
    #lx:use lexedo.games.localActions;
    
    class Game extends lexedo.games.Game {
        static getActionsDependencies() {
            return {
                // For local and online
                // - by default - lexedo.games.actions.ActionHandler
                actionHandlerClass: my.ActionHandler,
                // - by default - lexedo.games.actions.DataProvider
                dataProviderClass: my.DataProvider,
                // - obligatory
                requestActionsNamespace: 'my',
                
                // For local only
                // - obligatory
                responseActionsNamespace: 'my.dataProvider'
            };
        }

        // For online only
        static getChannelEventListenerClass() {
            return lexedo.games.actions.ChannelEventListener;
        }
    }
    ```
    > - define static method `getActionsDependencies()`
    > - for online define your channel event listener class as `lexedo.games.actions.ChannelEventListener` or class extended from it
    > - note that namespaces for request and response actions should be different

- trigger an action
    ```js
    game.actions.trigger(new RequestActionClass(requestDataObject));
    ```

- ResponseAction example (for local only!)
    ```js
    #lx:namespace yourResponseActionNamespace;
    class SomeAction extends lexedo.games.actions.ResponseAction {
        run() {
            const inputData = this.inputData;  // <- requestDataObject
            this.outputData.add('hello', 'world');
        }
    }
    ```

- RequestAction example
    ```js
    #lx:namespace yourRequestActionNamespace;
    class SomeAction extends lexedo.games.actions.RequestAction {
        run() {
            const game = this.game;
            const data = this.responseData;
            const hello = data.hello;  // hello == 'world'
            // do something
        }
    }
    ```

#### Server side
- Extend event listener from `lexedo\games\actions\ActionsEventListener` and define your basic action class
    ```php
    use lexedo\games\actions\ActionsEventListener;
    
    /**
     * @method YourChannel getChannel()
     * @method YourGame getGame()
     */
    class YourEventListener extends ActionsEventListener
    {
        protected function getActionClass(): string
        {
             return YourAction::class;
        }
    }
    ```

- Implement your basic action class by extending `lexedo\games\actions\ResponseAction`
    ```php
    use lexedo\games\actions\ResponseAction;

    abstract class YourAction extends ResponseAction
    {
        protected static function getActionsMap(): array
        {
            return [
                // actionName => actionClass
            ];
        }
    }
    ```

- Implement your actions by extending your basic action class. Example:
    ```php
    class SomeAction extends YourAction {
        protected function process(): array
        {
            return [
                'hello' => 'world',
            ];
        }
    }
    ```
