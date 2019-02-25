var chat = {};

chat.init = ()=>{
}

chat.event = ()=>{

    $('#send-message').click(function(){
       var msg = $('#send_msg_text').text();
       if(msg){
         onSendMsg();
       }
    });

    $('#send_msg_text').keydown(function(event){
      if (event && event.keyCode == 13) {
          onSendMsg();
      }
    });

    $('#check-file').click(function(){
      $('#upload_file').click();
    });

    $('#upload_file').change(function(){
      var file = $(this);
      var uploadFiles = file[0];
      var filesize = uploadFiles.files[0].size;
      if(checkPic(uploadFiles,filesize)){
        uploadPic(uploadFiles);
      }else{
        uploadFile(uploadFiles);
      }
    });

    $("#send_msg_text").emoji({
      button: "#app-expression",
      showTab: false,
      animation: 'fade',
      icons: [{
          name: "QQ表情",
          path: "../assets/images/qq/",
          maxNum: 90,
          file: ".png",
          placeholder: "#qq_{alias}#"
      }]
    });

    $('#app-video').click(function(){
      ipcRenderer.send('add',webim.ctx,selToID);
    });

    $('#app-voice').click(function(){
      ipcRenderer.send('voice-add',webim.ctx,selToID);
    });

}

chat.event();