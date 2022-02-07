// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getListByCloudFn()  //从云函数取(自己发布的博客)数据，需要用到openid
    // this._getListByMiniprogram()  //从小程序取(自己发布的博客)数据，不需要用到openid
  },

  _getListByCloudFn() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({ //login云函数的index.js文件需要用到openid
      name: 'blog',
      data: {
        $url: 'getListByOpenid',
        start: this.data.blogList.length,
        count: MAX_LIMIT
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })

      wx.hideLoading()
    })
  },


// 云数据库添加get模板输入一下，然后执行，显示19条数据，吧 _openid: 'oLVm55fPnjrJX7KHtAVpnBwu5_eE'去掉也显示19条数据，有时候去掉跟不去掉显示的不一致
// db.collection('blog')
// .where({
//   _openid: 'oLVm55fPnjrJX7KHtAVpnBwu5_eE' //blog数据库有_openid的值
// }).get()


  // _getListByMiniprogram() {
  //   wx.showLoading({
  //     title: '加载中',
  //   })

  //   //小程序的权限设置默认是仅创建者可读写，所以不需要用到openid  |  小程序，创建者能知道自己发布了多少条博客，不知道别人发布了多少条博客  |  云函数，通过openid能知道用户(自己和别人)发布了多少条博客
  //   db.collection('blog').skip(this.data.blogList.length) 
  //     .limit(MAX_LIMIT).orderBy('createTime', 'desc').get().then((res) => {
  //       console.log(res)
  //       let _bloglist = res.data //博客列表/每一个博客
  //       for (let i = 0, len = _bloglist.length; i < len; i++) {
  //         _bloglist[i].createTime = _bloglist[i].createTime.toString() //从服务器端拿到的时间需要字符串类型的，否则createTime会显示NAN
  //       }

  //       this.setData({
  //         blogList: this.data.blogList.concat(_bloglist)
  //       })

  //       wx.hideLoading()
  //     })

  // },

  goComment(event) { //data-blogid="{{item._id}}"和blogId=${event.target.dataset.blogid}
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
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
    this._getListByCloudFn()
    // this._getListByMiniprogram()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) { //这个文件引入的blog-ctrl有open-type="share" data-blog="{{blog}}"
    const blog = event.target.dataset.blog //即data-blog="{{blog}}，即博客对象
    console.log(blog.content)
    return {
      title: blog.content, //博客发布的内容
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})