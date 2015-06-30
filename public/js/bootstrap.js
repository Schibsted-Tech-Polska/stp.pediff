require.config({
    baseUrl: 'js',
    enforceDefine: true,
    paths: {
        'text': 'vendor/requirejs/text'
    },
    shim: {
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define([
    'application',
    'router'
], function (Application, Router) {
    Application.initialize(new Router());
});
