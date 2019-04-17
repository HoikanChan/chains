const electron = require('electron');   
const {ipcRenderer} = electron;
var invitationMembers = [];
var user = JSON.parse(db.get('user.info').value());
var RTC = user.rtc;
var privateMapKey = '';

ipcRenderer.on('synchronous-webim',(event,webims,members)=>{
    webim.SetCTX(webims);
    invitationMembers = members;
    login();
});

ipcRenderer.on('synchronous-join',(event,RoomID)=>{
    join(RoomID);
});

var FetchSigCgi = 'https://www.qcloudtrtc.com/sxb_dev/?svc=account&cmd=authPrivMap';
var sdkAppID = RTC.sdkAppId,
    accountType = 36862, // accounttype 还是在文档中会找到
    userSig,
    username,
    roomId,
    ext = 'mettingInvite'; //// 消息元素对象(自定义)属性：扩展字段

var receiveInviteDialog = document.querySelector('#receive-invite-dialog');

$('#nw_setmin_btn').click(function(){
    ipcRenderer.send('nw_min');
});
$('#nw_close_btn').click(function(){
    if(RTC){
        onWebSocketClose();
    }
    ipcRenderer.send('nw_close');
});

// webRTC 部分
function onKickout() {
    console.error("on kick out!");
}

function onRelayTimeout(msg) {
    console.error("onRelayTimeout!" + (msg ? JSON.stringify(msg) : ""));
}

function createVideoElement( id, isLocal ){
    var videoDiv=document.createElement("div");
    var width = '100%';
    var height = '100%';
    videoDiv.innerHTML = '<video id="'+id+'" autoplay '+ (isLocal ? 'muted':'') +' playsinline height='+height+' width='+width+'></video>';
    if(isLocal){
        videoDiv.classList.add('local-video');
        document.querySelector("#remote-video-wrap").appendChild(videoDiv);
        $("#remote-video-console-list").append("<li class='app-meeting-console-personnel-item'><span class='app-meeting-video-identification'>我</span></li>");
    }else{
        videoDiv.classList.add('other-video');
        $("#remote-video-console-list").append(`<li class='app-meeting-console-personnel-item'>`+videoDiv.innerHTML+'</li>');
    }
    return document.getElementById(id);
}

function onLocalStreamAdd(info) {

    if (info.stream && info.stream.active === true)
    {
        var id = "local";
        var video = document.getElementById(id);
        if(!video){
            createVideoElement(id, true);
        }
        var video = document.getElementById(id)
        video.srcObject = info.stream;
        video.muted = true
        video.autoplay = true
        video.playsinline = true
    }
}

function onRemoteStreamUpdate( info ) {
    if (info.stream && info.stream.active === true)
    {
        var id = info.videoId;
        var video = document.getElementById(id);
        if(!video){
            video = createVideoElement(id);
        }
        video.classList.add('other-user-video');
        video.srcObject = info.stream;
    } else{
        console.log('欢迎用户'+ info.userId+ '加入房间');
    }
}

function onRemoteStreamRemove( info ) {
    console.log( info.userId+ ' 断开了连接');
    var videoNode = document.getElementById( info.videoId );
    if( videoNode ){
        videoNode.srcObject = null;
        document.getElementById(info.videoId).parentElement.removeChild(videoNode);
        $('#'+info.videoId).parents('.app-meeting-console-personnel-item').remove();
    }
}

function onWebSocketClose() {
    RTC.quit();
}

function initRTC(opts){
    // 初始化
    window.RTC = new WebRTCAPI({
        "useCloud": Bom.query("useCloud") || 0 ,
        "userId": opts.userId,
        "userSig": opts.userSig,
        "sdkAppId": opts.sdkappid,
        "accountType": opts.accountType
    },function(){
        RTC.createRoom({
            roomid : opts.roomid * 1,
            privateMapKey: opts.privateMapKey,
            role : "user",
            pureAudioPush: parseInt($("#pstnBizType").val() || 0),
            pstnPhoneNumber:  $("#pstnPhoneNumber").val()
        });
    },function( error ){
        console.log("init error", error)
    });

    // 远端流新增/更新
    RTC.on("onRemoteStreamUpdate",onRemoteStreamUpdate)
    // 本地流新增
    RTC.on("onLocalStreamAdd",onLocalStreamAdd)
    // 远端流断开
    RTC.on("onRemoteStreamRemove",onRemoteStreamRemove)
    // 重复登录被T
    RTC.on("onKickout",onKickout)
    // 服务器超时
    RTC.on("onRelayTimeout",onRelayTimeout)
    // just for debugging
    // RTC.on("*",function(e){
    //     console.debug(e)
    // });

    RTC.on("onErrorNotify", function( info ){
        console.error( info )
        /* info {
            errorCode: xxxx,
            errorMsg: "xxxxx"
        } */
    });
}

Bom = {
    /**
     * @description 读取location.search
     *
     * @param {String} n 名称
     * @return {String} search值
     * @example
     *      $.bom.query('mod');
     */
    query:function(n){ 
        var m = window.location.search.match(new RegExp( "(\\?|&)"+n+"=([^&]*)(&|$)"));   
        return !m ? "":decodeURIComponent(m[2]);  
    },
    getHash:function(n){
        var m = window.location.hash.match(new RegExp( "(#|&)"+n+"=([^&]*)(&|$)"));
        return !m ? "":decodeURIComponent(m[2]);  
    }
};

