
// const { remote } = require('electron');
const electron = require('electron');
const {
  ipcRenderer
} = electron;
const user = JSON.parse(db.get('user.info').value());
const Token = user.token;
const host = "http://company.zqyzk.com/api/v1/";
const emailHost = "http://localhost:3000/api/v1/email/";
const emailWindow = remote.getCurrentWindow();

initPage = function () {
  const deptListComponet = Vue.component('dept-list', {
    template: '#dept-list',
    props: ['dataList'],
    mounted: function () {
      console.log(this);
      console.log(this.dataList);
    }
  });

  new Vue({
    el: 'main',
    components: {
      'dept-list': deptListComponet
    },
    data: {
      imgHost: 'http://company.zqyzk.com/',
      tabName: 'inbox',
      emailList: [],
      deptAndUsers: [],
      mailDetail: '',
      showDetail: false,
      listLoading: false,
      detailLoading: false,
      attachments: [],
      fileList: [],
      emailData: {
        html: '',
        subject: '',
        to: '',
        copyto:[]
      },

    },
    methods: {
      minimizeWin: function () {
        emailWindow.minimize();
      },
      closeWin() {
        emailWindow.close();
      },
      formatImgUrl: function (value) {
        return value ? this.imgHost + value : '../../assets/images/6.png'
      },
      hasStar(flags) {
        return flags ? flags.some(i => i.includes('Flag')) : false
      },
      switchOver: function (tabName) {
        this.tabName = tabName
      },
      readMail(uid) {
        console.log(uid);
        console.log('object');
        emailHelper().getEmailList().then(res => {
          console.log(res);
        })

        this.mailDetail = ''
        this.detailLoading = true
        this.showDetail = true
        emailHelper().getEmailDetail(uid, 'Inbox').then(res => {
          console.log(res);
          this.mailDetail = res
          this.detailLoading = false
        })
      },
      backToList() {
        this.showDetail = false
      },
      setFlag(uid, toAddFlag) {
        let pos;
        this.emailList.forEach((item, index) => {
          if (item.uid === uid) {
            pos = index
          }
        })
        if (pos !== undefined) {
          if (toAddFlag) {
            const copyList = this.emailList.slice()
            copyList[pos].flags.push('/Flagged')
            this.emailList = copyList
          } else {
            this.emailList = this.emailList.map((email, index) => {
              if (index === pos) {
                const flags = email.flags.filter(i => !i.includes('Flagged'))
                return {
                  ...email,
                  flags
                }
              } else {
                return email
              }
            })
          }
        } else {
          console.error('标准失败', uid);
        }
      },
      starMail(uid, flags) {
        if (flags.length && this.hasStar(flags)) {
          emailHelper().delEmailFlag(uid,"Inbox","Flagged").then(res => {
            this.setFlag(uid, false)
          })
        } else {
          emailHelper().setEmail(uid,"Inbox","Flagged").then(res => {
            this.setFlag(uid, false)
          })
        }
      },
      deleteMail(uid) {
        this.listLoading = true
        debugger
        emailHelper().delEmailFlag(uid,"Inbox","DELETED").then(res => {
          this.emailList = this.emailList.filter(email => email.uid !== uid)
          this.listLoading = false
        })
      },
      getMailList() {
        this.listLoading = true
        emailHelper().getEmailList(this.tabName).then(mailList => {
          console.log(mailList);
          if (mailList.length) {
            const fromReg = /"(.*)"/
            this.emailList = mailList.map(mail => {
              return {
                uid: mail.uid,
                from: fromReg.test(mail.from[0]) ? fromReg.exec(mail.from[0])[1] : mail.from[0],
                date: mail.date,
                flags: mail.flags,
                subject: mail.subject? mail.subject[0] : '无主题'
              }
            })
          }
          this.listLoading = false
        })
      },

      handleChange (file, fileList) {

        this.fileList = fileList
        console.log(file)
        console.log(this.fileList);
        if(this.fileList){
          let formdata = new FormData();
          for(let i=0;i<this.fileList.length;i++){
            let fileData = this.fileList[i].raw;
            console.log(Token)
            formdata.append('files',this.fileList[i].raw)

            utility.currencyFileAjax('upload', formdata , function( res ) {
              console.log(res);
            })
          
            
          }
        }

      },
      handleRemove (file, fileList) {
        this.fileList = fileList
        console.log(this.fileList);
      },
      handlePreview (file) {
        console.log('file:',file)
      },

      sendMail() {
        console.log(this.addresMan, this.copyToMan, this.emailTitle, this.attachments)
        console.log((UE.getEditor('editor').getContent()))
        // ipcRenderer.on('synchronous-data', (event, data) => { 
        //    console.log(data.token) 
        // })
        //   $email.post('send',{
        //     to : this.addresMan,
        //     title : this.emailTitle,
        //     content : UE.getEditor('editor').getContent(),
        //     attachments : ''
        //   }).then(res => {
        //     console.log('send',res)
        //   })

      }
    },
    watch: {
      tabName: function (val) {
        this.backToList()
        if (val === 'write') {

        } else if (val === 'contacts') {

        } else {
          this.emailList = [],
            this.getMailList()
        }
      }
    },

    mounted() {
      window.$http.get('user/contacts').then(res => {
        console.log(res);
        if (res.code === '000') {
          this.deptAndUsers = res.data.deptAndUsers
        }
      })
    


      this.getMailList()
    }
  })
};

ipcRenderer.on('synchronous-data', (event, data) => {
  const api = _host => {
    let axiosInstance = axios.create({
      baseURL: _host,
      headers: {
        Authorization: data.token
      }
    });
    axiosInstance.interceptors.response.use(function (response) {
      console.log('res', response);
      return response.data;
    }, function (error) {
      console.error(error);
      return Promise.reject(error);
    });
    return axiosInstance
  }
  window.$http = api(host);
  window.$email = api(emailHost);
  initPage();

});