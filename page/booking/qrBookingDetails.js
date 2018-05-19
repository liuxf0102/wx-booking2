// page/booking/bookingDetails.js
let util = require('../../util/util.js');
let server = require('server.js');
let m_login = require('../me/m_login.js');
let page_bookingId="";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    
    booking: {},
    year: 2018,
    month: 1,
    day: 1,
    weekday: 1,
    hour: 8,
    hours: [8, 9, 10, 13, 14, 15],
    hourLabels: ["上午8点", "上午9点", "上午10点", "下午1点", "下午2点", "下午3点"],
    datePickerDisabled: true,
    memo2Length: 0,
    memo2Max: 200,
    buttonDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    
    let myInfo = wx.getStorageSync('MY_INFO_2') || {};
    if (myInfo.userid) {
      console.log("getUnionid userid from storage.");
      getApp().initGlobalData(myInfo);
    }else{
      m_login.login(function (myInfo) {
        
      });
    }
  
   
    server.refreshBooking(getApp().globalData.userid, function () { });
    //console.log(map.get(8));
    
    
    if (options.bookingId) {
      this.initBooking(options.bookingId);
      page_bookingId = options.bookingId;
    }
    //
    this.showSysTip();

  },
  showSysTip:function()
  {
    if(getApp().globalData.SYS_TIP!=''){

      wx.showModal({
        title: '系统提示',
        showCancel:false,
        content: getApp().globalData.SYS_TIP,
      })
      getApp().globalData.SYS_TIP='';
    }
  },
  initBooking: function (id) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/byId',
      method: 'post',
      data: {
        id: id,
        linkedUserid:'userid1'
      }, success: function (res) {
        //console.log(JSON.stringify(res.data[0]));
        let booking = res.data[0].data;
        let cTime = new Date();
        cTime.setTime(booking.c_time);
        let c_time_format = util.formatTime(cTime);
        booking.c_time_format = c_time_format;
        booking.hour_format = util.formatHour(booking.hour);
        booking.weekday_format = util.formatWeekday(booking.weekday);
        booking.status_format = util.formatBookingStatus(booking.status);
        that.setData({
          booking: booking,
          memo2Length: booking.memo2.length
        });
        console.log("booking userid1:" + booking.userid1);
      
      }
    })
  },
  tapBooking: function () {
    var that = this;
    if (getApp().globalData.userid2 == '') {
      return;
    }
    //only for apply status
    if (that.data.booking.status==0){
    wx.showActionSheet({
      itemList: ['取消预约'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);

        let status = -1;
        if (res.tapIndex == 0) {
          status = -1;
        } 



        if (!res.cancel) {


          wx.showModal({
            title: '取消预约',
            content: '你要取消该预约吗？',
            success: function (res) {
              if (res.confirm) {
                //发起网络请求 
                wx.request({
                  url: getApp().globalData.SERVER_URL + '/booking/update',
                  method: 'put',
                  data: {
                    id: that.data.booking.id,
                    status: status
                  },
                  success: function (res) {
                    console.log("id:" + res.data[0].id);
                    that.initBooking(res.data[0].id);
                    //set userid 2 Storage
                    wx.showModal({
                      title: '系统提示',
                      content: '更新成功.',
                      showCancel: false
                    });



                  }
                });

                return;
              }
            }
          });

         

        }
      }
    });
    }
  },
  bindDateChange: function (e) {

    let that = this;
    this.setData({
      date: e.detail.value
    })
    let times = e.detail.value.split("-");
    if (times.length == 3) {
      console.log("weekday:" + new Date(e.detail.value).getDay())
      console.log("selectedDay:" + times.join(","));
      let weekday = new Date(e.detail.value).getDay();
      if (weekday == 0) {
        weekday = 7;
      }

      let booking = that.data.booking;
      booking.year = times[0];
      booking.month = times[1];
      booking.day = times[2];
      booking.weekday_format = util.formatWeekday(weekday);
      this.setData({
        year: times[0],
        month: times[1],
        day: times[2],
        weekday: weekday,
        booking: booking,
      })
    }

    wx.showActionSheet({
      itemList: ['上午8点', '上午9点', '上午10点', '下午1点', '下午2点', '下午3点'],
      success: function (res) {
        //let selectedHour = that.data.hourLabels[res.tapIndex];
        //console.log("selectedHour:" + res.tapIndex);
        if (!res.cancel) {

          let booking = that.data.booking;
          booking.hour_format = that.data.hourLabels[res.tapIndex],
            that.setData({
              booking: booking,
              hour: that.data.hours[res.tapIndex]
            })


          wx.showModal({
            title: '调整预约时间',
            content: '你要将预约时间调整为:' + that.data.booking.weekday_format + " " + that.data.month + "-" + that.data.day + " " + that.data.booking.hour_format + "吗?",
            success: function (res) {
              if (res.confirm) {
                wx.request({
                  url: getApp().globalData.SERVER_URL + '/booking/update',
                  method: 'put',
                  data: {
                    id: that.data.booking.id,
                    year: that.data.year,
                    month: that.data.month,
                    day: that.data.day,
                    weekday: that.data.weekday,
                    hour: that.data.hour
                  },
                  success: function (res) {
                    console.log("id:" + res.data[0].id);
                    that.initBooking(res.data[0].id);
                    //set userid 2 Storage
                    wx.showModal({
                      title: '系统提示',
                      content: '更新成功.',
                      showCancel: false
                    });



                  }
                });


                return;
              }
            }
          });
        }
      }
    });
  },
  tapMemo2:function (e){
    wx.navigateTo({
      url: '/page/booking/qrMemo2?bookingId=' + this.data.booking.id,
    })
    
  },
  inputMemo2: function (e) {
    //console.log("memo2:"+e.detail.value);
    let memo2 = e.detail.value;

    this.setData({
      memo2: memo2,
      memo2Length: memo2.length,
      buttonDisabled: false
    });

  },
  bindUpdateMemo2: function (e) {
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/update',
      method: 'put',
      data: {
        id: that.data.booking.id,
        memo2: that.data.memo2
      },
      success: function (res) {
        console.log("id:" + res.data[0].id);
        that.initBooking(res.data[0].id);
        that.setData({
          buttonDisabled: true
        });

        //set userid 2 Storage
        wx.showModal({
          title: '系统提示',
          content: '更新成功.',
          showCancel: false
        });



      }
    });


  },

  bindNewBookingQR:function(e){
    wx.redirectTo({
      url: '/page/booking/qrBookingNew?userid1='+this.data.booking.userid1,
    })
  },

  bindQrBookingList:function(e)
  {

    wx.switchTab({
      url: '/page/booking/qrBookingList',
    })
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
    wx.redirectTo({
      url: '/page/booking/qrBookingDetails?bookingId=' + page_bookingId,
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