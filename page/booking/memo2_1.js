let util = require('../../util/util.js');
// page/booking/memo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memo2_1Length: 0,
    memo2_1Max: 200,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.bookingId;
    if (id != 'undefined') {
      this.initBooking(id);
    }
  },
  initBooking: function (id) {
    var that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/byId',
      method: 'post',
      data: {
        id: id

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
          memo2_1Length: booking.memo2_1.length,
          memo2_1Length: booking.memo2_1.length
        });
        console.log("booking userid1:" + booking.userid1);
        if (getApp().globalData.userid == booking.userid1) {
          that.setData({
            datePickerDisabled: false
          })
        };


      }
    })
  },
  
  inputMemo2_1: function (e) {
    //console.log("memo2_1:"+e.detail.value);
    let memo2_1 = e.detail.value;

    this.setData({
      memo2_1: memo2_1,
      memo2_1Length: memo2_1.length,
      buttonIsReady: true
    });

  },
  bindUpdateMemo2_1: function (e) {
    let that = this;
    wx.request({
      url: getApp().globalData.SERVER_URL + '/booking/update',
      method: 'put',
      data: {
        id: that.data.booking.id,
        memo2_1: that.data.memo2_1
      },
      success: function (res) {
        console.log("id:" + res.data[0].id);
        that.initBooking(res.data[0].id);
        that.setData({
          buttonIsReady: false
        });

        //set userid 2 Storage
        wx.showToast({
          title: '更新成功',
        });
        wx.redirectTo({
          url: '/page/booking/bookingDetails?bookingId=' + res.data[0].id,
        });


      }
    });


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