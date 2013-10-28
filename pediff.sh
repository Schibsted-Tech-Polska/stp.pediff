#!/bin/bash
start=`date +%s`
mkdir -p candidate current diff
rm -rf candidate/*
rm -rf current/*
rm -rf diff/*
mkdir -p candidate/hq current/hq diff/hq candidate/html current/html
rm -f report.json
touch report.json
rm -f paths.json
touch paths.json
# Start new phantomjs process for each task in /tasks directory. Run up to $1 processes at once if $1 is set
tasksRunning=0
echo "Taking screenshots..."
for file in `ls tasks/*.js | xargs -n 1 basename`;
do
    casperjs run.js --web-security=no ${file} &
    tasksRunning=$(($tasksRunning+1))
    if [[ $1 && $tasksRunning -ge $1 ]]; then
        wait
        tasksRunning=0
    fi
done
wait
# Use ImageMagick compare tool to render perceptual diffs between candidate and current pages
echo "Calculating differences..."
cd candidate/
for file in *.png;
do
    candidate=${file};
    current=../current/${file};

    if [ ! -f ${candidate} -o ! -f ${current} ]
    then
       continue
    fi

    canH=$(identify -format %h ${candidate});
    currH=$(identify -format %h ${current});
    # Compare files dimensions and extend them if necessary
    if [ "$canH" -gt "$currH" ]; then
        convert ${current} -gravity north -extent $(identify -format %w ${current})x${canH} ${current}
    fi
    if [ "$currH" -gt "$canH" ]; then
       convert ${candidate} -gravity north -extent $(identify -format %w ${candidate})x${currH} ${candidate}
    fi
    # Assign absolute number of pixels that are different to a variable
    ae=$(compare -dissimilarity-threshold 1 -metric AE ${candidate} ${current} ../diff/${file} 2>&1)
    fsize=$(echo ${file} | grep -Po '\d+x\d+' | tr 'x' '*' | bc)
    # Add relative error factor to the name of the files for sorting
    factor=$(echo "$ae/$fsize" | sed -e 's/[eE]+*/\*10\^/' | bc -l | cut -c -9 | tr -d '.')
    newfname=${factor}_${file}
    mv ../diff/${file} ../diff/${newfname}
    mv ../candidate/${file} ../candidate/${newfname}
    mv ../current/${file} ../current/${newfname}
done

echo "Generating previews..."
for env in diff candidate current
do
   cd ../${env}
   for file in *.png;
   do
        if [ ! -f ${file} ]
       then
          continue
       fi
      convert ${file} -strip -interlace Plane -quality 75% ${file%.png}.jpg
      mv ${file} hq/${file}
   done
done

end=`date +%s`
runtime=$((end-start))
filecount=$(ls -1 *.jpg | wc -l | tr -d ' ')
cd ../
echo "Generating report..."
casperjs report.js
casperjs coverage.js
echo "Pediff has taken and compared ${filecount} screenshots in ${runtime} seconds."

