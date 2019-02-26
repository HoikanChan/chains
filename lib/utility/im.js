var accountMode = 0;

var sdkAppID = im.sdkAppId;
var accountType = im.accountType;

var msgflow = document.getElementsByClassName("app-chat-left-center")[0];

var userDetails = db.get('user.details').value();

//当前用户身份
var loginInfo = {
  'sdkAppID': sdkAppID, //用户所属应用id,必填
  'identifier': im.identifier, //当前用户ID,必须是否字符串类型，必填
  'accountType': accountType, //用户所属应用帐号类型，必填
  'userSig': im.userSig,
  //当前用户身份凭证，必须是字符串类型，必填
  'identifierNick': null, //当前用户昵称，不用填写，登录接口会返回用户的昵称，如果没有设置，则返回用户的id
  'headurl': '' //当前用户默认头像，选填，如果设置过头像，则可以通过拉取个人资料接口来得到头像信息
};

var AdminAcount = 'qwe101';
var selType = 'C2C'; //当前聊天类型
var selToID = null; //当前选中聊天id（当聊天类型为私聊时，该值为好友帐号，否则为群号）
var selSess = ''; //当前聊天会话对象
var recentSessMap = {}; //保存最近会话列表
var reqRecentSessCount = 50; //每次请求的最近会话条数，业务可以自定义

var isPeerRead = 1; //是否需要支持APP端已读回执的功能,默认为0。是：1，否：0。

//默认好友头像
var friendHeadUrl = ''; //仅demo使用，用于没有设置过头像的好友
//默认群头像
var groupHeadUrl = '../assets/images/head.jpg'; //仅demo使用，用于没有设置过群头像的情况


//存放c2c或者群信息（c2c用户：c2c用户id，昵称，头像；群：群id，群名称，群头像）
var infoMap = {}; //初始化时，可以先拉取我的好友和我的群组信息


var maxNameLen = 6; //我的好友或群组列表中名称显示最大长度，仅demo用得到
var reqMsgCount = 15; //每次请求的历史消息(c2c获取群)条数，仅demo用得到

var pageSize = 15; //表格的每页条数，bootstrap table 分页时用到
var totalCount = 200; //每次接口请求的条数，bootstrap table 分页时用到

var emotionFlag = false; //是否打开过表情选择框

var curPlayAudio = null; //当前正在播放的audio对象

var getPrePageC2CHistroyMsgInfoMap = {}; //保留下一次拉取好友历史消息的信息
var getPrePageGroupHistroyMsgInfoMap = {}; //保留下一次拉取群历史消息的信息

var defaultSelGroupId = null; //登录默认选中的群id，选填，仅demo用得到

//监听（多终端同步）群系统消息方法，方法都定义在receive_group_system_msg.js文件中
//注意每个数字代表的含义，比如，
//1表示监听申请加群消息，2表示监听申请加群被同意消息，3表示监听申请加群被拒绝消息
var onGroupSystemNotifys = {
  "1": onApplyJoinGroupRequestNotify, //申请加群请求（只有管理员会收到）
  "2": onApplyJoinGroupAcceptNotify, //申请加群被同意（只有申请人能够收到）
  "3": onApplyJoinGroupRefuseNotify, //申请加群被拒绝（只有申请人能够收到）
  "4": onKickedGroupNotify, //被管理员踢出群(只有被踢者接收到)
  "5": onDestoryGroupNotify, //群被解散(全员接收)
  "6": onCreateGroupNotify, //创建群(创建者接收)
  "7": onInvitedJoinGroupNotify, //邀请加群(被邀请者接收)
  "8": onQuitGroupNotify, //主动退群(主动退出者接收)
  "9": onSetedGroupAdminNotify, //设置管理员(被设置者接收)
  "10": onCanceledGroupAdminNotify, //取消管理员(被取消者接收)
  "11": onRevokeGroupNotify, //群已被回收(全员接收)
  "15": onReadedSyncGroupNotify, //群消息已读同步通知
  "255": onCustomGroupNotify, //用户自定义通知(默认全员接收)
  "12": onInvitedJoinGroupNotifyRequest //邀请加群(被邀请者接收,接收者需要同意)
};

