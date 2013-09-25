Array.unique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.getSortedKeys = function(obj,key,dir) {
    var arr = [];
    for(var id in obj) {
        var el = {id: id};
        el[key] = obj[id][key];
        arr.push(el);
    }

    arr.sort(function(a,b){
        if (a[key] < b[key])
            return (dir == 'asc') ? -1 : 1;
        if (a[key] > b[key])
            return (dir == 'asc') ? 1 : -1;
        return 0;
    });

    var keys = [];
    for(var i=0;i<arr.length;i++) {
        keys.push(arr[i].id);
    }

    return keys;
};

function base64Encode(inputStr)
{
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var outputStr = "";
    var i = 0;

    while (i < inputStr.length)
    {
        //all three "& 0xff" added below are there to fix a known bug
        //with bytes returned by xhr.responseText
        var byte1 = inputStr.charCodeAt(i++) & 0xff;
        var byte2 = inputStr.charCodeAt(i++) & 0xff;
        var byte3 = inputStr.charCodeAt(i++) & 0xff;

        var enc1 = byte1 >> 2;
        var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

        var enc3, enc4;
        if (isNaN(byte2))
        {
            enc3 = enc4 = 64;
        }
        else
        {
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            if (isNaN(byte3))
            {
                enc4 = 64;
            }
            else
            {
                enc4 = byte3 & 63;
            }
        }

        outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
    }

    return outputStr;
}
