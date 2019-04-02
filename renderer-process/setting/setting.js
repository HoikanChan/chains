const {ipcRenderer:ipc} = require('electron');
var setting = {};

ipc.on('synchronous-webim',(event,{userId, organs})=>{
    utility.currencyAjax('post','user/info2?userId='+userId,undefined,function(res){
        if(res.code === '000'){
            var userInfo = res.data;
            $('.app-index-user-nickname-text').text(userInfo.realName);
            var introduce = (userInfo.introduce != null)?userInfo.introduce:'未设置';
            $('.app-index-user-introduce').html('<p>'+introduce+'</p>');
            var  picUrl = fileDomain + userInfo.picUrl;
            if(userInfo.picUrl == null || userInfo.picUrl == ''){
                picUrl = (userInfo.sex == '女')?'../../assets/images/6.png':'../../assets/images/7.png';
            }
            userInfo.picUrl = picUrl;
            $(`.app-setting-sex[title="${userInfo.sex}"]`).prop("checked","checked")

            $('.app-index-user-portrait img').attr('src',picUrl);
            $('#app-setting-nickname').val(userInfo.realName);
            
            $('#app-setting-position').text(userInfo.position);
            $('#app-setting-company').text(organs.organName);
            $('#app-setting-dept').text(userInfo.depts[0].deptName);
            $('#app-setting-phone').text(userInfo.phone);
            $('#app-setting-introduce').val(introduce);
            $('#app-setting-header').find('img').attr('src',picUrl);
        }
    });
});

setting.event = ()=>{
    $('#se_close_btn').click(function(){
        ipc.send($('.app-setting-head-title').text().trim() === '个人信息'?'userInfowin_close':'resetPswWin_close');
    });
    $('#app-setting-header').click(function(){
        $('#app-setting-header-input').click();
    })
    $('#enable-nickname-edit').click(function(){
        $('#app-setting-nickname').prop('disabled',false)
        $('#app-setting-nickname').focus();
    })
    $('#app-setting-header-input').change(function(e){
        selectImg($(this)[0]);
    });
    // 提交个人信息
    $('#app-setting-update-btn').click(function(){
        var File = $('#app-setting-header-input')[0];
        var form = {};

        form['realName'] = $('#app-setting-nickname').val();
        form['sex'] = $('.app-setting-sex:checked').val() === '男' ? 1 : 0;
        // form['introduce'] = $('#app-setting-introduce').val();

        if(File.files[0]){
            UploadFile(File,form,Update);
        }else{
            Update(form);
        }

    })
    // 提交修改密码
    $('#app-setting-sub-password').click(function(){
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
        $('#app-setting-header img').prop('src', replaceSrc);
    };
    reader.readAsDataURL(file.files[0]);
}

function UploadFile(file,info,callback){

    var formData = new FormData();
    formData.append('files',file.files[0]);

    utility.currencyFileAjax('upload',formData,function(res){
        console.log(res);

        if(res.code == '000'){
            info['picUrl'] = res.data.fileUrl;
            callback(info);
        }
    });

}

function Update(info){
    utility.currencyAjax('put','user/update',JSON.stringify(info),function(res){
        if(res.code === '000'){
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
        }
    });

}

