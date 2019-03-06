const {ipcRenderer:ipc} = require('electron');

var rememberMe = false;
var automatic = false;
var login = false;

$('#setmin_btn').click(function(){
    ipc.send('min');
});
$('#close_btn').click(function(){
    ipc.send('close');
});

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

        utility.ajax('post','oauth/token',data.field,function(res){
          
          if(res.code == '000'){
            db.set('user.info',JSON.stringify(res.data)).write();

            if(rememberMe){
              db.set('user.auto',JSON.stringify(data.field)).write();
            }else{
              db.unset('user.auto').write();
            }

            ipc.send('login');
          }else{
            layer.msg(res.message, {icon: 10});
          }
        })

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
          ipc.on('synchronous-msg',(event,msg)=>{
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
