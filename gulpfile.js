var browserSync = require('browser-sync'),
    gulp = require('gulp'),
    $ = require('gulp-load-plugins')();


function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('sync', function() {
    browserSync.init({
        server: {
            baseDir: "./public/"
        }
    });
});

gulp.task('sass', function() {
    gulp.src('./public/css/scss/**/*.scss')
        .pipe($.plumber({
            errorHandler: handleError
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'compressed'
        }))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return gulp.src('./public/js/almond.js')
        .pipe($.requirejsOptimize({
            enforceDefine: true,
            name: 'almond',
            include: ['globals', 'bootstrap'],
            insertRequire: ['bootstrap'],
            mainConfigFile: './public/js/bootstrap.js',
            optimize: 'none',
            paths: {
                'text': 'vendor/requirejs/text',
                'templates': '../templates',
                'jquery': 'empty:',
                'lodash': 'empty:',
                'backbone': 'empty:',
                'materialize': 'vendor/materialize.amd'
            },
            out: "bootstrap.min.js"
        }))
        .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function() {
    gulp.watch('./public/css/scss/**/*.scss', ['sass']);
    gulp.watch([
        './public/index.html',
        './public/templates/**/*.html',
        './public/js/**/*.js'
    ]).on('change', browserSync.reload);
});

gulp.task('lint', function() {
    return gulp
        .src([
            './lib/*.js',
            './public/js/*.js',
            './public/collections/**/*.js',
            './public/models/**/*.js',
            './public/utils/**/*.js',
            './public/views/**/*.js',
            '!./public/js/bootstrap.min.js',
            '!./public/js/almond.js'
        ])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')));
});

gulp.task('watch:lint', ['lint'], function() {
    gulp.watch([
        './lib/*.js',
        './public/js/*.js',
        './public/collections/**/*.js',
        './public/models/**/*.js',
        './public/utils/**/*.js',
        './public/views/**/*.js',
        '!./public/js/bootstrap.min.js',
        '!./public/js/almond.js'
    ], ['lint']);
});

gulp.task('build', [,
    'sass'
]);

gulp.task('default', $.sequence('watch', 'sync'));
