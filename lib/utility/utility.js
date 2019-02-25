var utility = {};

utility.host = "http://company.zqyzk.com/api/v1/";


utility.ajax = (method, url, data, suc, err) => {

    $.ajax({
        type: method,
        crossDomain: true,
        url: utility.host + url,
        data: data,
        dataType: "json",
        success: suc,
        error: err
    });

};

utility.currencyAjax = (method, url, data, suc, err)=>{

    $.ajax({
        type: method,
        url: utility.host + url,
        data: data,
        headers:{
            "Content-Type":"application/json",
            "Authorization":Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.currencyFileAjax = (url, data, suc, err)=>{

    $.ajax({
        type: 'post',
        url: utility.host + url,
        data: data,
        async:false,
        contentType : false,
        processData : false,
        headers:{
            "Authorization":Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.currencyGetAjax = (url, data, suc, err)=>{

    $.ajax({
        type: 'get',
        url: utility.host + url,
        data: data,
        headers:{
            "Content-Type":"application/json",
            "Authorization": Token
        },
        dataType: "json",
        success: suc,
        error: err
    });

}

utility.subString = (string,num)=>{
    return string.substring(0,num);
}

//标签点击
utility.handleSectionTriggerShow = (event)=>{
    hideAllSectionsAndDeselectButtons();
    
    const sectionId = `${event.dataset.section}-section`;
    document.getElementById(sectionId).classList.add('is-shown');
}

function hideAllSectionsAndDeselectButtons(){

    const sections = document.querySelectorAll('.app-section.is-shown');
    Array.prototype.forEach.call(sections, (section) => {
      section.classList.remove('is-shown');
    })
}
