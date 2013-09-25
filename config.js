module.exports = {
    options: {
        verbose: false,
        pageSettings: {
            loadImages: true
        },
        viewportSize: [{width: 1280, height: 3000},{width: 1024, height: 3000},{width: 640, height: 3000}],
        media: {
            print: false
        }
    },
    environments: {
        candidate: 'http://www.google.com/?hl=no',
        current: 'http://www.google.com/?hl=sv'
    },
    output: {
        extension: 'png'
    },
    coverage: {
        routes: 'routes.json',
        skipOptional: true,
        exceptions: [
            {
                route: '',
                mapTo: ''
            }
        ]
    }
};
