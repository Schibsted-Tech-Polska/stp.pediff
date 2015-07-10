var gulp = require('gulp'),
    g = require('gulp-load-plugins')();


gulp.task('sass', function() {
    gulp.src('./public/css/scss/**/*.scss')
        .pipe(g.plumber())
        .pipe(g.sourcemaps.init())
        .pipe(g.sass({
            outputStyle: 'compressed'
        }))
        .pipe(g.sourcemaps.write('./'))
        .pipe(gulp.dest('./public/css'))
        .pipe(g.livereload());
});

gulp.task('watch', function() {
    g.livereload.listen();
    gulp.watch('./public/css/scss/**/*.scss', ['sass']);
    gulp.watch([
        './public/index.html',
        './public/templates/**/*.html',
        './public/js/**/*.js'
    ], function(event) {
        if(event.path) {
            g.livereload.changed(event.path);
        }
    });
});

gulp.task('build', [,
    'sass'
]);

gulp.task('default', ['watch']);
