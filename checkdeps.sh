#!/bin/bash
# Check if all the dependencies are met by the system
dependencies=(python phantomjs casperjs compare)
for cmnd in "${dependencies[@]}"
do
    command -v ${cmnd} >/dev/null 2>&1 || { echo "${cmnd} is not installed." >&2; exit 1; }
done
if [ $(casperjs --version | sed -E 's/([a-zA-Z -]+)//' | tr -d '.') -lt 110 ]; then
    echo "Casperjs 1.1 or newer is required."
    exit 1
elif [ $(phantomjs --version | sed -E 's/([a-zA-Z -]+)//' | tr -d '.') -lt 181 ]; then
    echo "Phantomjs 1.8.1 or newer is required."
    exit 1
fi
