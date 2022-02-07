// pages/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  onTapQrCode() {
    wx.showLoading({
      title: '生成中',
    })
    wx.cloud.callFunction({
      name: 'getQrCode' //云函数名称(用的云函数文件夹名)
    }).then((res) => {

      console.log(res) //{errMsg: "cloud.callFunction:ok", result: null, requestID: "1ae79c47-b107-11ea-89f3-525400efbfce"}，这个需要在云函数(写了return upload.fileID，这边才能打印到fileId,即res.result)

      const fileId = res.result //fileId是这个result: "cloud://text-h0dmv.7465-text-h0dmv-1302244230/qrcode/1592445655439-0.6061786388342547.png"
      wx.previewImage({ //扫描了显示小程序尚未发布/上线，发布/上线后有保存图片，识别二维码的功能，

        urls: [fileId], //urls图片列表
        current: fileId //current当前要预览的图片的值
      })
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})