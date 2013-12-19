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
        candidate: 'http://hfossli.github.io/drmobile-integration/test.html?env=rai-dev.aptoma.no:9000',
        //candidate: 'http://hfossli.github.io/drmobile-integration/test.html?env=1',
        current: 'http://hfossli.github.io/drmobile-integration/test.html?env=aftenposten-staging.drlib.aptoma.no'
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
