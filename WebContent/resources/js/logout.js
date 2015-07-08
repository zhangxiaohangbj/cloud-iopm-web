define(['Common', 'PubView'], function(Common, PubView) {
    var init = function() {
        var def = $.Deferred();
        Common.xhr.ajax('/identity/logout', function() {
            def.resolve();
            window.location.assign(PubView.root+'/login');
        });
        return def;
    };
    return {
        init: init
    };
});
