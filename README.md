# Stp.pediff

>A simple set of tools for visually comparing web pages built on top of
><a href="http://casperjs.org/" target="_blank">Casperjs</a> and ImageMagick
>and ImageMagick <a href="http://www.imagemagick.org/script/compare.php" target="_blank">compare</a>

## Table of Contents
* [What does it do?](#What-does-it-do)
* [Why does it do it?](#Why-does-it-do-it)
* [Dependencies](#Dependencies)
* [Usage](#Usage)
* [Reports](#Reports)
* [Mocks](#Mocks)

## What does it do?
Basically, Pediff executes a set of user defined tasks over two different versions of a website,
takes screenshots at desired moments and scans the output for differences.
Then it generates human-friendly report containing all the inconsistencies ordered by
relative number of differences.

## Why does it do it?
Pediff enables developers to detect entire class of visual problems invisible to
classic unit tests and only occasionally catchable by manual review. For more details on the topic
see this great talk by Brett Slatkin at Air Mozilla:
https://air.mozilla.org/continuous-delivery-at-google/ 

## Pediff in action:

![Pediff example](https://dl.dropboxusercontent.com/u/10807323/static/pediff.gif)

Normal use case would be to compare production version of your application with candidate one.
Example above is using Norwegian and Swedish version of Google homepage as a base for comparison.

## Dependencies
*   Unix-like operating system with Bash shell
*   [Casperjs](http://casperjs.org/) &geq; 1.1.0
*   ImageMagick [compare](http://www.imagemagick.org/script/compare.php) tool 

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
            urn: 'PATH/TO/RESOURCE'
            options: {
                viewportSize: {width: 1440, height: 900}
            },
            mocks: {}
        },
        execute: function(){
            this.save('home');
        }
    };
    ```
    Every task must contain two sections: `config` and `execute`. The `config` part will be merged
    with global config file before task execution. It serves the purpose of "creating a sandbox" for
    the task: subpage to open, screen resolution, user agent, response mocks - things like that.
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

5.  At this point `report.html` file should be sitting in project's directory. Open it with your
    browser and review results.

## Reports
Pediff generates convenient reports by default. Just open `report.html` file with your browser.

![Pediff report](https://dl.dropboxusercontent.com/u/10807323/static/pediffreport.jpg)

## Mocks
Sometimes you may want to alter browser state by ensuring a request ends with a certain response.
You can do that by providing `mocks` object to your task's `config` section:

```javascript
// ...
config: {
    options: {
        viewportSize: {width: 1100, height: 2500}
    },
    mocks: {'modernizer.js': 'modernizr-notouch.js'}
}
// ...

```
where you map request to mock. Mocks must be located in `mocks/` subdirectory.
