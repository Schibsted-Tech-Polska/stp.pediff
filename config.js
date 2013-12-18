module.exports = {
    options: {
        verbose: false,
        pageSettings: {
            loadImages: true
        },
        viewportSize: [],
        media: {
            print: false
        }
    },
    environments: {
        candidate: 'http://google.pl/',
        current: 'http://google.en/'
    },
    output: {
        extension: 'png',
        junit: true
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
