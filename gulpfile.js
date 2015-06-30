var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');

gulp.task('watch', function() {
    plugins.livereload.listen();
    gulp.watch('public/index.html', []).on('change', function(file) {
        plugins.livereload.changed(file.path);
    });
    gulp.watch('public/js/**/*', []).on('change', function(file) {
        plugins.livereload.changed(file.path);
    });
    gulp.watch('public/css/**/*.scss', ['styles']);
});

gulp.task('styles', function() {
    return gulp.src('public/css/**/*.scss')
        .pipe(plugins.compass({
            css: 'public/css',
            sass: 'public/css',
            image: 'public/img',
            font: 'public/fonts'
        }))
        .pipe(gulp.dest('public/css'))
        .pipe(plugins.livereload());
});

gulp.task('default', ['watch']);
