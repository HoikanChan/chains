const electron = require('electron');   
const {ipcRenderer} = electron;
var selToID = '';
var user = JSON.parse(db.get('user.info').value());
var rtc = user.rtc;
var RTC;

ipcRenderer.on('synchronous-voice',(event,webims,selToIDs)=>{
    webim.SetCTX(webims);
    selToID = selToIDs;
    login();
});

ipcRenderer.on('synchronous-voice-join',(event,RoomID)=>{
    join(RoomID);
});

$('#nw_setmin_btn').click(function(){
    ipcRenderer.send('nw_min');
});
$('#nw_close_btn').click(function(){
    if(RTC){
        onWebSocketClose();
    }
    ipcRenderer.send('nw_close');
});

$('#colse-voice').click(function(){
    if(RTC){
        onWebSocketClose();
    }
    ipcRenderer.send('nw_close');
});

var FetchSigCgi = 'https://www.qcloudtrtc.com/sxb_dev/?svc=account&cmd=authPrivMap';
var sdkAppID = rtc.sdkAppId,
    accountType = 14418, // accounttype 还是在文档中会找到
    userSig,
    username,
    ext = 'voiceInvite';


function onKickout() {
    alert("on kick out!");
}

function onRelayTimeout(msg) {
    alert("onRelayTimeout!" + (msg ? JSON.stringify(msg) : ""));
}


function SatrtTime() {
    var defaultTime = 0;
    var timer = null;
    var hours,minutes,seconds,liftTime,time;
    timer = setInterval(function() {
        defaultTime++;
        //有多少小时
        hours =parseInt(defaultTime / (60*60));
        //计算小时候剩余的时间
        liftTime = defaultTime % (60*60);
        //多少分钟
        minutes =parseInt(liftTime /60);
        //秒
        seconds =parseInt(liftTime %60);
        time = (hours >9? hours :'0'+ hours) +':'
        + (minutes >9? minutes :'0'+ minutes) +':'
        + (seconds >9? seconds :'0'+ seconds);
        $('#time').html(time);
    },1000)
};

function createAudioElement( id, isLocal ){
    SatrtTime();
    var audioNode=document.createElement("audio");
    audioNode.id = id;
    audioNode.autoplay = 'true';
    if( isLocal ){
        audioNode.muted = 'true';
    }
    audioNode.controls = 'true';
    document.querySelector("#remote-video-wrap").appendChild(audioNode);
    return audioNode;
}

function getComputerAudio( callback ){
    // funciont 1
    // 枚举音频输入设备 -> 先获取PC的音频混流设备
    // 具体是哪个 device，这里每台电脑恐怕都不一样。
    // 可能是最后一个？
    // device 的item会像这样：{"label":"扬声器 (Realtek High Definition Audio)","deviceId":"95a3e76b348d181fca042eada7428dcf98df9d0129fb9a5c7a54619d3428387c"}
   /* 
     RTC.getAudioDevices(function(devices) {
       
        var device = devices[ devices.length - 1];
        console.error( devices[0])
        // 这个音频流包含麦克风和PC电脑音频
        RTC.getLocalStream({
            video:false,
            audio:true,
            audioDevice:device
        },function( info ){
            callback( info.stream )
        });
    });
   */

    // funciont 2
    // 目前测试 ，使用PC的默认输出是可以的。
    // audioDevice:{
    //     deviceId:"default"
    // }
    RTC.getLocalStream({
        video:false,
        audio:true,
        audioDevice:{
            deviceId:"default"
        }
    },function( info ){
        callback( info.stream )
    });
}
function addComputer() {
    RTC.stopRTC({},function(){
        getComputerAudio( function( pc_stream){
            RTC.startRTC({
                stream: pc_stream,
                role: 'user'
            });
        })
    })
}
function soundMeter( info ){
    
    console.debug(' meter start')
    // 分析音频流
    var meter = WebRTCAPI.SoundMeter({
        stream: info.stream,
        onprocess: function( data ){
            $("#volume").val( data.volume)
            $("#volume_str").text( "volume: "+ data.volume)
            $("#status").text( data.status )
        }
    })
    setTimeout( function(){
        console.debug(' meter stop')
        meter.stop();
     },10000);
}
function onLocalStreamAdd(info) {
    if (info.stream && info.stream.active === true)
    {
        var id = "local";
        var audio = document.getElementById(id);
        if(!audio){
            audio = createAudioElement(id, true);
        }
        audio.srcObject = info.stream;
    }
    soundMeter( info );
}


function onRemoteStreamUpdate( info ) {
    if (info.stream && info.stream.active === true)
    {
        //SatrtTime();
        RTC.startRTC({
            stream: info,
            role: 'user'
        });
        var id = info.videoId;
        var audio = document.getElementById(id);
        if(!audio){
            audio = createAudioElement(id);
        }
        audio.srcObject = info.stream;
    } else{
        console.log('欢迎用户'+ info.userId+ '加入房间');
    }
}


