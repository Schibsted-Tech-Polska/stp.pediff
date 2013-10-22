module.exports = {
    generate: function (data) {

        var run = {
            modules: [],
            total: 0,
            failed: 0,
            time: 0,
            start: new Date()
        }

        for (var taskName in data.tasks) {
            var taskData = data.tasks[taskName];

            var module = {
                name: taskName,
                total: 0,
                failed: 0,
                time: 0,
                start: new Date(),
                tests: [],
                stdout: [],
                stderr: []
            }

            if (taskData.variants.length) {
                var test = variantsToTest(taskData.variants);

                module.tests.push(test);
                module.total += taskData.variants.length;
                module.failed += test.failed;
            }

            for (var actionName in taskData.actions) {
                var action = taskData.actions[actionName];
                if (action.variants.length) {
                    var test = variantsToTest(action.variants,actionName);

                    module.tests.push(test);
                    module.total += action.variants.length;
                    module.failed += test.failed;
                }
            }

            for(var i = 0; i < module.tests.length; i++) {
                for(var j = 0; j < module.tests[i].failedAssertions.length; j++) {
                    module.stdout.push(module.tests[i].failedAssertions[j].message);
                }
            }
            run.modules.push(module);
            run.total += module.total;
            run.failed += module.failed;
        }

        function variantsToTest(variants, name) {
            var test = {
                name: ((name) ? name : '_default'),
                total: variants.length,
                failed: 0,
                time: 0,
                start: new Date(),
                failedAssertions: []
            }
            for (var i = 0; i < variants.length; i++) {
                var variant = variants[i];
                if (parseInt(variant.diff) != 0) {
                    test.failed++;

                    test.failedAssertions.push({
                        message: ((name) ? name : '') + '@' + ((variant.media) ? variant.media : variant.viewportSize) + ' - ' + ((parseInt(variant.diff) === -1) ? 'run failure (check task definition)' : 'images are similar in ' + diffToPercent(variant.diff))
                    });
                }
            }
            return test;
        }

        function diffToPercent(diff) {
            return (100 - Math.ceil(parseInt(diff) / 1000000)) + '%';
        }

        var pad = function (n) {
            return n < 10 ? '0' + n : n;
        };

        var toISODateString = function (d) {
            return d.getUTCFullYear() + '-' +
                pad(d.getUTCMonth() + 1) + '-' +
                pad(d.getUTCDate()) + 'T' +
                pad(d.getUTCHours()) + ':' +
                pad(d.getUTCMinutes()) + ':' +
                pad(d.getUTCSeconds()) + 'Z';
        };

        var convertMillisToSeconds = function (ms) {
            return Math.round(ms * 1000) / 1000000;
        };

        var xmlEncode = function (text) {
            var baseEntities = {
                '"': '&quot;',
                '\'': '&apos;',
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;'
            };

            return ('' + text).replace(/[<>&\"\']/g, function (chr) {
                return baseEntities[chr] || chr;
            });
        };

        var XmlWriter = function (settings) {
            settings = settings || {};

            var data = [], stack = [], lineBreakAt;

            var addLineBreak = function (name) {
                if (lineBreakAt[name] && data[data.length - 1] !== '\n') {
                    data.push('\n');
                }
            };

            lineBreakAt = (function (items) {
                var i, map = {};
                items = items || [];

                i = items.length;
                while (i--) {
                    map[items[i]] = {};
                }
                return map;
            })(settings.linebreak_at);

            this.start = function (name, attrs, empty) {
                if (!empty) {
                    stack.push(name);
                }

                data.push('<' + name);

                for (var aname in attrs) {
                    data.push(' ' + xmlEncode(aname) + '="' + xmlEncode(attrs[aname]) + '"');
                }

                data.push(empty ? ' />' : '>');
                addLineBreak(name);
            };

            this.end = function () {
                var name = stack.pop();
                addLineBreak(name);
                data.push('</' + name + '>');
                addLineBreak(name);
            };

            this.text = function (text) {
                data.push(xmlEncode(text));
            };

            this.cdata = function (text) {
                data.push('<![CDATA[' + text + ']]>');
            };

            this.comment = function (text) {
                data.push('<!--' + text + '-->');
            };
            this.pi = function (name, text) {
                data.push('<?' + name + (text ? ' ' + text : '') + '?>\n');
            };

            this.doctype = function (text) {
                data.push('<!DOCTYPE' + text + '>\n');
            };

            this.getString = function () {
                while (stack.length) {
                    this.end();  // internally calls `stack.pop();`
                }
                return data.join('').replace(/\n$/, '');
            };

            this.reset = function () {
                data.length = 0;
                stack.length = 0;
            };

            // Start by writing the XML declaration
            this.pi(settings.xmldecl || 'xml version="1.0" encoding="UTF-8"');
        };

        // Generate JUnit XML report!
        var m, mLen, module, t, tLen, test, a, aLen, assertion, isEmptyElement,
            xmlWriter = new XmlWriter({
                linebreak_at: ['testsuites', 'testsuite', 'testcase', 'failure', 'system-out', 'system-err']
            });

        xmlWriter.start('testsuites', {
            name: (window && window.location && window.location.href) || (run.modules.length === 1 && run.modules[0].name) || null,
            hostname: 'localhost',
            tests: run.total,
            failures: run.failed,
            errors: 0,
            time: convertMillisToSeconds(run.time),  // ms → sec
            timestamp: toISODateString(run.start)
        });

        for (m = 0, mLen = run.modules.length; m < mLen; m++) {
            module = run.modules[m];

            xmlWriter.start('testsuite', {
                id: m,
                name: module.name,
                hostname: 'localhost',
                tests: module.total,
                failures: module.failed,
                errors: 0,
                time: convertMillisToSeconds(module.time),  // ms → sec
                timestamp: toISODateString(module.start)
            });

            for (t = 0, tLen = module.tests.length; t < tLen; t++) {
                test = module.tests[t];

                xmlWriter.start('testcase', {
                    name: test.name,
                    tests: test.total,
                    failures: test.failed,
                    errors: 0,
                    time: convertMillisToSeconds(test.time),  // ms → sec
                    timestamp: toISODateString(test.start)
                });

                for (a = 0, aLen = test.failedAssertions.length; a < aLen; a++) {
                    assertion = test.failedAssertions[a];

                    isEmptyElement = assertion && !(assertion.actual && assertion.expected);
                    xmlWriter.start('failure', { type: 'AssertionFailedError', message: assertion.message }, isEmptyElement);
                    if (!isEmptyElement) {
                        xmlWriter.start('actual', { value: assertion.actual }, true);
                        xmlWriter.start('expected', { value: assertion.expected }, true);
                        xmlWriter.end();  //'failure'
                    }
                }

                xmlWriter.end();  //'testcase'
            }

            // Per-module stdout
            if (module.stdout && module.stdout.length) {
                xmlWriter.start('system-out');
                xmlWriter.cdata('\n' + module.stdout.join('\n') + '\n');
                xmlWriter.end();  //'system-out'
            }

            // Per-module stderr
            if (module.stderr && module.stderr.length) {
                xmlWriter.start('system-err');
                xmlWriter.cdata('\n' + module.stderr.join('\n') + '\n');
                xmlWriter.end();  //'system-err'
            }

            xmlWriter.end();  //'testsuite'
        }

        xmlWriter.end();  //'testsuites'

        return xmlWriter.getString();
    }
};
