var interview = {};

interview.notData = {};
interview.alreadyData = {};
interview.userData = {};

interview.event = ()=>{
    $('#app-interview-score').click(function(){
        $('.app-interview-box').addClass('is-hidden');
        $('.app-interview-score-box').removeClass('is-hidden');
        $('.app-interview-slider-name').addClass('color2');
    });

    $('.app-interview-list-title').click(function(){
        $(this).parent().next().slideToggle();
    });

    $('.app-not-interview').on('click','.app-interview-user-item',function(){
      var id = $(this).attr('data-id');
      interview.loadData(id);
    });

    $('#resume-info').click(function(){
      ipcRenderer.send('interviewer-complete',interview.userData);
    });

    // interview.load();
}

interview.loadData = (id)=>{
  
  utility.currencyGetAjax('interViews/resume/'+id,undefined,function(res){
    var info  = res.data;
    interview.userData = info;
    $('.app-interview-username').text(info.username);
    $('.app-interview-position').text(info.postionname);
    $('.app-interview-birthday').text(utility.subString(info.birthday,11));
    $('.app-interview-education').text(info.education);
    $('.app-interview-nativeplace').text(info.nativeplace);
    $('.app-interview-address').text(info.address);

    $('.app-interview-educationList').empty();
    $.each(info.educationList,(i,item)=>{
      if(i<2){
        $('.app-interview-educationList').append('<p>'+utility.subString(item.graduationtime,7)+'  &nbsp;&nbsp;'+utility.subString(item.schoolname,11)+'</p>');
      }
    });

    $('.app-interview-companyList').empty();
    $.each(info.experienceList,(i,item)=>{
      if(i<2){
       $('.app-interview-companyList').append('<p>'+utility.subString(item.starttime,7)+'  &nbsp;&nbsp;'+utility.subString(item.companyname,11)+'</p>');
      }
    });

    $('.app-interview-company').append(`<p>`+info.lastJobAndHighestEducation.companyname+`</p>`);

  });

}

interview.load = ()=>{

  for(let i = 0; i<2; i++){

    utility.currencyGetAjax('interViews',{status: i },function(res){
      if(res.code == '000'){
        var interviewBox;
        var data = res.data.data.data;
        if(i == 0){
          interviewBox =  $('.app-not-interview');
          interview.notData = data;
        }else{
          interviewBox =  $('.app-already-interview');
          interview.alreadyData = data;
        }
        interviewBox.empty();
        interviewBox.css('display','none');
        
        var $li = $('<li>'),$img = $('<img>'),$p = $('<p>'),$span = $('<span>');
        $.each(data,(a,item)=>{
          var $li1 = $li.clone().addClass('app-interview-user-item').attr({
            'data-id':item.resumeId
          });
          var picURL= '';
          if(item.sex == 1){
            picURL = '../assets/images/7.png';
          }else{
            picURL = '../assets/images/6.png';
          }
          var $img1 = $img.clone().addClass('layui-circle').attr('src',picURL);
          var $span1 = $span.clone().text(item.username);
          var $p1 = $p.clone().text('预约时间');
          var $p2 = $p.clone().text(item.integerviewDate);
  
          $li1.append($img1).append($span1).append($p1).append($p2);
          interviewBox.append($li1);
        });
  
      }else{
        console.log(res);
      }
  
    });
  };

}

layui.use(['slider'], function(){
  var slider = layui.slider;
    //设置最大最小值
    for(let i= 1 ; i<5 ; i++){
        slider.render({
            elem: '#slideTest'+i,
            min: 0,//最小值
            max: 10, //最大值
            tips: false, //关闭默认提示层
            change: function(value){
              $('#app-interview-slider'+i).html('( ' + value +' 分)');
            }
          })
    }
});

interview.event();