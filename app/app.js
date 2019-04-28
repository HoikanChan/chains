const {ipcRenderer} = require('electron');
const Mianwindow = remote.getCurrentWindow();

var rememberMe = false;
var automatic = false;
var login = false;

$('#setmin_btn').click(function(){
    Mianwindow.minimize();
});
$('#close_btn').click(function(){
    Mianwindow.destroy();
});
$('#goToResetPsw').click(function(){
  $('#app-resetPsw-wrap').show();
  $('#app-login-wrap').hide();
  $('#app-resetPsw-wrap input').each(function(){
    $(this).val("");
  });
})
$('.resetpsw-return-btn').click(function(){
  $('#app-resetPsw-wrap').hide();
  $('#app-login-wrap').show();
})

//网络状态监听
const updateOnlineStatus = () => {
  if(navigator.onLine){
    $('.app-error-box').removeClass('slideInUp').hide();
    $('#login-sub').removeAttr('disabled');
  }else{
    $('.app-error-box').addClass('slideInUp').show();
    $('#login-sub').attr('disabled','disabled');
  }
}

window.addEventListener('online',  updateOnlineStatus)
window.addEventListener('offline',  updateOnlineStatus)

updateOnlineStatus()

// 获取验证码点击事件
$('#get-code-btn').click(function(e){
  e.stopPropagation();
  const userName = $('#app-resetPsw-wrap input[name="userPhone"]').val();
  if(!userName){
    layer.msg('请先输入用户名', {icon: 10});
    return false
  }
  if(!/^1[34578]\d{9}$/.test(userName)){
    layer.msg('请输入有效用户名', {icon: 10});
    return false
  }
  loginWinMethods.getMobileCaptcha(userName)
  return false
})

layui.use(['form'], function(){
    var form = layui.form;
    
    form.verify({
        username:function(value, item){ //value：表单的值、item：表单的DOM对象
            if(!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)){
              return '用户名不能有特殊字符';
            }
            if(/(^\_)|(\__)|(\_+$)/.test(value)){
              return '用户名首尾不能出现下划线\'_\'';
            }
        },
        pass: [
            /^[\S]{6,12}$/
          ,'请检查密码，必须大于6字符'
        ]
      });

      form.on('submit(*)', function(data){
        if($('#app-resetPsw-wrap').css('display') === 'none'){
          loginWinMethods.login(data)
        }else{
          if(!window.Token){
            layer.msg("请先获取验证码" ,{icon: 10});
            return false;
          }
          loginWinMethods.resetPsw(data)
        }
        return false;
      });

      form.on('checkbox(automatic)', function(data){
        if(data.elem.checked){
          $('input[name="rememberMe"]').prop("checked", true);
          form.render();
        }
        automatic = data.elem.checked;
      });

      form.on('checkbox(rememberMe)', function(data){
        if(!data.elem.checked){
          $('input[name="automatic"]').prop("checked", false);
          form.render();
        }
        rememberMe = data.elem.checked;
      });

      var info = db.get('user.auto').value();
      if(info){
        let obj = JSON.parse(info);
        form.val("login-form", obj);

        if(obj.hasOwnProperty('automatic')){
          ipcRenderer.on('synchronous-msg',(event,msg)=>{
            if(msg == 'auto'){
              $('#login-sub').click();
            }
          });
          automatic = true;
        }

        if(obj.hasOwnProperty('rememberMe')){
          rememberMe = true;
        }

      }
})


const loginWinMethods = {
  getMobileCaptcha: function (userPhone){
    utility.ajax('post','resetpwd/getMobileCaptcha',{userPhone},function(res){
      if(res.code == '000'){
        window.Token = res.data.token;
        loginWinMethods.countDown(60);
      }else{
        layer.msg(res.message, {icon: 10});
      }
    },(err)=>{
      layer.msg('网络错误', {icon: 10});
    })
  },
  countDown: function(start) {
    const $btn = $('#get-code-btn')
    $btn.prop('disabled',true)
    $btn
      .html(start + '秒')
      .addClass('stopBtn')
      .removeClass('get-code')
    let t = setInterval(function() {
      if (start < 1) {
        clearInterval(t)
        $btn.prop('disabled',false)
        $btn.html('获取验证码')
      } else {
        $btn.html(start + '秒')
        start--
      }
    }, 1000)
  },
  login: function(data){
    utility.ajax('post','oauth/token',data.field,function(res){
          
      if(res.code == '000'){
        db.set('user.info',JSON.stringify(res.data)).write();

        if(rememberMe){
          db.set('user.auto',JSON.stringify(data.field)).write();
        }else{
          db.unset('user.auto').write();
        }

        ipcRenderer.send('login');
      }else{
        layer.msg(res.message, {icon: 10});
      }
    },(err)=>{
      layer.msg('网络错误', {icon: 10});
    })
  },
  resetPsw: function(data){
    utility.currencyAjax('post','resetpwd/reset',JSON.stringify(data.field),function(res){
      if(res.code == '000'){
        layer.msg("修改成功", {icon: 1, time:1000});
        $('.resetpsw-return-btn').click()
      }else{
        layer.msg(res.message, {icon: 10});
      }
    },(err)=>{
      layer.msg('网络错误', {icon: 10});
    })
  }
}
