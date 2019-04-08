/*
 * App Entry
 * (c) Copyright 2018 beaut. All Rights Reserved. 
 */
const {ipcRenderer,clipboard,shell} = require('electron');
const glob = require("glob");
const user = JSON.parse(db.get('user.info').value());
const im = user.im;
const rtc = user.rtc;
const Token = user.token;
const fileDomain = user.fileDomain;
const organs = user.organs;
const appVersion = require('../package.json').version;

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

function judgeDate(oldDate) {

    //昨天的时间
    var day1 = new Date();
    day1.setDate(day1.getDate() - 1);
    var yesterday = day1.format("yyyy-MM-dd");

    //今天的时间
    var day2 = new Date();
    day2.setTime(day2.getTime());
    var today = day2.format("yyyy-MM-dd");

    if(oldDate.split(" ")[0] == today){
        return oldDate.substr(11,5);
    }else if(oldDate.split(" ")[0] == yesterday){
        return "昨天";
    }else{
        return oldDate.split(" ")[0].substr(5,5);
    }

}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


function Testing(){

    utility.ajax('get','versions/getLastVersion',{type:0},function(res){
        if(res && res.code === "000"){
            let data = res.data;
            let version = appVersion.split('.');
            let new_version = data.version.split('.');
            if (version[0] < new_version[0] || version[1] < new_version[1] || version[2] < new_version[2]) {
                layer.confirm('检测到新版本，是否现在更新？', {
                    btn: ['确定','取消'] //按钮
                }, function(){
                    layer.close();
                    ipcRenderer.send('update-download',data);
                });
            }
        }
    });

}
