#lx:module lexedo.games.VotingMenu;
#lx:module-data {
    i18n: i18n.yaml
};

#lx:use lx.ActiveBox;
#lx:use lx.Button;
#lx:use lx.Scroll;

#lx:namespace lexedo.games;
class VotingMenu extends lx.Box {
    modifyConfigBeforeApply(config) {
        let parent = null;
        if (config.parent) {
            parent = config.parent;
            delete config.parent;
        }
        if (config.message) {
            this._message = config.message;
            delete config.message;
        }
        config.geom = config.geom || [30, 20, 40, 50];
        config.header = config.header || #lx:i18n(title);
        config = {
            geom: true,
            depthCluster: lx.DepthClusterMap.CLUSTER_FRONT,
            formConfig: config
        };
        if (parent) config.parent = parent;
        return config;
    }

    static initCss(css) {
        css.inheritClass('lg-VotingMenu-Box', 'AbstractBox');
    }

    getBasicCss() {
        return {
            box: 'lg-VotingMenu-Box'
        };
    }

    #lx:client clientBuild(config) {
        super.clientBuild(config);

        this._env = null;
        this._onAppove = null;
        this._onDecline = null;
        this.gamersList = lx.ModelCollection.create({
            schema: {
                id: {},
                name: {},
                vote: {},
            }
        });

        this.add(lx.Box, {
            geom: true,
            opacity: 0.5,
            fill: 'black'
        });
        const form = this.add(lx.ActiveBox, config.formConfig);
        form.streamProportional({indent: '10px'});
        form.begin();
        #lx:tpl-begin;
            <lx.Box:@message (height:'auto')>
                .style('min-height', '10px')
                .overflow('hidden')
            <lx.Box>.addContainer().addStructure(lx.Scroll, {type: lx.VERTICAL})
                <lx.Box:@matrix>.stream()
            <lx.Box (height:'50px')>
                .gridProportional()
                <lx.Button:@butAccept (geom:[2,0,3,1], text:#lx:i18n(accept))>
                <lx.Button:@butReject (geom:[7,0,3,1], text:#lx:i18n(reject))>
        #lx:tpl-end;
        form.end();

        form->>matrix.matrix({
            items: this.gamersList,
            itemBox: [lx.Box, {gridProportional: {indent:'10px'}}],
            itemRender: (box, model)=>{
                box.height('fit-content');
                (box.add(lx.Box, {
                    field: 'name',
                    width: 8,
                    css: this.basicCss.box
                })).align(lx.CENTER, lx.MIDDLE);
                (box.add(lx.Box, {
                    field: 'vote',
                    width: 4,
                    css: this.basicCss.box
                })).align(lx.CENTER, lx.MIDDLE);
            }
        });

        form->>butAccept.click(()=>{
            this._env.triggerChannelEvent('revenge-vote', {
                gamerId: this._env.getGame().getLocalGamer().getId(),
                vote: true
            });
        });

        form->>butReject.click(()=>{
            this._env.triggerChannelEvent('revenge-vote', {
                gamerId: this._env.getGame().getLocalGamer().getId(),
                vote: false
            });
        });

        this.hide();
    }

    #lx:client setEnvironment(env) {
        this._env = env;

        const plugin = env.getPlugin();

        plugin.on('ENV_revengeRequested', event => {
            this.open();
            this.setVotes(event.getData().revengeApprovements);
        });

        plugin.on('ENV_revengeVoted', event => {
            const data = event.getData();
            this.setVote(data.gamerId, data.vote);
        });
    }

    #lx:client setVotingButton(button) {
        this._button = button;
        button.click(()=>{
            if (this.visibility()) return;
            this._env.triggerChannelEvent('ask-for-revenge', {
                gamerId: this._env.getGame().getLocalGamer().getId()
            });
        });
    }

    #lx:client onApprove(callback) {
        this._onAppove = callback;
    }

    #lx:client onDecline(callback) {
        this._onDecline = callback;
    }

    #lx:client open(message = null) {
        this.show();

        this->>butAccept.disabled(false);
        this->>butReject.disabled(false);
        this.gamersList.reset();
        this._env.getGame().forEachGamer(gamer => {
            this.gamersList.add({
                id: gamer.getId(),
                name: gamer.getName(),
                vote: 'waiting'
            });
        });

        message = message || this._message || 'Voting';
        this->>message.text(message);
    }

    #lx:client setVote(gamerId, vote, check = true) {
        this.gamersList.forEach(gamer => {
            if (gamer.id != gamerId) return;
            gamer.vote = vote ? 'approved' : 'declined';
            if (this._env.getGame().getLocalGamer().getId() == gamerId) {
                this->>butAccept.disabled(true);
                this->>butReject.disabled(true);
            }
        });

        if (check) __checkVotingEnd(this);
    }

    #lx:client setVotes(votes) {
        for (let id in votes)
            this.setVote(id, votes[id], false);
        __checkVotingEnd(this);
    }
}

function __checkVotingEnd(self) {
    let allVoted = true,
        approved = true;
    self.gamersList.forEach(gamer => {
        if (gamer.vote == 'waiting')
            allVoted = false;
        if (gamer.vote != 'approved')
            approved = false;
    });

    if (!allVoted) return;

    self.hide();
    if (approved) {
        if (self._onAppove) self._onAppove();
    } else {
        if (self._onDecline) self._onDecline();
    }
}
