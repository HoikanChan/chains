
//弹出发图对话框
function selectPicClick() {
    //判断浏览器版本
    if (webim.BROWSER_INFO.type == 'ie' && parseInt(webim.BROWSER_INFO.ver) <= 9) {
        //if(1==1){
        $('#updli_form')[0].reset();
        $('#upload_pic_low_ie_dialog').modal('show');
    } else {
        $('#upd_form')[0].reset();
        var preDiv = document.getElementById('previewPicDiv');
        preDiv.innerHTML = '';
        var progress = document.getElementById('upd_progress'); //上传图片进度条
        progress.value = 0;
        //$('#upload_pic_dialog').modal('show');
    }
}
//选择图片触发事件

function fileOnChange(uploadFile) {

    if (!window.File || !window.FileList || !window.FileReader) {
        alert("您的浏览器不支持File Api");
        return;
    }

    var file = uploadFile.files[0];
    var fileSize = file.size;

    //先检查图片类型和大小
    if (!checkPic(uploadFile, fileSize)) {
        return;
    }

    //预览图片
    var reader = new FileReader();
    var preDiv = document.getElementById('previewPicDiv');
    reader.onload = (function(file) {
        return function(e) {
            preDiv.innerHTML = '';
            var span = document.createElement('span');
            span.innerHTML = '<img class="img-responsive" src="' + this.result + '" alt="' + file.name + '" />';
            //span.innerHTML = '<img class="img-thumbnail" src="' + this.result + '" alt="' + file.name + '" />';
            preDiv.insertBefore(span, null);
        };
    })(file);
    //预览图片
    reader.readAsDataURL(file);
}

//上传图片进度条回调函数
//loadedSize-已上传字节数
//totalSize-图片总字节数

function onProgressCallBack(loadedSize, totalSize) {
    var progress = document.getElementById('upd_progress'); //上传图片进度条
   //progress.value = (loadedSize / totalSize) * 100;
}

//上传图片

function uploadPic(uploadFiles,type) {
    // var uploadFiles = document.getElementById('upd_pic');
    if(type){
        var file = uploadFiles;
    }else{
        var file = uploadFiles.files[0];
    }
    var businessType; //业务类型，1-发群图片，2-向好友发图片
    if (selType == webim.SESSION_TYPE.C2C) { //向好友发图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.C2C_MSG;
    } else if (selType == webim.SESSION_TYPE.GROUP) { //发群图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
    }
    //封装上传图片请求
    var opt = {
        'file': file, //图片对象
        'onProgressCallBack': onProgressCallBack, //上传图片进度条回调函数
        //'abortButton': document.getElementById('upd_abort'), //停止上传图片按钮
        'To_Account': selToID, //接收者
        'businessType': businessType //业务类型
    };
    //上传图片
    webim.uploadPic(opt,
        function(resp) {
            //上传成功发送图片
            sendPic(resp, file.name);
            //$('#upload_pic_dialog').modal('hide');
        },
        function(err) {
            alert(err.ErrorInfo);
        }
    );
}

//上传图片(用于低版本IE)

function uploadPicLowIE() {
    var businessType; //业务类型，1-发群图片，2-向好友发图片
    if (selType == webim.SESSION_TYPE.C2C) { //向好友发图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.C2C_MSG;
    } else if (selType == webim.SESSION_TYPE.GROUP) { //发群图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
    }
    //封装上传图片请求
    var opt = {
        'formId': 'updli_form', //上传图片表单id
        'fileId': 'updli_file', //file控件id
        'To_Account': selToID, //接收者
        'businessType': businessType //图片的使用业务类型
    };
    webim.submitUploadFileForm(opt,
        function(resp) {
            $('#upload_pic_low_ie_dialog').modal('hide');
            //发送图片
            sendPic(resp);
        },
        function(err) {
            $('#upload_pic_low_ie_dialog').modal('hide');
            alert(err.ErrorInfo);
        }
    );
}

//上传图片(通过base64编码)

