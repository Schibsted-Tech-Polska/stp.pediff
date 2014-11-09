# Stp.pediff

>A simple set of tools for visually comparing web pages built on top of
><a href="http://casperjs.org/" target="_blank">Casperjs</a> and ImageMagick
><a href="http://www.imagemagick.org/script/compare.php" target="_blank">compare</a> tool.

View a [sample report here](http://schibsted-tech-polska.github.io/stp.pediff/report/index.html).

## Table of Contents
* [How it works](#how-it-works)
* [Why to use it](#why-to-use-it)
* [Dependencies](#dependencies)
* [Usage](#usage)
* [Verbose mode](#verbose-mode)
* [Reports](#reports)
* [Coverage](#coverage)
* [Mocks](#mocks)

## How it works
Basically, Pediff executes a set of user defined tasks over two different versions of a website,
takes screenshots at desired moments and scans the output for differences.
Then it generates human-friendly report containing all the inconsistencies ordered by
relative number of differences. Optionally, it can check whether all the routes of your web application
are tested.

## Why to use it
Pediff enables developers to detect entire class of visual problems invisible to
classic unit tests and only occasionally catchable by manual review. For more details on the topic
see this great talk by Brett Slatkin at Air Mozilla:
https://air.mozilla.org/continuous-delivery-at-google/

## Dependencies
*   Unix-like operating system with Bash shell
*   [Casperjs](http://casperjs.org/) 1.1.0 or newer
*   ImageMagick [compare](http://www.imagemagick.org/script/compare.php) tool

## Getting Started
1.  Download the project to a place of your convenience
2.  run
    ```bash
    $ ./pediff.sh
    ```
3.  use static server to host entire directory
    ```bash
    $ http-server #npm install -g http-server
    #or
    $ python -m SimpleHTTPServer #python 2.x
    $ python -m http.server #python 3.x
    #or
    $ ruby -run -e httpd . -p 8080
    ```
4.  go to [http://localhost:8080/report/](http://localhost:8080/report/)

## Usage
1.  Download the project to a place of your convenience
2.  Rename `config.js-dist` to `config.js` and set the `environments` values so that `candidate` key
    points to candidate version of your app and `current` key points to, well... current version of
    your app. The `options` object will be passed to Casperjs instance upon every Pediff run.
3.  Create as many task files as needed. They all must be placed inside the `tasks/` subdirectory.
    _Example task file_:

    ```javascript
    module.exports = {
        config: {
            path: 'PATH/TO/RESOURCE'
            options: {
                viewportSize: [{width: 1440, height: 900}]
            },
            media: {
                print: false
            },
            package: "homepage"
        },
        execute: function(){
            this.save('home');
        }
    };
    ```
    Every task must contain two sections: `config` and `execute`. The `config` part will be merged
    with global config file before task execution. It serves the purpose of "creating a sandbox" for
    the task: subpage to open, a set of screen resolutions, user agent, media types,
    response mocks - things like that.
    
    ###Some config keys explained:
    * `package` is the label under which all the output for given task will be grouped by in the report.
    * `media` is the key that enables you to force PhantomJS to render page as different media (ex.
      print)
    
    The `execute` function will be run after the page has been loaded by Casperjs. Everything from
    [Casperjs API](http://casperjs.org/api.html) is acceptable, however you should use
    `save(filename)` instead of built in `capture` method for taking screenshots to make sure the
    files are saved in correct directories for comparison.

4.  After creating your tasks, type:

    ```bash
    $ ./pediff.sh
    ```
    into terminal and wait for the tool to finish.
    Pediff runs every task in a subshell to speed things up. You can limit number of tasks
    to be run parallelly by providing single positive integer as a parameter:

    ```bash
    $ ./pediff.sh 4
    ```
    This way, tasks will be run in sets of 4 at a time.

5.  At this point `index.html` file should be sitting in project's report/ subdirectory. Open it with your
    browser and review results.

## Verbose mode
While working on tasks it is useful to see what is going on during execution.
You can force pediff to output more data by setting verbose option to `true` in your config.js

```javascript
module.exports = {
    options: {
        verbose: true,
        ...
```

## Reports
Pediff generates convenient reports by default. Just open `report/index.html` file with your browser.
![Pediff example](https://dl.dropboxusercontent.com/u/10807323/pediff_report.jpg)
_Example: Diff view between consecutive deployments of [VGTV](http://www.vgtv.no) (difference in video impressions picked up)._

### Report's anatomy

#### General

* On the left you can see a list of all the tasks executed on your page along with label marking
level of compatibility between the two versions. The list is sorted by number of differences
(most different first).
* Optionally, you can toggle visibility of matching tasks (100% compability) with "Show only
differing" button below.
* By default, the tool renders lighter (and uglier) jpg images to reduce download times. You can change
this behavior with the "HQ" button, which forces pediff to load much heavier png images.
* In the bottom left corner there's "Test coverage" link. [More on coverage](#coverage).

#### Task view

* In the top right corner you can see a list of different screen resulutions that selected task was
  executed on.
* In the central area of report the actual screenshots are displayed. You can switch between
  diff, current and candidate versions using both arrow keys and mouse clicks (left click forwards,
  right click backwards).

## Mocks
Sometimes you may want to alter browser state by ensuring a request ends with a certain response.
You can do that by providing `mocks` object to your task's `config` section:

```javascript
// ...
config: {
    options: {
        viewportSize: [{width: 1100, height: 2500}]
    },
    mocks: {'modernizer.js': 'modernizr-notouch.js'}
}
// ...

```
where you map request to mock. Mocks must be located in `mocks/` subdirectory.

## Coverage

### General
The tests coverage feature, allows one to easily check, whether all possible subpages of a project are being tested.
Pediff does this by comparing a given set of routes, placed in `routes.json`, with test paths defined in individual tasks.

You can disable the tests coverage feature by setting `coverage` property of pediff `config` file to `false`.

```javascript
// ...
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
// ...

```

Coverage configuration allows you to set a different path to the routes file (e.g. when this file is generated
automatically), and define exceptions by explicitly mapping a path from routes definition to a path in a task file.
You may also choose to force checking of routes' optional fragments by setting the `skipOptional` flag to `false`.

### Report
Results of the test coverage check are presented in the pediff report, with an indication of tested viewport sizes,
media and files in which specific tasks are defined. Routes not tested with any tasks will be marked with red color,
and be included in the total coverage percentage.

### Extending
Currently coverage check is possible only for routes defined according to
[Backbone.js routes specification](http://backbonejs.org/#Router-extend). Support for custom routing setups can be
added by extending coverage Route prototype (located in `coverage/route.js`), and specifically by overriding the
following methods: `buildVariants`, `isFragmentOptional`, `isFragmentVariable`. More details can be found in comments
for these methods.
