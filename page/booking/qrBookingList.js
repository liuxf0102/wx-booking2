// pages/booking/bookingList.js
let util = require('../../util/util.js');
let m_login = require('../me/m_login.js');

let page_bookingHistories = [];
Page({

  theCurrentPageLongTime: 0,
  //pageScene: '1005-1004-1020',
  pageScene: '',
  pageUserid1: '',
  pageUserid2: '',
  pageBookingId: '',
  pageShowWeekData: true,
  /**
   * 页面的初始数据
   */
  data: {
    version: getApp().globalData.version,
    latestVersion: '',
    userInfo: {},
    myInfo: {},
    hasUserInfo: false,
    bookings: [],
    selectedYearmd: '',
    selectedYearmdStr: '',
    selectedYear: 0,
    selectedMonth: 0,
    selectedDay: 0,
    selectedWeekday: 0,

    today: '',
    curYear: '',
    curMonth: '',
    time: '0:0',
    timeRange: [['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'], ['0', '15', '30', '45']],
    buttonDisabled: true,
    showWeekData: true,
  },

  server_getBookingList() {

    
    var that = this;
    let userid2=getApp().globalData.userid2;
    console.log("server_getBookingList userid:" + userid2);
    if (userid2 == '') {
      return;
    }
    wx.showLoading({
      title: '数据加载中...',
    })
    //发起网络请求 restAPI dates
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/list',
      method: 'post',
      data: {
        userid2: userid2 ,
        linkedUserid: 'userid1'
      }, success: function (res) {
        //console.log(res);
        //that.setData({
        //  bookings: res.data[0].data
        //});
        try {
          if (res.data[0].data.length > 0) {
            page_bookingHistories = res.data[0].data;
          }
        } catch (e) {
          console.log("error:" + e.message);
        }
        that.setSelectedBookings(page_bookingHistories);
        console.log("getUserBooking finished .");
        wx.stopPullDownRefresh();



      },
      fail: function (err) {
        wx.showToast({
          title: '系统提示:' + err,
        })
      }
      , complete: function () {
        wx.hideLoading();
      }
    })
  },

  setSelectedBookings(bookings_all) {
    wx.showLoading({
      title: '数据处理中...',
    })


    console.log("bookings_all:" + bookings_all.length);


    var selectedBookings = [];




    for (var i = 0; i < bookings_all.length; i++) {

      let theBookingDay = new Date(bookings_all[i].year + "/" + bookings_all[i].month + "/" + bookings_all[i].day);
      bookings_all[i].hour_format = bookings_all[i].month + '月' + bookings_all[i].day + '号' ;
      bookings_all[i].status_format = util.formatBookingStatus(bookings_all[i].status);
      let status_class = "text-status";
      if (bookings_all[i].status == 4)//status is finished
      {
        status_class = "text-status-finished";
      }
      if (bookings_all[i].status == 0)//status is pending
      {
        status_class = "text-status-pending";
      }
      bookings_all[i].status_class = status_class;
      let prop_class_format = "";

      if (bookings_all[i].prop_class.length >= 2) {
        prop_class_format = ":" + bookings_all[i].prop_class.substring(0, 2);
      }
      bookings_all[i].prop_class_format = prop_class_format;

      let prop_class_class = 'text-black';
      //the first class is key task
      if (getApp().globalData.BOOKING_PROP_CLASSES.length > 0 && (bookings_all[i].prop_class == getApp().globalData.BOOKING_PROP_CLASSES[0])) {
        prop_class_class = 'text-red';
      }
      if (bookings_all[i].status == 4)//status is finished
      {
        prop_class_class = "text-black";
      }
      bookings_all[i].prop_class_class = prop_class_class;

      let memo1 = bookings_all[i].memo1;

      //如果是待审核状态则显示对方的留言
      if (bookings_all[i].status.toString() == "0" || memo1 == "") {

        memo1 = bookings_all[i].memo2 == "" ? "" : "[留]" + bookings_all[i].memo2
      }
      if (bookings_all[i].memo2_1!='')
      {
        memo1 ="[回]" + bookings_all[i].memo2_1
      }
      if (memo1.length > 15) {
        memo1 = memo1.substring(0, 15);
      }


      bookings_all[i].memo1_format = memo1;

      //format show real_name
      let real_name = bookings_all[i].real_name;
      let nick_name = bookings_all[i].nick_name;
      let name_format = real_name;
      if (real_name != nick_name && nick_name != "") {
        name_format = name_format + "-" + nick_name;
      }
      if (name_format.length > 12) {
        name_format = name_format.substring(0, 12);
      }
      bookings_all[i].name_format = name_format;
      selectedBookings.push(bookings_all[i]);
    };


    //console.log("daybooking:"+this.data.hours.indexOf(15));


    selectedBookings.sort(function (a, b) {
      //console.log("a:" + (a.status * 100 + (a.hour-0)));
      return (b.year * 1000000 + (b.month - 0) * 10000 + (b.day - 0) * 100 + (b.hour - 0)) - (a.year * 1000000 + (a.month - 0) * 10000 + (a.day - 0) * 100 + (a.hour - 0));
    });

    let preWeekDay = -1;
    let changeBgcolor = 0;
    for (let i = 0; i < selectedBookings.length; i++) {
      if (preWeekDay == -1) {
        selectedBookings[i].bgcolor = ""
      } else {
        if (selectedBookings[i].weekday == preWeekDay) {
          if (changeBgcolor % 2 == 0) {
            selectedBookings[i].bgcolor = ""
          } else {
            selectedBookings[i].bgcolor = "bgcolor_eee"
          }
        } else {
          if (changeBgcolor % 2 == 0) {
            selectedBookings[i].bgcolor = "bgcolor_eee"

          } else {
            selectedBookings[i].bgcolor = ""
          }
          changeBgcolor++;
        }
      }
      preWeekDay = selectedBookings[i].weekday;
    }
    let curDate = new Date();
    let selectedDate = new Date(this.data.selectedYear + "/" + this.data.selectedMonth + "/" + this.data.selectedDay);
    //check wether selected Time > now Time 
    //console.log("test1:" + curDate.getTime());
    //console.log("test1:" + this.data.selectedYear + "-" + this.data.selectedMonth + "-" + this.data.selectedDay);
    //console.log("test1:" + selectedDate);

    if (curDate.getTime() < selectedDate.getTime() + 24 * 3600 * 1000) {
      //console.log("test1:");
      this.setData({
        buttonDisabled: false
      });
    } else {
      //console.log("test2:");
      this.setData({
        buttonDisabled: true
      });
    }



    this.setData(
      {
        bookings: selectedBookings,

      }
    );
    wx.hideLoading();
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 
    var that = this;


    let myInfo = wx.getStorageSync('MY_INFO_2') || {};
    if (myInfo.userid) {
      console.log("get userid from cache" + myInfo.userid);
      getApp().initGlobalData(myInfo);
      that.initConfig();
      that.server_getBookingList();

    } else {
      m_login.login(function (myInfo) {
        console.log("get userid from db:"+JSON.stringify(myInfo));
        getApp().globalData.userid2 = myInfo.userid;
        wx.setStorageSync('MY_INFO_2', myInfo);
        that.initConfig();
        that.server_getBookingList();

      });
    }



  },

  initConfig: function () {
    let nickName = getApp().globalData.userNickName;
    console.log("nickName:" + nickName);
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/config/getConfig',
      method: 'get',
      data: {

      },
      success: function (res) {

        if (nickName.indexOf('rdgztest') > -1) {
          console.log("get config class" + res.data[0].data.class);
          getApp().globalData.BOOKING_PROP_CLASSES_DEFAULT = res.data[0].data.class;
        }
        let latestVersion = res.data[0].data.latestVersion2;
        if (latestVersion !== getApp().globalData.version) {
          that.setData({
            versionTip: '请升级到最新版本:' + latestVersion
          });
        }

      }
    });
  },
  initMyInfo: function (unionid) {
    var that = this;
    if (unionid != "") {
      //发起网络请求 restAPI QRCode
      var openid = getApp().globalData.openid;
      wx.request({
        url: getApp().globalData.SERVER_URL + '/user/getOrCreateUserInfoByUnionid',
        method: 'post',
        data: {
          unionid: unionid,
          openid: openid,
          nick_name: getApp().globalData.nickName,
          icon: getApp().globalData.icon,
          gender: getApp().globalData.gender,
        },
        success: function (res) {

          console.log("getOrCreateUserInfoByUnionid userid:" + res.data[0].myInfo.userid);
          //console.log("getOrCreateUserInfoByUnionid userid:" + JSON.parse(res.data[0].myInfo.job_title).k);
          getApp().initGlobalData(res.data[0].myInfo);
          wx.setStorageSync('MY_INFO_2', res.data[0].myInfo);
          that.server_getBookingList();


        }
      });
    }
  },






  tapBookingDetails: function (e) {
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target));
    //console.log("tapGoBookingDetails:" + JSON.stringify(e.target.dataset.bookingid));
    wx.navigateTo({
      url: '/page/booking/qrBookingDetails?bookingId=' + e.currentTarget.dataset.bookingid,
    })

  },


  longpressDay: function (e) {

    console.log("longtapDay:" + JSON.stringify(e));

  },

  longpressBooking: function (e) {
    console.log("longpressBooking" + JSON.stringify(e));

  },


  formSubmit: function (e) {
    var that = this
    //console.log("formid:"+e.detail.formid);
    let formid = e.detail.formId;
    getApp().formidCollect(formid);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("onShow");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    getApp().formids2Server();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.setStorageSync('MY_INFO_2', {});
    wx.reLaunch({
      url: '/page/booking/qrBookingList',
    })


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})