//监听好友系统通知函数对象，方法都定义在receive_friend_system_msg.js文件中
var onFriendSystemNotifys = {
  "1": onFriendAddNotify, //好友表增加
  "2": onFriendDeleteNotify, //好友表删除
  "3": onPendencyAddNotify, //未决增加
  "4": onPendencyDeleteNotify, //未决删除
  "5": onBlackListAddNotify, //黑名单增加
  "6": onBlackListDeleteNotify //黑名单删除
};

var onC2cEventNotifys = {
  "92": onMsgReadedNotify, //消息已读通知,
  "96": onMultipleDeviceKickedOut
};

//监听资料系统通知函数对象，方法都定义在receive_profile_system_msg.js文件中
var onProfileSystemNotifys = {
  "1": onProfileModifyNotify //资料修改
};

//监听连接状态回调变化事件
var onConnNotify = function (resp) {
  var info;
  switch (resp.ErrorCode) {
    case webim.CONNECTION_STATUS.ON:
      webim.Log.warn('建立连接成功: ' + resp.ErrorInfo);
      break;
    case webim.CONNECTION_STATUS.OFF:
      info = '连接已断开，无法收到新消息，请检查下你的网络是否正常: ' + resp.ErrorInfo;
      // alert(info);
      webim.Log.warn(info);
      break;
    case webim.CONNECTION_STATUS.RECONNECT:
      info = '连接状态恢复正常: ' + resp.ErrorInfo;
      // alert(info);
      webim.Log.warn(info);
      break;
    default:
      webim.Log.error('未知连接状态: =' + resp.ErrorInfo);
      break;
  }
};

//IE9(含)以下浏览器用到的jsonp回调函数
function jsonpCallback(rspData) {
  webim.setJsonpLastRspData(rspData);
}

//监听事件
var listeners = {
  "onConnNotify": onConnNotify, //监听连接状态回调变化事件,必填
  "jsonpCallback": jsonpCallback, //IE9(含)以下浏览器用到的jsonp回调函数，
  "onMsgNotify": onMsgNotify, //监听新消息(私聊，普通群(非直播聊天室)消息，全员推送消息)事件，必填
  "onBigGroupMsgNotify": onBigGroupMsgNotify, //监听新消息(直播聊天室)事件，直播场景下必填
  "onGroupSystemNotifys": onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，如果不需要监听，可不填
  "onGroupInfoChangeNotify": onGroupInfoChangeNotify, //监听群资料变化事件，选填
  "onFriendSystemNotifys": onFriendSystemNotifys, //监听好友系统通知事件，选填
  "onProfileSystemNotifys": onProfileSystemNotifys, //监听资料系统（自己或好友）通知事件，选填
  "onKickedEventCall": onKickedEventCall, //被其他登录实例踢下线
  "onC2cEventNotifys": onC2cEventNotifys, //监听C2C系统消息通道
  //"onAppliedDownloadUrl": onAppliedDownloadUrl, //申请文件/音频下载地址的回调
  "onLongPullingNotify": function (data) {
  }
};

var isAccessFormalEnv = true; //是否访问正式环境

var isLogOn = false; //是否开启sdk在控制台打印日志

//初始化时，其他对象，选填
var options = {
  'isAccessFormalEnv': isAccessFormalEnv, //是否访问正式环境，默认访问正式，选填
  'isLogOn': isLogOn //是否开启控制台打印日志,默认开启，选填
}

webimLogin();

var bindScrollHistoryEvent = {
  init: function () {
    msgflow.onscroll = function () {
      if (msgflow.scrollTop == 0) {
        if (selType == webim.SESSION_TYPE.C2C) {
          getPrePageC2CHistoryMsgs();
        } else {
          getPrePageGroupHistoryMsgs();
        }

      }
    }
  },
  reset: function () {
    msgflow.onscroll = null;
  }
};