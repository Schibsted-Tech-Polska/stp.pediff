require.config({
    baseUrl: 'js',
    enforceDefine: true,
    paths: {
        'text': 'vendor/requirejs/text',
        'templates': '../templates',
        'materialize': 'vendor/materialize'
    },
    shim: {
        'materialize': {
            exports: '$.fn'
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define([
    'application',
    'router'
], function(Application, Router) {
    Application.initialize(new Router());
});
