#lx:namespace lxGames.manage;
class MainAsset extends lx.PluginCssAsset {
    init(css) {
        css.inheritClass('lgman-Box', 'AbstractBox');
        css.addClass('lgman-Label', {
            '@ellipsis': true,
        });
        css.inheritClass('lgman-Hint', 'AbstractBox', {
            padding: '10px',
        });

        css.addClass('lgman-head', {
            backgroundColor: css.preset.altMainBackgroundColor
        });

        css.addClass('lgman-back', {
            backgroundColor: css.preset.altBodyBackgroundColor
        });

        css.addClass('lgman-indicator', {
            '@icon': ['\\25C9', {fontSize:14}],
            paddingBottom: '4px'
        });
        css.addClass('lgman-indicator-on', {
            color: css.preset.checkedLightColor
        });
        css.addClass('lgman-indicator-pending', {
            color: css.preset.neutralLightColor
        });
        css.addClass('lgman-indicator-off', {
            color: css.preset.hotLightColor
        });

        css.addClass('lgman-selected-channel', {
            backgroundColor: css.preset.checkedMainColor
        });
        css.addClass('lgman-smalltext', {
            fontSize: '0.7em'
        });

        css.addClass('lgman-watch-on', {
            backgroundColor: css.preset.checkedDeepColor
        });
        css.addClass('lgman-watch-off', {
            backgroundColor: css.preset.hotDeepColor
        });
    }
}
