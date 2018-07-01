//app.js
const updateManager = wx.getUpdateManager();
updateManager.onCheckForUpdate(function (res) {
  // 请求完新版本信息的回调
  console.log("checkForUpdate:" + res.hasUpdate);
  
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success: function (res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })

})
App({
  onLaunch: function () {
    
  },

  reloadUserInfo: function () {

    var openid = getApp().globalData.openid;

    //set UserInfo 2 db :open_id,nickName,
    //   console.log("App 61");
    if (openid != "") {
      //发起网络请求 restAPI QRCode
      wx.request({
        url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByOpenid',
        method: 'post',
        data: {
          openid: openid,
          nick_name: '',
          appid: getApp().globalData.APPID
        },
        success: function (res) {

          //console.log("userid:" + res.data[0].myInfo.userid);
          getApp().initGlobalData(res.data[0].myInfo);
          //set userid 2 Storage
          wx.setStorageSync('MY_INFO_2', res.data[0].myInfo)
        }
      });
    }
  },

  initGlobalData: function (myInfo) {
    //set userid 2 Storage
    getApp().globalData.userid2 = myInfo.userid;
    getApp().globalData.openid = myInfo.openid;
    getApp().globalData.real_name = myInfo.real_name;
    getApp().globalData.userNickName = myInfo.nick_name;
    getApp().globalData.userAvatarUrl = myInfo.icon;
    getApp().globalData.userGender = myInfo.gender;
    let strConfig = myInfo.config;
    if (strConfig == '') {
      strConfig = "{}";
    }
    let config = JSON.parse(strConfig);
    if (config.prop_classes && config.prop_classes.length > 0) {
      getApp().globalData.BOOKING_PROP_CLASSES = config.prop_classes;
    }
  },

  formidCollect: function (formid) {
    let formids = getApp().globalData.formids;
    console.log("formid:" + formid);
    // "the formId is a mock one" will be set for formid
    if (!(formid.indexOf("formId") > 0)) {
      let data = { "formid": formid, "expire": ((new Date().getTime()) + 7 * 24 * 3600 * 1000 - 3 * 60 * 1000) };

      formids.push(data);
    }
    getApp().globalData.formids = formids;

  },
  formids2Server: function () {
    if (getApp().globalData.formids.length == 0) {
      return;
    }
    wx.request({
      url: getApp().globalData.SERVER_URL + '/user/appendFormids',
      data: {
        userid: getApp().globalData.userid2,
        formids: JSON.stringify(getApp().globalData.formids)

      },
      method: 'put', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function (res) {
        if (res.statusCode == 200 && res.data[0].result == 'success') {
          // success
          //console.log('成功' + JSON.stringify(res));
          getApp().globalData.formids = [];
          console.log('formids2Server ok.');
        }
        // console.log(e.detail.formid);
      },
      fail: function (err) {
        // fail
        console.error('formids2Server' + err);
      },
      complete: function () {
        // complete
      }
    });


  },
  globalData: {
    version: "V3.1.5",
    APPID: 1,
    formids: [],
    userInfo: null,
    userid: '',
    userid2: '',
    unionid: '',
    openid: '',
    mobile: '',
    userNickName: '',
    userAvatarUrl: '',
    userGender: '',
    params: {},
    BOOKING_HOURS: [8, 9, 10, 13, 14, -1],
    BOOKING_HOURS_FORMAT: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
    BOOKING_PROP_CLASSES_DEFAULT: ['修复', '治疗', '拔牙', '洗牙', '换药'],
    BOOKING_PROP_CLASSES: [],
    BOOKING_HOUR_CAPACITY_DEFAULT: [{ "h": 8, "c": "2" }, { "h": 9, "c": "2" }, { "h": 13, "c": "2" }, { "h": 14, "c": "2" }],
    SYS_TIP:'',
    SERVER_URL: 'https://www.4exam.cn',
   // SERVER_URL: 'http://127.0.0.1:8081'


  },
  //Storage object 
  SCONST: { "MY_INFO": "MY_INFO", "BOOKING": "BOOKING", "ROTA": "ROTA" }

})