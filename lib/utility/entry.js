/*
 * App Entry
 * (c) Copyright 2018 beaut. All Rights Reserved. 
 */
const {ipcRenderer,clipboard} = require('electron');
const glob = require("glob");
const user = JSON.parse(db.get('user.info').value());
const im = user.im;
const rtc = user.rtc;
const Token = user.token;
const fileDomain = user.fileDomain;

//js
var requires = (url, callback) => {
    jQuery.ajax({
        type: 'get',
        async:false,
        url: url,
        data: undefined,
        contentType: "text/javascript;charset=utf-8",
        dataType: "script",
        global: true,
        success: callback,
        error: (e) => {
            if (e.status != 200) {
                console.log(e);
                console.log('error loading ' + url);
            }
        }
    });
};

var timestampToTime = (timestamp, date = false) => {
    var time = new Date(timestamp * 1000);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    if (date) {
        return y + '-' + add0(m) + '-' + add0(d);
    }
    return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
};

var add0 = (m) => {
    return m < 10 ? '0' + m : m
};

var escapeJquery  = function(srcString) {  
    // 转义之后的结果  
    var escapseResult = srcString;  

    // javascript正则表达式中的特殊字符  
    var jsSpecialChars = ["\\", "^", "$", "*", "?", ".", "+", "(", ")", "[",  
            "]", "|", "{", "}"];  

    // jquery中的特殊字符,不是正则表达式中的特殊字符  
    var jquerySpecialChars = ["~", "`", "@", "#", "%", "&", "=", "'", "\"",  
            ":", ";", "<", ">", ",", "/"];  

    for (var i = 0; i < jsSpecialChars.length; i++) {  
        escapseResult = escapseResult.replace(new RegExp("\\"  
                                + jsSpecialChars[i], "g"), "\\"  
                        + jsSpecialChars[i]);  
    }  

    for (var i = 0; i < jquerySpecialChars.length; i++) {  
        escapseResult = escapseResult.replace(new RegExp(jquerySpecialChars[i],  
                        "g"), "\\" + jquerySpecialChars[i]);  
    }  

    return escapseResult;  
}

requires(path.join(__dirname, '../lib/sdk/webim.js'),function(){
    const IM_files = glob.sync(path.join(__dirname, '../lib/IM/**/*.js'));
    IM_files.forEach((file) => { requires(file) })
    setTimeout(function(){
        requires(path.join(__dirname, '../lib/utility/im.js'));
    },500);
});



