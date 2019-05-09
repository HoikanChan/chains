var setting = {
    cropImgData: null
};

setting.event = ()=>{
    $('body').on('click','#se_close_btn',function(){
        // ipc.send($('.app-setting-head-title').text().trim() === '个人信息'?'userInfowin_close':'resetPswWin_close');
        layer.closeAll();
    });
    $('body').on('click','#app-setting-header',function(){
        $('#app-setting-header-input').click();
    })
    $('body').on('click','#enable-nickname-edit',function(){
        $('#app-setting-nickname').prop('disabled',false)
        $('#app-setting-nickname').focus();
    })
    $('body').on('click','#enable-phone-edit',function(){
        $('#app-setting-phone').prop('disabled',false)
        $('#app-setting-phone').focus();
    })
    $('body').on('change','#app-setting-header-input',function(e){
        selectImg($(this)[0]);
    });
    // 提交个人信息
    $('body').on('click','#app-setting-update-btn',function(){
        var File = $('#app-setting-header-input')[0];
        var form = {};

        form['realName'] = $('#app-setting-nickname').val();
        form['sex'] = $('.app-setting-sex:checked').val();
        form['contactPhone'] = $('#app-setting-phone').val();

        
        if(!form['contactPhone'].match(/^1\d{10}$/)){
            layer.msg('请输入正确手机号');
            return false;
        }
        
        if(setting.cropImgData){
            UploadFile(File,form,Update);
        }else{
            Update(form);
        }

    })
    // 提交修改密码
    $('body').on('click','#app-setting-sub-password',function(){
        let old_psd = $('#old_psd').val();
        let new_psd = $('#new_psd').val();
        let confirm_psd = $('#confirm_psd').val();

        let new_password = new_psd.match(/^[\S]{6,12}$/);
        let confirm_password = confirm_psd.match(/^[\S]{6,12}$/);
        
        if(!new_password){
            layer.msg('新密码格式错误，请输入6-12位字符');
            return false;
        }

        if(!confirm_password){
            layer.msg('确认密码格式错误，请输入6-12位字符');
            return false;
        }

        if(new_psd !== confirm_psd){
            layer.msg('两次输入密码不一致');
            return false;
        }

        let obj = {
            oldPwd:old_psd,
            newPwd:new_psd,
            newPwd2:confirm_psd
        }

        utility.currencyAjax('post','user/resetPwd',JSON.stringify(obj),function(res){
            if(res.code == '000'){
                layer.msg('修改成功');
                $('#old_psd').val('');
                $('#new_psd').val('');
                $('#confirm_psd').val('');
            }else{
                layer.msg(res.message);
            }
        });

    });

    $('body').on('click','#app-logout',function(){
        ipcRenderer.send('logout');
    });
    
    $('body').on('click','#app-testing',function(){
        Testing();
    });

}

setting.event();


//图像上传
function selectImg(file) {

    if (!file.files || !file.files[0]) {
        alert('请选择图片');
        return;
    }

    var fileel = file.files[0];
    var imgSize = fileel.size;

    if (imgSize > 2 * 1024 * 1024) {
        alert('上传的图片的大于2M,请重新选择');
        $('#app-setting-header-input').val('');
        return false;
    }
    var reader = new FileReader();

    reader.onload = function (evt) {
        var replaceSrc = evt.target.result;
        //更换cropper的图片
        // $('#app-setting-header img').prop('src', replaceSrc);
        const link = document.querySelector('link#cropAvatar[rel="import"]');
        const template = link.import.querySelector('.modal-template')
        let clone = document.importNode(template.content, true)
        const cropLayer = layer.open({
            type: 1,
            title: false,
            offset: 'auto',
            skin: 'app-setting-avatar-modals-box', //样式类名
            shade: [0.1, '#fff'],
            closeBtn: 1, //不显示关闭按钮
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            content: '<div class="crop-modal"></div>'
        });
        document.querySelector('.crop-modal').appendChild(clone)
        $('.app-setting-avatar-modals-box .layui-layer-content').css('height','100%')
        $('#avatar-image').prop('src', replaceSrc);
        var options =
        {
            // type: 1,
            thumbBox: '.thumbBox',
            spinner: '.spinner',
            imgSrc: replaceSrc
        }
        var cropper = $('.avatar-crop-box').cropbox(options);
        $('#btnCrop').on('click', function(){
            var img = cropper.getDataURL();
            $('#app-setting-header img').prop('src', img);

            setting.cropImgData  = Base64ToFormData(img)
            layer.close(cropLayer);
        })
        $('#btnZoomIn').on('click', function(){
            cropper.zoomIn();
        })
        $('#btnZoomOut').on('click', function(){
            cropper.zoomOut();
        })
    };
    reader.readAsDataURL(file.files[0]);
}
function Base64ToFormData(img){
    var imgb64 = img.split(',')[1];
    var binary = atob(imgb64);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    var blob =  new Blob([new Uint8Array(array)], {type: 'image/jpeg'})
    // 使用FormData()进行ajax请求，上传图片
    var formData = new FormData()
    // 图片名字
    var img_name = new Date().getTime()+'.jpg';
    formData.append('csrfmiddlewaretoken','{{ csrf_token }}')
    formData.append('files',blob,img_name)
    return formData
}
function UploadFile(file,info,callback){

    var formData = new FormData();
    formData.append('files',file.files[0]);
   
    utility.currencyFileAjax('upload',setting.cropImgData ,function(res){

        if(res.code == '000'){
            info['picUrl'] = res.data.fileUrl;
            callback(info);
        }
    });

}

function Update(info){
    utility.currencyAjax('put','user/update',JSON.stringify(info),function(res){
        if(res.code === '000'){
            layer.msg('修改成功');

            var profile_item  = [
                {
                    "Tag": "Tag_Profile_IM_Nick",
                    "Value": info['realName']
                }
            ];
            if(info['picUrl']){
                profile_item.push({
                    "Tag": "Tag_Profile_IM_Image",
                    "Value": info['picUrl']
                });
            }
            var options = {
                'ProfileItem': profile_item
            };
            webim.setProfilePortrait(
                options,
                function (resp) {
                    loginInfo.identifierNick = info['realName'];
                },
                function (err) {
                    alert(err.ErrorInfo);
                }
            );
            index.load();
        }else{
            layer.msg(res.message);
        }
    });

}

