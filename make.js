var fs = require('q-io/fs'),
    path = require('path'),
    gm = require('gm'),
    q = require('q'),
    proc = require('child_process');

console.time('work took me');

var dirify = function dirify (path) {
  return __dirname + '/' + path;
};

var filterByExtensions = function filterByExtensions (extensions, filesList) {
  return filesList.filter(function (file) {
    var extension = file.split('.'),
        extension = extension[extension.length - 1];

    return extensions[extension];
  });
};

var jsOnly = filterByExtensions.bind(null, {js: 1}),
    imagesOnly = filterByExtensions.bind(null, {png: 1, jpg: 1}),
    pngOnly = filterByExtensions.bind(null, {png: 1}),
    jpgOnly = filterByExtensions.bind(null, {jpg: 1});

var imageSize = function imageSize (image) {
  var deffered = q.defer();

  gm(image).size(function (error, value) {
    if (error) {
      deffered.reject(new Error(error));
    } else {
      deffered.resolve({path: image, size: value});
    };
  });

  return deffered.promise;
};

var extentImage = function extentImage (image, size) {
  var deffered = q.defer();

  gm(image).extent(size.width, size.height)
  .write(image, function (error) {
    if (error) {
      deffered.reject(new Error(error));
    } else {
      deffered.resolve(image);
    };
  });

  return deffered.promise;
};

var equateImagesHeight = function equateImagesHeight (images) {
  var deffered = q.defer(),
      sizes = [];

  images.forEach(function (image) {
    image = __dirname + '/' + image;
    
    sizes.push(imageSize(image));
  });

  q.all(sizes)
  .then(function (images) {
    if (images[0].size.height > images[1].size.height) {
      var lower = 1,
          higher = 0; 
    } else if (images[0].size.height < images[1].size.height) {
      var lower = 0,
          higher = 1;
    } else {
      deffered.resolve(images);

      return deffered.promise;
    };

    extentImage(images[lower].path, images[higher].size)
    .then(function (image) {
      deffered.resolve(image);
    })
    .fail(function (error) {
      deffered.reject(error);
    });
  });

  return deffered.promise;
};

var compareImages = function compareImages (images, file) {
  var deffered = q.defer();

  // gonna be a bit ugly, but there’s some bug in gm.compare()
  // it dosen’t return any info if has options object provided
  // do not change without checking, please
  gm.compare(images[0], images[1], function (error, isEqual, equality, raw) {
    if (error) {
      deffered.reject(new Error(error));
    } else {
      gm.compare(images[0], images[1], {file: file}, function (error) {
        if (error) {
          deffered.reject(new Error(error));
        } else {
          deffered.resolve({isEqual: isEqual, equality: equality}); 
        };
      });
    };
  });

  return deffered.promise;
};

var changeExtension = function changeExtension (ext, path) {
  return path.split('.')[0] + '.' + ext;
};

var toJpg = changeExtension.bind(null, 'jpg');

var stripToJpg = function stripToJpg (image, quality) {
  var deffered = q.defer(),
      jpg = toJpg(image);

  gm(image).noProfile().comment('').interlace('Plane').quality(quality)
  .write(jpg, function (error) {
    if (error) {
      deffered.reject(new Error(error));
    } else {
      deffered.resolve(image);
    };
  });

  return deffered.promise;
};

var exec = function exec (command) {
  var deffered = q.defer();

  proc.exec(command, function (error, stdout, stderr) {
    if (error) {
      deffered.reject({error: new Error(error), stdout: stdout});
    } else {
      deffered.resolve({stdout: stdout, stderr: stderr});
    };
  });

  return deffered.promise;
};

var directories      = ['candidate', 'current', 'diff'],
    innerDirectories = ['candidate/hq', 'current/hq', 'diff/hq',
                        'candidate/html', 'current/html', 'candidate/html/failed',
                        'current/html/failed'],
    jsonFiles        = ['report.json', 'paths.json'];

