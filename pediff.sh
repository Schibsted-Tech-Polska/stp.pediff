#!/bin/bash
start=`date +%s`
mkdir -p candidate current diff
rm -f candidate/*
rm -f current/*
rm -f diff/*
# Start new phantomjs process for each task in /tasks directory. Run up to $1 processes at once if $1 is set
tasksRunning=0
echo "Taking screenshots..."
for file in `ls tasks/*.js | xargs -n 1 basename`;
do
    casperjs run.js ${file} &
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
    # Assign absolute number of pixels that are different to a variable
    ae=$(compare -metric AE ${file} ../current/${file} ../diff/${file} 2>&1)
    fsize=$(echo ${file} | grep -Eo '\d+x\d+' | tr 'x' '*' | bc)
    # Add relative error factor to the name of the files for sorting
    newfname=$(echo "$ae/$fsize" | sed -e 's/[eE]+*/\*10\^/' | bc -l | cut -c -9 | tr -d '.')_${file}
    mv ../diff/${file} ../diff/${newfname}
    mv ../candidate/${file} ../candidate/${newfname}
    mv ../current/${file} ../current/${newfname}
done
end=`date +%s`
runtime=$((end-start))
filecount=$(ls -1 *.png | wc -l | tr -d ' ')
cd ../
bash ./report.sh ${filecount} ${runtime} 
echo "Pediff has taken and compared ${filecount} screenshots in ${runtime} seconds."