function login(){
    sdkappid = sdkAppID;
    userId = RTC.identifier;
    //请使用英文半角/数字作为用户名
    $.ajax({
        type: "put",
        url: "http://company.zqyzk.com/api/v1/rtc/createRoom",
        dataType: 'json',
        data:JSON.stringify({"members":[invitationMembers]}),
        headers:{
            "Content-Type":"application/json",
            "Authorization":user.token
        },
        success: function (json) {
            if(json && json.code ==="000" ){
                roomId = json.data.roomId;
                //一会儿进入房间要用到
                 privateMapKey = json.data.privMapEncrypt;
                 // 页面处理，显示视频流页面
                 $("#video-section").show();
                 $(".open-chat").hide();
                 createRoom();
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
    userId = RTC.identifier;
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
                console.log(json);
                //一会儿进入房间要用到
                var privateMapKey = json.data.privateMapKey;
                // 页面处理，显示视频流页面
                $("#video-section").show();
                $(".open-chat").hide();
                initRTC({
                    "userId": userId,
                    "userSig": RTC.userSig,
                    "privateMapKey": privateMapKey,
                    "sdkappid": RTC.sdkAppId,
                    "accountType": RTC.accountType,
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

// IM创建房间
function createRoom() {
    var groupID = roomId;
    var groupType = 'ChatRoom';
    console.log(invitationMembers);
    var options = {
      'GroupId': groupID,
      'Owner_Account': userId,
      'Type': groupType, //Private/Public/ChatRoom/AVChatRoom
      'ApplyJoinOption': 'FreeAccess',
      'Name': groupID +'',
      'Notification': "",
      'Introduction': "",
      'MemberList': invitationMembers,
    };
    webim.createGroup(
        options,
        function (resp) {
            console.log('webimCreateRoomSuccess!');
            initRTC({
                "userId": userId,
                "userSig": RTC.userSig,
                "privateMapKey": privateMapKey,
                "sdkappid": RTC.sdkAppId,
                "accountType": RTC.accountType,
                "roomid": roomId
            });
            sendCustomMsg(ext,resp.GroupId);
        },
        function (err) {
            if (err.ErrorCode == 10025) {
                console.log('webimCreateRoomError!');
                console.log(err); 
            } else if (err.ErrorCode == 10021) {
                console.log(err.ErrorCode + 'GROUP_IS_ALREADY_USED!');
            } else {
                console.log('webimCreateRoomError!');
                console.log(err);
            }
        }
    );
}

//IM加入房间
function joinRoom(groupID) {
    webim.applyJoinGroup({
        GroupId: groupID
    }, function (resp) {
        if (resp.JoinedStatus && resp.JoinedStatus == 'JoinedSuccess') {
            console.log('webimJoinRoomSuccess!');
        }
    },function (err) {
        if (err.ErrorCode == 10013) { // 被邀请加入的用户已经是群成员,也表示成功
            console.log('webimJoinRoomSuccessAlreadyInRoom!');
        } else {
            console.log('webimJoinRoomFailed!');
            console.log(err);
        }
    });
}

// IMListener,IM登陆时需要
var IMListener = {
    // 监听新消息函数，必填
    onMsgNotify(msgs) {
        if (msgs.length) { // 如果有消息才处理
            var chatMsgs = [];
            msgs.forEach(msg => {
                if(!msg.getIsSend()){ // 消息不为自己发送时处理
                    var sess = msg.getSession();
                    var fromUserId = msg.getFromAccount()
                    var msgType = sess.type();
                    // 如果是群组消息
                    //if (msgType === 'GROUP') {
                        var groupid = sess.id();
                        if (groupid == roomId) {
                            msg.getElems().forEach(elem => {
                                if(elem.getContent().getExt() == 'videoInvite'){ // 接收到视频邀请
                                    console.log('reciveVideoInvitefrom:' + fromUserId);
                                    if(!window.RTC){
                                        receiveInviteDialog.show();
                                        $("#input-container").hide();
                                    } else {
                                        console.log('AlreadyInVideoConnection');
                                    }
                                }  else if(elem.getContent().getExt() == 'videoAccept') { //视频邀请被接受
                                    console.log(fromUserId + 'acceptedVideoInvite');
                                }
                            })
                        }
                   //} 
                }
            });
        }
    },

    // 监听（多终端同步）群系统消息事件，必填
    onGroupSystemNotifys: {},

};

// IM发送自定义群组消息
function sendCustomMsg(ext, GroupId) {
    var sessionType = webim.SESSION_TYPE.GROUP,// 会话类型：群聊
        subType = webim.GROUP_MSG_SUB_TYPE.COMMON, // 消息类型：普通消息
        name = "meeting_"+GroupId, //房间名称
        isSend = true, //是否为自己发送
        seq = -1, //消息序列，-1表示 SDK 自动生成，用于去重
        random = Math.round(Math.random() * 4294967296), //消息随机数，用于去重
        msgTime = Math.round(new Date().getTime() / 1000), //消息时间戳
        // 消息元素对象(自定义)属性
        data = 'data', // 数据
        desc = 'desc'; // 描述
    
    var selSess  = new webim.Session(sessionType, GroupId, name, '', msgTime, seq); //一个会话对象
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, RTC.identifier, subType); //一条消息对象
    var custom_obj = new webim.Msg.Elem.Custom(roomId + '', desc, ext); //消息元素对象(自定义)
    msg.addCustom(custom_obj);

    webim.sendMsg(msg, function (resp) {
        if(!window.RTC){
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