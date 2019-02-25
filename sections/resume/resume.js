const electron = require('electron');   
const {ipcRenderer} = electron;

ipcRenderer.on('synchronization',(event,complete)=>{

    console.log(complete);
    var sex = (complete.sex==1)?'男':'女';

    var education = '';
    $.each(complete.educationList,(i,item)=>{
        education += `
            <p><span class="emphasize">`+item.schoolname+`</span>`+item.graduationtime+`</p>
            <p><span class="emphasize">`+item.education+`|`+item.major+`</span></p>
        `;
    });

    var experience = '';
    $.each(complete.experienceList,(i,item)=>{
        experience += `
            <div class="preview-item-list">
                <p class="item-name">`+item.starttime.substring(0,7)+`-`+item.endtime.substring(0,7)+`<span>`+item.positionname+`</span>|`+item.department+`</p>
                <p class="item-name">`+item.companyname+`<span style="marginRight: 20">[`+item.workHowLong+`]</span>`+item.professionnames+`|`+complete.scale+`人|`+complete.nature+`</p>
                <div class="list-content"><span>工作描述：</span>
                </div>
                <div class="list-content"><span>主要负责：</span>
                    <p>`+item.describetion+`</p>
                </div>
            </div>
        `;
    });

    var projectExperience = '';
    $.each(complete.projectExperienceList,(i,item)=>{
        projectExperience += `
        <div class="preview-item-list">
            <p class="item-name">
                <span>`+item.starttime.substring(0,7)+`-`+item.endtime.substring(0,7)+`</span>
                <span class="emphasize">`+item.projectname+`</span>
            </p>
            <div class="list-content"><span>所属公司：</span>`+item.companyname+`</div>
            <div class="list-content"><span>项目描述：</span>
                <p>`+item.projectdescribe+`</p>
            </div>
            <div class="list-content"><span>责任描述：</span>
                <p>`+item.responsibility+`</p>
            </div>
        </div>
        `;
    });

    var html = `
    <div class="personal-information clear">
        <div class="headImg left">
        </div>
        <div class="information">
            <p class="resume-ID">ID:382816556</p>
            <h3 class="name">`+complete.username+`</h3>
            <div class="information-item contact-info">
                <span>`+complete.currentstate+`</span>
                <span>`+complete.contact+`</span>
                <span>`+complete.email+`</span>
            </div>
            <div class="information-item other-info clear">
                <p class="left" style="width: 770px">`+sex+` | `+complete.age+` 岁 (`+complete.birthday.substring(0,11)+`) |
                    现居住`+complete.address+` | `+complete.yearstanding+`年工作经验</p>
            </div>
        </div>
    </div>

    <div class="resume-content">
            <div class="preview-item">
                <div class="resume-base-info">
                    <h3>最近工作</h3>
                    <p><span>职位：</span>`+complete.lastJobAndHighestEducation.job+`</p>
                    <p><span>公司：</span>`+complete.lastJobAndHighestEducation.companyname+`</p>
                    <p><span>行业：</span>`+complete.lastJobAndHighestEducation.profession+`</p>
                </div>
                <div class="resume-base-info">
                    <h3>最高学历/学位</h3>
                    <p><span>专业：</span>`+complete.lastJobAndHighestEducation.major+`</p>
                    <p><span>学校：</span>`+complete.lastJobAndHighestEducation.school+`</p>
                    <p><span>学历/学位：</span>`+complete.lastJobAndHighestEducation.education+`</p>
                </div>
            </div>
            <div class="split-big"></div>
            <div class="preview-item">
                <div class="resume-base-info">
                    <h3>个人信息</h3>
                    <p><span>户口/国籍：</span>`+complete.nativeplace+`</p>
                    <p><span>身高：</span>`+complete.height+`cm</p>
                    <p><span>婚姻状况：</span>未婚</p>
                    <p><span>政治面貌：</span>`+complete.politicalstatus+`</p>
                </div>
                <div class="resume-base-info">
                    <h3>教育经历</h3>
                    `+education+`
                </div>
            </div>
            <div class="split-big"></div>
            <div class="preview-item">
                <h3>目前年收入 `+complete.annualincome+`元
                    <small>（包含基本工资、补贴、奖金、股权收益等）</small>
                </h3>
            </div>
            <hr style="width: 100%;margin: 20px 0;  border:1px solid #F8F8F8;"/>
            <div class="preview-item">
                <h3>求职意向</h3>
                <div class="preview-item-list">
                    <div class="list-content"><span>个人标签：</span> `+complete.jobIntention.tag+`</div>
                    <div class="list-content"><span> 期望薪资：</span> `+complete.jobIntention.expectsalary+`万 元/年</div>
                    <div class="list-content"><span>地点：</span> `+complete.jobIntention.expectaddress+`</div>
                    <div class="list-content"><span>职能/职位：</span>`+complete.jobIntention.expectposition+`</div>
                    <div class="list-content"><span>行业：</span> `+complete.jobIntention.expectprofession+` </div>
                    <div class="list-content"><span>到岗时间： </span> `+complete.jobIntention.arrivaltime+`</div>
                    <div class="list-content"><span>工作类型： </span> `+complete.jobIntention.expectjobnature+`</div>
                    <div class="list-content">
                        <span>自我评价： </span> `+complete.jobIntention.selfevaluation+`
                    </div>
                </div>
            </div>
            <div class="split-big"></div>
            <div class="preview-item">
                <h3>工作经验</h3>
                `+experience+`
            </div>
            <div class="split-big"></div>
            <div class="preview-item">
                <h3>项目经验</h3>
                `+projectExperience+`
            </div>
        </div>
    </div>
    `;

    $('.preview').html(html);

});