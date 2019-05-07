const { app, remote } = require('electron');
const electron = require('electron');
const { ipcRenderer } = electron;
const host = "http://company.zqyzk.com/api/v1/";
const emailHost = "http://localhost:3000/api/v1/email/";
const emailWindow = remote.getCurrentWindow();

initPage = function () {
  Vue.component('mail-item', {
    template: '#mail-item',
    props: {
      'mail': Object
    },
    mounted: function () {
      console.log(mail);
    }
  });

  new Vue({
    el: 'main',
    data: {
      a: 'hi vue',
      tabName: 'inbox',
      emailList: [],
      deptAndUsers: [],
      mailDetail: '',
      listLoading: false,
      detailLoading: false,
      addresMan: '',
      copyToMan: '',
      emailTitle: '',
      attachments: ''
    },
    methods: {
      minimizeWin: function () {
        emailWindow.minimize();
      },
      closeWin() {
        emailWindow.close();
      },
      switchOver: function (tabName) {
        this.tabName = tabName
      },
      readMail(uid) {
        console.log(uid);
        this.detailLoading = true
        $email.get('emailDetail', {
          params: {
            uid,
            type: 'Inbox'
          }
        }).then(res => {
          this.mailDetail = res.result
          this.detailLoading = false
        })
      },
      getMailList() {
        this.listLoading = true
        $email.get('get', {
          params: {
            type: this.tabName
          }
        }).then(res => {
          console.log(res);
          this.listLoading = false
          this.emailList = res.result.emailList
          if (this.emailList.length) {
            const fromReg = /"(.*)"/
            console.log('1',this.emailList);
            this.emailList = this.emailList.map(mail => {
              return {
                uid: mail.uid,
                from: fromReg.test(mail.from[0]) ? fromReg.exec(mail.from[0])[1] : mail.from[0],
                date: mail.date,
                subject: mail.subject[0] || '无主题'
              }
            })
            console.log('2',this.emailList);
          }
        })
      },
      
      sendMail(){
        console.log(this.addresMan,this.copyToMan,this.emailTitle,this.attachments)
        console.log((UE.getEditor('editor').getContent()))
        
          $email.post('send',{
            to : this.addresMan,
            title : this.emailTitle,
            content : UE.getEditor('editor').getContent(),
            attachments : ''
          }).then(res => {
            console.log('send',res)
          })
        
      }
    },
    watch: {
      tabName: function () {
        this.getMailList()
      }
    },

    mounted() {
      window.$http.get('user/contacts').then(res => {
        console.log(res);
        if (res.code === '000') {
          this.deptAndUsers = res.data.deptAndUsers
        }
      })

      $email.post('login',{
        user : '18273177931',
        pass : '123456789Ww'
      }).then(res => {
        console.log( 'login',res)
        console.log()
      })
      
     

      this.getMailList()
      
     
    }
  })
};

ipcRenderer.on('synchronous-data', (event, data) => { 
  console.log(data);
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

