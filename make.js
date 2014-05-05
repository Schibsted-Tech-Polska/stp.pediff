var fs = require('q-io/fs'),
    path = require('path'),
    gm = require('gm'),
    q = require('q'),
    proc = require('child_process'),
    tools = require('./toolbelt'),
    colors = require('colors');

colors.setTheme({
    tick: 'green',
    title: 'underline',
    info: 'grey'
});

var prompt = function prompt(log, tick) {
    console.log((tick ? tick.tick : '› '.tick) + log);
}

console.time('› '.tick + 'work took me');

var directories = ['candidate', 'current', 'diff'],
    innerDirectories = ['candidate/hq', 'current/hq', 'diff/hq',
        'candidate/html', 'current/html', 'candidate/html/failed',
        'current/html/failed'
    ],
    jsonFiles = ['report.json', 'paths.json'];

var qForEach = function qForEach(func, list) {
    return function(res) {
        var arr = [];

        (list ? list : res).forEach(function(listEl) {
            arr.push(func(listEl));
        });

        return q.all(arr);
    }
}

var step = function step(func, tick) {
    return function(res) {
        prompt(tick ? tick : 'taking next step');
        return res ? func(res) : func();
    }
}

var promiseResult = function promiseResult(func) {
    return function(res) {
        var deffered = q.defer();
        deffered.resolve(func(res));
        return deffered.promise;
    }
}

var qChain = function qChain(func, list) {
    var promiseChain = q.fcall(function() {});

    list.forEach(function(listEl) {
        var promiseLink = func.bind(this, listEl);

        promiseChain = promiseChain.then(promiseLink);
    })

    return promiseChain;
}

var program = function() {
    q.fcall(qForEach(fs.removeTree.bind(fs), directories))

        .then(
            qForEach(fs.makeDirectory.bind(fs), directories))

        .then(
            qForEach(fs.makeDirectory.bind(fs), innerDirectories))

        .then(
            qForEach(function(file) {
                fs.write(file, '')
            }, jsonFiles))

        .then(
            step(fs.list.bind(fs, 'tasks'), 'hello sir/madame. peddif is ready to work'))

        .then(promiseResult(tools.jsOnly))

        .then(step(qForEach(function(task) {
            var path = 'casperjs run.js --web-security=no ' + task,
                result = tools.exec(path);

            prompt('executing ' + task + ' task');

            return result
                .then(function(msg) {
                    prompt(task + ' task completed', '» ');
                })
                .fail(function(msg) {
                    console.error(task + ' failed');
                    // console.error(msg.error);
                    // stdout is, in fact, more interesting, than error msg, even when task failed
                    console.log(msg.stdout);
                    process.exit();
                });
        }), 'starting tasks execution'))

        .then(function() {
            prompt('all tasks executed. screenshots are taken');

            var imagesLists = ['candidate', 'current'].map(function(dir) {
                return fs.list(dir);
            });

            return q.all(imagesLists);
        })

        .then(function(imagesLists) {
            prompt('calculating differences between screenshots');

            var promiseChain = q.fcall(function() {});

            imagesLists = imagesLists.map(function(list) {
                return tools.imagesOnly(list);
            });

            imagesLists[0].forEach(function(image) {
                var promiseLink = function() {
                    var file = image,
                        current = 'current/' + file,
                        diff = 'diff/' + file,
                        candidate = 'candidate/' + file,
                        deffered = q.defer();

                    tools.equateImagesHeight([current, candidate])
                        .then(function() {
                            return tools.compareImages([tools.dirify(current), tools.dirify(candidate)], tools.dirify(diff))
                        })
                        .then(function(res) {
                            var diffFactor = String(10 * (1 - res.equality)).replace('.', '').substring(0, 8),
                                moved = [];

                            moved.push(fs.move(current, 'current/' + diffFactor + '_' + file));
                            moved.push(fs.move(candidate, 'candidate/' + diffFactor + '_' + file));
                            moved.push(fs.move(diff, 'diff/' + diffFactor + '_' + file));

                            deffered.resolve(q.all(moved));
                        });

                    return deffered.promise;
                };

                promiseChain = promiseChain.then(promiseLink);
            });

            return promiseChain;
        })

        .then(step(qChain.bind(this, function(dir) {
            var deffered = q.defer();

            fs.list(dir)
                .then(function(list) {
                    var stripped = [];

                    tools.imagesOnly(list).forEach(function(image) {
                        stripped.push(tools.stripToJpg(dir + '/' + image));
                    });

                    deffered.resolve(q.all(stripped));
                })

            return deffered.promise;
        }, directories), 'generating previews'))

        .then(step(qChain.bind(this, function(dir) {
            var deffered = q.defer();

            fs.list(dir).then(function(list) {
                var moved = [];

                tools.pngOnly(list).forEach(function(image) {
                    moved.push(fs.move(dir + '/' + image, dir + '/hq/' + image));
                });

                deffered.resolve(q.all(moved));
            })

            return deffered.promise;
        }, directories), 'preparing images'))

        .then(function() {
            prompt('generating report');
            return tools.exec('casperjs report.js');
        })

        .then(function(res) {
            return tools.exec('casperjs coverage.js');
        })

        .then(function(res) {  
            return fs.list('diff');
        })

        .then(function(list) {
            var screensTaken = tools.imagesOnly(list).length * 2;

            prompt('aye sir! work is finished\n');
            prompt('info:'.title);
            prompt(screensTaken + ' screenshots has been taken');
            console.timeEnd('› '.tick + 'work took me');
            prompt('thanks for cooperation');
        })

        .fail(function(error) {
            console.error(error);
            if (error.errno === 34) {
                prompt('tryin again');
                program();
            }
        })
        .done();
};

program();