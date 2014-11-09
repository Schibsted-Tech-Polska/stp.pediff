var task = require('../pages');

module.exports = {
    config: {
        path: '&id=ap7364935&format=ipad_landscape&page=0',
        options: {
            viewportSize: [{width: 1024, height: 778}]
        },
        media: {
            print: false
        },
        package: 'ipadvideocover',
        actions: task.pages(3)
    },
    execute: task.exec
};