function uploadPicByBase64(fileSize,base64Str) {
    var businessType; //业务类型，1-发群图片，2-向好友发图片
    if (selType == webim.SESSION_TYPE.C2C) { //向好友发图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.C2C_MSG;
    } else if (selType == webim.SESSION_TYPE.GROUP) { //发群图片
        businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.GROUP_MSG;
    }
    console.log(base64Str);
    //封装上传图片请求
    var opt = {
        'toAccount': selToID, //接收者
        'businessType': businessType, //图片的使用业务类型
        'fileMd5': '6f25dc54dc2cd47375e8b43045de642a', //图片md5
        'totalSize': fileSize, //图片大小,Byte
        'base64Str': base64Str,//图片base64编码
    };

    webim.uploadPicByBase64(opt,
        function(resp) {
            //alert('success');
            console.log(resp);
            //发送图片
            sendPic(resp);
        },
        function(err) {
            console.log(err);
        }
    );
}

//发送图片消息

function sendPic(images, imgName) {
    //console.debug('sendPic', imgName);
    if (!selToID) {
        alert("您还没有好友，暂不能聊天");
        return;
    }

    if (!selSess) {
        var selSess = new webim.Session(selType, selToID, selToID, friendHeadUrl, Math.round(new Date().getTime() / 1000));
    }
    var msg = new webim.Msg(selSess, true, -1, -1, -1, loginInfo.identifier, 0, loginInfo.identifierNick);

    //console.debug(imgName.split(".")[1]);
    var images_obj = new webim.Msg.Elem.Images(images.File_UUID, imgName.split(".")[1]);
    for (var i in images.URL_INFO) {
        var img = images.URL_INFO[i];
        var newImg;
        var type;
        switch (img.PIC_TYPE) {
            case 1: //原图
                type = 1; //原图
                break;
            case 2: //小图（缩略图）
                type = 3; //小图
                break;
            case 4: //大图
                type = 2; //大图
                break;
        }
        newImg = new webim.Msg.Elem.Images.Image(type, img.PIC_Size, img.PIC_Width, img.PIC_Height, img.DownUrl);
        images_obj.addImage(newImg);
    }
    msg.addImage(images_obj);
    //if(imgName){
    //    var data=imgName;//通过自定义消息中的data字段保存图片名称
    //    var custom_obj = new webim.Msg.Elem.Custom(data, '', '');
    //    msg.addCustom(custom_obj);
    //}
    $('#send_msg_text').empty();
    //调用发送图片消息接口
    webim.sendMsg(msg, function(resp) {
        if (selType == webim.SESSION_TYPE.C2C) { //私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
            addMsg(msg);
        }
    }, function(err) {
        alert(err.ErrorInfo);
    });
}
//检查文件类型和大小

function checkPic(obj, fileSize,type) {
    var picExts = 'jpg|jpeg|png|bmp|gif|webp|image/png';
    if(type == "1"){
        var photoExt = obj.name.substr(obj.name.lastIndexOf(".") + 1).toLowerCase(); //获得文件后缀名
    }else if(type == "2"){
        var photoExt = obj.type.substr(obj.name.lastIndexOf(".") + 1).toLowerCase();
    }else{
        var photoExt = obj.value.substr(obj.value.lastIndexOf(".") + 1).toLowerCase(); //获得文件后缀名
    }
    var pos = picExts.indexOf(photoExt);
    if (pos < 0) {
        //alert("您选中的文件不是图片，请重新选择");
        //console.log('您选中的文件不是图片，请重新选择');
        return false;
    }
    fileSize = Math.round(fileSize / 1024 * 100) / 100; //单位为KB
    if (fileSize > 30 * 1024) {
        //alert("您选择的图片大小超过限制(最大为30M)，请重新选择");
       // console.log('您选择的图片大小超过限制(最大为30M)，请重新选择');
        return false;
    }
    return true;
}

//单击图片事件
function imageClick(imgObj) {
    // var imgUrls = imgObj.src;
    // var imgUrlArr = imgUrls.split("#"); //字符分割
    // var smallImgUrl = imgUrlArr[0]; //小图
    // var bigImgUrl = imgUrlArr[1]; //大图
    // var oriImgUrl = imgUrlArr[2]; //原图
    // var bigPicDiv = document.getElementById('bigPicDiv');
    // bigPicDiv.innerHTML = '';
    // var span = document.createElement('span');
    // span.innerHTML = '<img class="img-thumbnail" src="' + bigImgUrl + '" />';
    // bigPicDiv.insertBefore(span, null);
    // $('#click_pic_dialog').modal('show');
}