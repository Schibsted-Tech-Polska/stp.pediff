var fs = require('q-io/fs'),
    path = require('path'),
    gm = require('gm'),
    q = require('q'),
    proc = require('child_process');

console.time('work took me');

var dirify = function dirify(path) {
    return __dirname + '/' + path;
};

var filterByExtensions = function filterByExtensions(extensions, filesList) {
    return filesList.filter(function(file) {
        var extension = file.split('.'),
            extension = extension[extension.length - 1];

        return extensions[extension];
    });
};

var jsOnly = filterByExtensions.bind(null, {
        js: 1
    }),
    imagesOnly = filterByExtensions.bind(null, {
        png: 1,
        jpg: 1
    }),
    pngOnly = filterByExtensions.bind(null, {
        png: 1
    }),
    jpgOnly = filterByExtensions.bind(null, {
        jpg: 1
    });

var imageSize = function imageSize(image) {
    var deffered = q.defer();

    gm(image).size(function(error, value) {
        if (error) {
            deffered.reject(new Error(error));
        } else {
            deffered.resolve({
                path: image,
                size: value
            });
        }
    });

    return deffered.promise;
};

var extentImage = function extentImage(image, size) {
    var deffered = q.defer();

    gm(image).extent(size.width, size.height)
        .write(image, function(error) {
            if (error) {
                deffered.reject(new Error(error));
            } else {
                deffered.resolve(image);
            }
        });

    return deffered.promise;
};

var equateImagesHeight = function equateImagesHeight(images) {
    var deffered = q.defer(),
        sizes = [];

    images.forEach(function(image) {
        image = __dirname + '/' + image;

        sizes.push(imageSize(image));
    });

    q.all(sizes)
        .then(function(images) {
            var lower, higher;
            if (images[0].size.height > images[1].size.height) {
                lower = 1;
                higher = 0;
            } else if (images[0].size.height < images[1].size.height) {
                lower = 0;
                higher = 1;
            } else {
                deffered.resolve(images);

                return deffered.promise;
            }

            extentImage(images[lower].path, images[higher].size)
                .then(function(image) {
                    deffered.resolve(image);
                })
                .fail(function(error) {
                    deffered.reject(error);
                });
        });

    return deffered.promise;
};

var compareImages = function compareImages(images, file) {
    var deffered = q.defer();

    gm.compare(images[0], images[1], {highlightColor: 'red2', file: file}, function (err, isEqual, equality) {
        if (err) {
            deffered.reject(new Error(err));
        } else {
            deffered.resolve({
                isEqual: isEqual,
                equality: equality
            })
        }
    });

    return deffered.promise;
};

var changeExtension = function changeExtension(ext, path) {
    return path.split('.')[0] + '.' + ext;
};

var toJpg = changeExtension.bind(null, 'jpg');

var stripToJpg = function stripToJpg(image, quality) {
    var deffered = q.defer(),
        jpg = toJpg(image);

    gm(image).noProfile().comment('').interlace('Plane').quality(quality)
        .write(jpg, function(error) {
            if (error) {
                deffered.reject(new Error(error));
            } else {
                deffered.resolve(image);
            }
        });

    return deffered.promise;
};

var exec = function exec(command) {
    var deffered = q.defer();

    proc.exec(command, function(error, stdout, stderr) {
        if (error) {
            deffered.reject({
                error: new Error(error),
                stdout: stdout
            });
        } else {
            deffered.resolve({
                stdout: stdout,
                stderr: stderr
            });
        }
    });

    return deffered.promise;
};

module.exports = {
    dirify: dirify,
    filterByExtensions: filterByExtensions,
    jsOnly: jsOnly,
    imagesOnly: imagesOnly,
    pngOnly: pngOnly,
    jpgOnly: jpgOnly,
    imageSize: imageSize,
    extentImage: extentImage,
    equateImagesHeight: equateImagesHeight,
    compareImages: compareImages,
    changeExtension: changeExtension,
    toJpg: toJpg,
    stripToJpg: stripToJpg,
    exec: exec
};