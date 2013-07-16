#!/bin/bash
echo "Generating html report..."
cd diff/
differentCount=$(ls *.png | sort -gr | grep -P '^([0-9]{2,})' | wc -l)
html="<!DOCTYPE html>
<html>
    <head>
        <meta charset=\"utf-8\">
        <title>Pediff report</title>
        <link href=\"http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.no-icons.min.css\" rel=\"stylesheet\" />
        <style>
            body {background-color: #eeeeee}
            a {cursor: pointer}
            a:hover, a:focus, a:active {outline: none}
            #pediff {color: #000}
            #pediff:hover, #pediff:focus, #pediff:active {text-decoration: none}
            ul {list-style: none; margin: 0}
            h4 small {margin-left: .5em}
            li {padding-bottom: 3em}
            img {border: 1px solid #bebebe; display: block; background-color: #fff}
            .closer {margin-top: -10px}
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"page-header\">
                <h1><a href=\"#\" id=\"pediff\">pediff</a><small>report</small></h1>
                <h6 class=\"closer\">`date +'%Y-%m-%d %H:%M:%S'`</h6>
                <h6 class=\"closer\">${1} screenshots taken & compared in ${2} seconds. ${differentCount} images differ.</h6>
                <p><strong>USAGE: </strong>Left click on the images to toggle between screenshots of current
                and candidate versions of the page. Right clik to bring back perceptual diff.</p>
            </div>
            <ul>"
# iterate through the files ordered descendingly by the relative number of differences > 0
fileNumber=1
for file in `ls *.png | sort -gr | grep -P '^([0-9]{2,})'`;
do
    html="${html}<li><h4><a href=\"#${file}\" id=\"${file}\">${file}</a><small>diff</small>
    <span class=\"pull-right\">${fileNumber} / ${differentCount}</span></h4>
    <img src=\"diff/${file}\" alt=\"${file}\" /><a href=\"#pediff\">&#9650; Go to top</a></li>"
    fileNumber=$(($fileNumber+1))
done
html="${html}</ul></div>
        <script type=\"text/javascript\" src=\"http://code.jquery.com/jquery-1.10.0.min.js\"></script>
        <script type=\"text/javascript\">
            function flip(object, newState){
                var from = object.attr('src').split('/')[0], src = null, header = null;
                console.log(from);
                if (newState === 'toggle') {
                    src = object.attr('src').replace(from, (from === 'current')?'candidate':'current'),
                    header = object.prev().find('small').html((from === 'current')?'candidate':'current');
                } else {
                    src = object.attr('src').replace(from, newState),
                    header = object.prev().find('small').html(newState);
                }
                object.attr('src', src);
                object.find('small').html(header);
            }
            \$('img').click(function(event){
                        if(event.which === 1){
                            flip(\$(this), 'toggle');
                        }
                    }).bind('contextmenu', function(){ flip(\$(this), 'diff'); return false;});
        </script>
    </body>
</html>"
cd ../
echo ${html} > report.html