q.fcall(function () {
  var removed = [];

  directories.forEach(function (dir) {
    removed.push(fs.removeTree(dir));
  });

  return q.all(removed)
})
.then(function () {
  var created = [];

  directories.forEach(function (dir) {
    created.push(fs.makeDirectory(dir));
  });

  return q.all(created);
})
.then(function () {
  var created = [];

  innerDirectories.forEach(function (dir) {
    created.push(fs.makeDirectory(dir));
  });

  return q.all(created);
})
.then(function (res) {
  var created = [];

  jsonFiles.forEach(function (file) {
    created.push(fs.write(file, ''));
  });

  return q.all(created);
})
.then(function () {
  console.log('ready to execute your tasks, master \n');
  return fs.list('tasks');
})
.then(function (tasks) {
  console.log('screenshots are being taken… \n');
  var done = [];

  jsOnly(tasks).forEach(function (task) {
    var path = 'casperjs run.js --web-security=no ' + task,
        result = exec(path);

    console.log('start ' + task + ' task \n');
    
    result
    .then(function (msg) {
      console.log(task + ' task completed');
      console.log(msg.stdout);
    })
    .fail(function (msg) {
      console.error(task + ' failed');
      // console.error(msg.error);
      // stdout is, in fact, more interesting, than error msg, even when task failed
      console.log(msg.stdout);
      process.exit();
    });

    done.push(result);
  });

  return q.all(done);
})
.then(function () {
  console.log('all tasks executed. screenshots are taken \n');

  var imagesLists = ['candidate', 'current'].map(function (dir) {
    return fs.list(dir);
  });

  return q.all(imagesLists);
})
.then(function (imagesLists) {
  console.log('pediff is calculating differences between your screenshots, master… \n');

  var promiseChain = q.fcall(function(){});

  imagesLists = imagesLists.map(function (list) {
    return imagesOnly(list);
  });

  imagesLists[0].forEach(function (image) {

    var promiseLink = function () {
      var file = image,
          current = 'current/' + file, 
          diff = 'diff/' + file,
          candidate = 'candidate/' + file,
          deffered = q.defer();

      equateImagesHeight([current, candidate])
      .then(function () {
        return compareImages([dirify(current), dirify(candidate)], dirify(diff))
      })
      .then(function (res) {
        var diffFactor = String(10 * (1 - res.equality)).replace('.','').substring(0, 8),
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
.then(function () {
  console.log('the time has come. previews are being generated \n');

  var promiseChain = q.fcall(function(){});

  directories.forEach(function (dir) {
    var promiseLink = function () {
      var deffered = q.defer();

      fs.list(dir)
      .then(function (list) {
        var stripped = [];

        imagesOnly(list).forEach(function (image) {
          stripped.push(stripToJpg(dir + '/' + image));
        });

        deffered.resolve(q.all(stripped));
      })      

      return deffered.promise;
    }

    promiseChain = promiseChain.then(promiseLink);
  })  

  return promiseChain;
})
.then(function (chain) {
  var promiseChain = q.fcall(function(){});

  directories.forEach(function (dir) {
    var promiseLink = function () {
      var deffered = q.defer();

      fs.list(dir)
      .then(function (list) {
        var moved = [];

        pngOnly(list).forEach(function (image) {
          moved.push(fs.move(dir + '/' + image, dir + '/hq/' + image));
        });

        deffered.resolve(q.all(moved));
      })      

      return deffered.promise;
    }

    promiseChain = promiseChain.then(promiseLink);
  })  

  return promiseChain;
})
.then(function () {
  console.log('now relax yourself and let me generate your report… \n');
  return exec('casperjs report.js');
})
.then(function (res) {
  return exec('casperjs coverage.js');
})
.then(function (res) {
  return fs.list('diff');
})
.then(function (list) {
  var screensTaken = imagesOnly(list).length;
  console.log('aye sir! pediff has finished his work! \n');
  console.log(screensTaken + ' screenshots has been taken');
  console.timeEnd('work took me');
  console.log('\nthank you for your cooperation. bye');
})
.fail(function (error) {
  console.error(error)
})
.done();