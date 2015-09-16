module.exports = {
    specDir: __dirname + '/spec',
    resultsDir: process.cwd() + '/pediff',
    environments: [
        {
            name: '.com',
            baseUrl: 'http://google.com/'
        },
        {
            name: '.no',
            baseUrl: 'http://google.no/'
        }
    ],
    viewports: [
        {
            name: 'mobile',
            icon: 'phone_iphone',
            width: 320,
            height: 480
        },
        {
            name: 'tablet',
            icon: 'tablet_mac',
            width: 768,
            height: 1024
        },
        {
            name: 'web',
            icon: 'desktop_mac',
            width: 1280,
            height: 1024
        }
    ]
};
