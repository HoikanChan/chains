//更新最近会话的未读消息数
function updateSessDiv(sess_type, to_id, name, unread_msg_count) {
    var badgeDiv = document.getElementById("sessDiv_" + to_id);
    if (badgeDiv && unread_msg_count > 0) {
        if (unread_msg_count >= 100) {
            unread_msg_count = '99+';
        }
        let tips = $("#sessDiv_" + escapeJquery(to_id)).find('.app-chats-Tips');
        if(tips.length){
            tips.text(unread_msg_count);
        }else{
            var $html = `<span class="layui-badge app-chats-Tips">`+unread_msg_count+`</span>`;
            $("#sessDiv_" + escapeJquery(to_id)).prepend($html);
        }
    }
    var headUrl;
    if (sess_type == webim.SESSION_TYPE.C2C) {
        headUrl = friendHeadUrl;
    } else {
        headUrl = groupHeadUrl;
    }
    addSess(sess_type, to_id, name, headUrl, unread_msg_count);
}

//新增一条最近会话
function addSess(sess_type, to_id, name, face_url, unread_msg_count, addPositonType) {
    
    let info = db.get('chats.list').find({userId:parseInt(to_id)}).value();

    var sessDivId = "sessDiv_" + to_id;
    var sessDiv = document.getElementById(sessDivId);
    if (sessDiv) { //先判断是否存在会话DIV，已经存在，则不需要增加
        var first_id = sessDiv.parentNode.firstElementChild.id;
        if(first_id == sessDivId){
            return;
        }else{
            var first_html = $('#' + escapeJquery(sessDivId)).prop("outerHTML");
            $('#' + escapeJquery(sessDivId)).remove();
            $(first_html).prependTo($('.app-chats-list'));
            $('#' + escapeJquery(sessDivId)).click(function() {
                if ($(this).attr('class') == "app-chat-centre-user-item active") return;
                relName = $(this).find('.app-chat-centre-user-item-text').text();
                onSelSess(sess_type, to_id,relName);
            });
            return;
        }
        
    }
    var sessList = $('.app-chats-list');
    //如果当前选中的用户是最后一个用户
    //sessDiv.className = "sessinfo";
    if(sess_type != webim.SESSION_TYPE.GROUP){
        if(info){
            if(name != info.realName){
                name = info.realName;
            }
        }
    }

    if (name.length > maxNameLen) { //名称过长，截取一部分
        name = name.substr(0, maxNameLen) + "...";
    }

    if(!face_url){
        face_url = '../assets/images/7.png';
        if(info){
            if(info.picUrl){
                face_url = fileDomain + info.picUrl;
            }else{
                face_url = (info.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
            }
        }
    }

    var $li = $('<li>'),$img = $('<img>'),$span = $('<span>'),$p = $('<p>');
    var $li1 = $li.clone().addClass('app-chats-list-item').attr({'id':sessDivId,"data-id":to_id});

    $li1.click(function() {
        if ($li.attr('class') == "app-chats-list-item active") return;
        relName = $(this).find('.app-chat-centre-user-item-text').text();
        onSelSess(sess_type, to_id,relName);
    });

    // var delchat = document.createElement("div");
    // delchat.className = 'delChat';
    // delchat.innerHTML = '删除会话';
    // delchat.onclick = function(e) {
    //     
    // }

    //var $span3 = $span.clone().addClass('app-chats-delChat').html(`<i class="layui-icon layui-icon-close-fill"></i>`);
    //$span3.click(function(e){
    //     if (sess_type == 'C2C') {
    //         sess_type = 1;
    //         //webim.setAutoRead(selSess, true, false);
    //     } else {
    //         sess_type = 2;
    //         // webim.groupMsgReaded({
    //         //     "GroupId": to_id,
    //         //     "MsgReadedSeq": selSess._impl.curMaxMsgSeq
    //         // })
    //     }
    //     delChat(sess_type, to_id);
    //     e.preventDefault();
    //     e.stopPropagation();
    //     return false;
    // });
    var $img1 = $img.clone().addClass('layui-circle').attr('src',face_url);
    var $span1 = $span.clone().addClass('app-chat-centre-user-item-text').attr('id','nameDiv_' + to_id).html(name);
    var $span2 = $span.clone().addClass('app-chats-last-time').text('11:20');
    var $p1 = $p.clone().addClass('app-chats-item-text');

    // var $div2 = $div.clone().addClass('app-chat-centre-user-item-heard').attr('id','faceImg_' + to_id);
    // var nameDiv = document.createElement("div");

    // var $img1 = $img.clone().attr('src',face_url);
    // var $div3 = $div.clone().addClass('app-chat-centre-user-item-name');
    // var $span1 = $span.clone().addClass('app-chat-centre-user-item-text').attr('id','nameDiv_' + to_id).html(name);
    // var $span2 = $span.clone().addClass('app-chat-centrt-user-time').text('11:20');
    // var $p1 = $p.clone().addClass('app-chat-centre-user-item-content');
    //getNewMsg(sess_type,to_id);
    
    
    $li1.append($img1).append($span1).append($span2).append($p1);

    // var badgeDiv = document.createElement("div");
    // if (unread_msg_count > 0) {
    //     if (unread_msg_count >= 100) {
    //         unread_msg_count = '99+';
    //     }
    //     badgeDiv.innerHTML = "<span>" + unread_msg_count + "</span>";
    //     badgeDiv.style.display = "block";
    // }
    if (!addPositonType || addPositonType == 'TAIL') {
        sessList.append($li1); //默认插入尾部
    } else if (addPositonType == 'HEAD') {
        sessList.before($li1); //插入头部
        $li1.prependTo(sessList);
        //$('.app-chat-right-user-name').text(name);
    } else {
        console.log(webim.Log.error('未知addPositonType' + addPositonType));
    }
}

//删除会话

function delChat(sess_type, to_id) {

    var data = {
        'To_Account': to_id,
        'chatType': sess_type
    }
    webim.deleteChat(
        data,
        function(resp) {
            $("#sessDiv_" + escapeJquery(to_id)).remove();
        }
    );
}

//切换好友或群组聊天对象
function onSelSess(sess_type, to_id,relName) {
    
    ipcRenderer.send('tray-canceltwinkle');

    if(formData.formData){
        formData.formData.splice(0,formData.formData.length);
    }

    if(sess_type != webim.SESSION_TYPE.GROUP){
        $('#app-conversation').show();
        $('#app-meeting').hide();
        $('.app-chat-more').attr('data-status','1');
    }else{
        $('#app-conversation').hide();
        $('#app-meeting').show();
        SetGroupInfo(to_id);
        $('.app-chat-more').attr('data-status','2');
    }
    
    $('.app-chat-right-box').show();
    if (selToID != null) {
        //将之前选中用户的样式置为未选中样式
        setSelSessStyleOff(selToID);
        
        //设置之前会话的已读消息标记
        webim.setAutoRead(selSess, false, false);

        //保存当前的消息输入框内容到草稿
        //获取消息内容
        var msgtosend = $('#send_msg_text').text();
        var msgLen = webim.Tool.getStrBytes(msgtosend);
        if (msgLen > 0) {
            webim.Tool.setCookie("tmpmsg_" + selToID, msgtosend, 3600);
        }
    }
    //聊天框名称设置
    $('.app-chat-left-head').find('p').text(relName);

    //清空聊天界面
    $('.app-chat-left-center').empty();

    selToID = to_id;
    //设置当前选中用户的样式为选中样式
    setSelSessStyleOn(to_id);

    var tmgmsgtosend = webim.Tool.getCookie("tmpmsg_" + selToID);
    if (tmgmsgtosend) {
        $("#send_msg_text").text(tmgmsgtosend);
    } else {
        $("#send_msg_text").text('');
    }

    bindScrollHistoryEvent.reset();

    // var sessMap = webim.MsgStore.sessMap(); //获取到之前已经保存的消息
    
    // var sessCS = webim.SESSION_TYPE.GROUP + selToID;
    // if (sessMap && sessMap[sessCS]) { //判断之前是否保存过消息
    //     selType = webim.SESSION_TYPE.GROUP
    //     bindScrollHistoryEvent.init();
    //     function compare(property) {
    //         return function(a, b) {
    //             var value1 = a[property];
    //             var value2 = b[property];
    //             return value1 - value2;
    //         }
    //     }
    //     var sessMapOld = sessMap[sessCS]._impl.msgs.sort(compare('time'));
        
    //     for (var i = 0; i < sessMapOld.length; i++) {
    //         addMsg(sessMapOld[i]); //显示已经保存的消息
    //     }
    // } else {
        
        if (sess_type == webim.SESSION_TYPE.GROUP) {
            if (selType == webim.SESSION_TYPE.C2C) {
                selType = webim.SESSION_TYPE.GROUP;
            }
            selSess = null;
            webim.MsgStore.delSessByTypeId(selType, selToID);
            getLastGroupHistoryMsgs(function(msgList) {
                getHistoryMsgCallback(msgList);
                bindScrollHistoryEvent.init();
            }, function(err) {
                //alert(err.ErrorInfo);
            });

        } else {
            if (selType == webim.SESSION_TYPE.GROUP) {
                selType = webim.SESSION_TYPE.C2C;
            }
            //如果是管理员账号，则为全员推送，没有历史消息
            if (selToID == AdminAcount) {
                var sess = webim.MsgStore.sessByTypeId(selType, selToID);
                if (sess && sess.msgs() && sess.msgs().length > 0) {
                    getHistoryMsgCallback(sess.msgs());
                } else {
                    getLastC2CHistoryMsgs(function(msgList) {
                        getHistoryMsgCallback(msgList);
                        bindScrollHistoryEvent.init();
                    }, function(err) {
                        //alert(err.ErrorInfo);
                    });
                }
                return;
            }
            
            //拉取漫游消息
            getLastC2CHistoryMsgs(function(msgList) {
                getHistoryMsgCallback(msgList);
                if(!relName){
                    relName = selSess._impl.name;
                }
                webim.setAutoRead(selSess, false, false);
                $('.app-chat-left-head').find('p').text(relName);
                //绑定滚动操作
                bindScrollHistoryEvent.init();
            }, function(err) {
                //alert(err.ErrorInfo);
            });
        }
    // }
}

function SetFriendInfo(to_id){
    $('#app-video').show();
    $('#app-voice').show();
    let info = db.get('chats.list').value()[to_id];

    var  picUrl = fileDomain + info.picUrl;
    if(info.picUrl == null || info.picUrl == ''){
        picUrl = (info.sex == '女')?'../assets/images/6.png':'../assets/images/7.png';
    }
    $('.app-chat-friend-datum').find('img').attr('src',picUrl);
    $('.app-chat-friend-datum').find('.app-chat-friend-datum-name').text(info.realName);
    $('.app-chat-friend-datum').find('.app-chat-friend-datum-position').text(info.position);
    $('.app-chat-friend-datum').find('.app-chat-friend-datum-dianhua').text(info.userPhone);
    let introduce =  info.introduce?info.introduce:`<span class="color1">未设置</span>`;
    $('.app-chat-friend-datum').find('.app-chat-friend-datum-introduce').html(introduce);
    $('.app-chat-right-c2c-body').show();
    $('.app-chat-right-group-body').hide();
}

function SetGroupInfo(to_id){
    getGroupInfo(to_id,function(res){
        info = res.GroupInfo[0];
        var userList = [];
        $.each(info.MemberList,(i,item)=>{
            userList.push(item.Member_Account);
        });
        utility.currencyAjax('post','user/info',JSON.stringify({'userIds':userList}),function(res){
            if(res.code === '000'){
                var list = res.data;
                db.set('group.userList.'+to_id,list).write();
            }else{
                console.log(res);
            }
        });
    });
}


//删除会话
function deleteSessDiv(sess_type, to_id) {
    var sessDiv = document.getElementById("sessDiv_" + to_id);
    sessDiv && sessDiv.parentNode.removeChild(sessDiv);
}


//更新最近会话的名字
function updateSessNameDiv(sess_type, to_id, newName) {

    var nameDivId = "nameDiv_" + to_id;
    var nameDiv = document.getElementById(nameDivId);
    if (nameDiv) {
        if (newName.length > maxNameLen) { //帐号或昵称过长，截取一部分
            newName = newName.substr(0, maxNameLen) + "...";
        }
        nameDiv.innerHTML = webim.Tool.formatText2Html(newName);
    }
}

//更新最近会话的头像
function updateSessImageDiv(sess_type, to_id, newImageUrl) {
    if (!newImageUrl) {
        return;
    }
    var faceImageId = "faceImg_" + to_id;
    var faceImage = document.getElementById(faceImageId);
    if (faceImage) {
        faceImage.innerHTML = webim.Tool.formatText2Html(newImageUrl);
    }
}

function setSelSessStyleOn(newSelToID) {

    var selSessDiv = document.getElementById("sessDiv_" + newSelToID);
    $("#sessDiv_" + escapeJquery(newSelToID)).find('.app-chats-Tips').remove();
    if (selSessDiv) {
        selSessDiv.classList.add("active");  //设置当前选中用户的样式为选中样式
    } else {
        webim.Log.warn("不存在selSessDiv: selSessDivId=" + "sessDiv_" + newSelToID);
    }
    var selBadgeDiv = document.getElementById("badgeDiv_" + newSelToID);
    if (selBadgeDiv) {
        selBadgeDiv.style.display = "none";
    } else {
        webim.Log.warn("不存在selBadgeDiv: selBadgeDivId=" + "badgeDiv_" + selToID);
    }
}

function setSelSessStyleOff(preSelToId) {
    var preSessDiv = document.getElementById("sessDiv_" + preSelToId);
    $("#sessDiv_" + escapeJquery(preSelToId)).find('.app-chats-Tips').remove();
    if (preSessDiv) {
        preSessDiv.classList.remove("active"); //将之前选中用户的样式置为未选中样式
    } else {
        webim.Log.warn("不存在preSessDiv: selSessDivId=" + "sessDiv_" + preSelToId);
    }
}