function onRemoteStreamRemove( info ) {
    console.log( info.userId+ ' 断开了连接');
    var audioNode = document.getElementById( info.videoId );
    if( audioNode ){
        audioNode.srcObject = null;
        document.querySelector("#remote-video-wrap").removeChild(audioNode);
    }
}

function onWebSocketClose() {
    RTC.quit();
}

function gotStream( succ ){
    RTC.getLocalStream({
        video:false, //不采集视频
        audio:true
    },function(info){
        var stream = info.stream;
        succ ( stream )
    });
}

function initRTC(opts){
    // 初始化
    window.RTC = new WebRTCAPI({
        "userId": opts.userId,
        "userSig": opts.userSig,
        "sdkAppId": opts.sdkappid,
    });
    RTC.createRoom({
        roomid : opts.roomid * 1,
        privMap: 255,
        recordId: $("#recordId").val() || null,
        pureAudioPushMod: $("#pureAudioPushMod").val(),
    },function(){
        gotStream(function(stream){
            RTC.startRTC({
                stream: stream,
                role: 'user'
            });
        })
    });

    // 远端流新增/更新
    RTC.on("onRemoteStreamUpdate",onRemoteStreamUpdate)
    // 本地流新增
    RTC.on("onLocalStreamAdd",onLocalStreamAdd)
    // 远端流断开
    RTC.on("onRemoteStreamRemove",onRemoteStreamRemove)
    // 重复登录被T
    RTC.on("onKickout",onKickout)
    RTC.on("onErrorNotify",function(e){ console.error(e); });
    // 服务器超时
    RTC.on("onRelayTimeout",onRelayTimeout)
    // just for debugging
    RTC.on("*",function(e){ console.debug(e);});
}

function login(){
    sdkappid = sdkAppID;
    userId = rtc.identifier;
    //请使用英文半角/数字作为用户名
    $.ajax({
        type: "put",
        url: "http://company.zqyzk.com/api/v1/rtc/createRoom",
        dataType: 'json',
        data:JSON.stringify({"members":[selToID]}),
        headers:{
            "Content-Type":"application/json",
            "Authorization":user.token
        },
        success: function (json) {
            if(json && json.code ==="000" ){
                roomId = json.data.roomId;
                sendCustomMsg(ext);
                //一会儿进入房间要用到
                 var privateMapKey = json.data.privMapEncrypt;
                 // 页面处理，显示音频流页面
                 initRTC({
                     "userId": userId,
                     "userSig": rtc.userSig,
                     "privateMapKey": privateMapKey,
                     "sdkappid": rtc.sdkAppId,
                     "accountType": accountType,
                     "roomid": json.data.roomId
                 });
            }else{
                console.error(json);
            }
        },
        error: function (err){
            console.error(err);
        }
    })
}

function join(roomId){
    sdkappid = sdkAppID;
    userId = rtc.identifier;
    $.ajax({
        type: "get",
        url: "http://company.zqyzk.com/api/v1/rtc/joinRoom/"+roomId,
        dataType: 'json',
        headers:{
            "Content-Type":"application/json",
            "Authorization":user.token
        },
        success: function (json) {
            if(json && json.code ==="000" ){
                //一会儿进入房间要用到
                var privateMapKey = json.data.privateMapKey;
                // 页面处理，显示视频流页面
                $("#video-section").show();
                $(".open-chat").hide();
                initRTC({
                    "userId": userId,
                    "userSig": rtc.userSig,
                    "privateMapKey": privateMapKey,
                    "sdkappid": rtc.sdkAppId,
                    "accountType": rtc.accountType,
                    "roomid": json.data.roomId
                });
            }else{
                console.error(json);
            }
        },
        error: function (err){
            console.error(err);
        }
    })

}


// IM发送自定义群组消息
function sendCustomMsg(ext) {
    var sessionType = webim.SESSION_TYPE.C2C,// 会话类型：私聊
        subType = webim.C2C_MSG_SUB_TYPE.COMMON, // 群消息子类型：普通消息
        name = "123", //房间名称
        isSend = true, //是否为自己发送
        seq = -1, //消息序列，-1表示 SDK 自动生成，用于去重
        random = Math.round(Math.random() * 4294967296), //消息随机数，用于去重
        msgTime = Math.round(new Date().getTime() / 1000), //消息时间戳
        // 消息元素对象(自定义)属性
        data = 'data', // 数据
        desc = 'desc'; // 描述
    
    var selSess  = new webim.Session(sessionType, selToID, selToID, '', msgTime, seq); //一个会话对象
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, selToID, subType); //一条消息对象
    var custom_obj = new webim.Msg.Elem.Custom(roomId + '', desc, ext); //消息元素对象(自定义)
    msg.addCustom(custom_obj);

    webim.sendMsg(msg, function (resp) {
        if(!RTC){
            console.log('sendCustomMsgSuccess!');
        } else{
            console.log('sendCustomMsgSuccessAlreadInitRTC!');
        }
    },
    function (err) {
        console.error(err);
        return false;
    });
}