// 搜索的关键字
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制底部弹出层是否显示
    modalShow: false,
    blogList: [],
  },

  // 发布功能    
onPublish() {
  // 判断用户是否授权
  wx.getSetting({
    // success(res){ 原来是这样的，然后下面的this.setData的this显示undefined
    success: (res) => { //用户是否授权写在wx.getSetting里
      console.log(res) // {scope.userInfo: true} //清缓存可以清理缓存数据，就相当于吧里面的授权清除了变为没有授权，在打印的authSetting里scope.userInfo:true表示已授权用户信息，如果是空的表示未授权   scope.userLocation:true授权地理信息
      if (res.authSetting['scope.userInfo']) { //需要清除授权数据才有弹出框(login里的bottom-modal)，点击获取授权的button并且点击允许授权，成功后可以拿到头像等用户信息
        wx.getUserInfo({ 
          success: (res) => { //授权成功
            // console.log(res) //跟login.js的onGotUserInfo(event){ console.log(event)打印的一样，因为是login.js授权成功传出来的
            this.onLoginSuccess({ // 调用下面的onLoginSuccess方法
              detail: res.userInfo 
            }) //detail: res.userInfo的detail是自定义的
          }
        })
      } else { //如果没有授权弹出底部弹出框
        this.setData({
          modalShow: true,
        })
      }
    }
  })
},
  onLoginSuccess(event) { //授权成功  //事件处理函数 这个event是上面的this.onLoginSuccess({detail: res.userInfo})
    // console.log(event)
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginFail() { //拒绝授权
    wx.showModal({
      title: '授权用户才能发布',
      content: ''
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.scene) //这个要小程序码上线发布才有效果              
    wx.showLoading({
      title: '拼命加载中',
    })
    this._loadBlogList() 

       
       // 小程序端调用云数据库  小程序端和云数据库查询的数据20条和25条是因为小程序一次只能查询20条数据，云数据库一次能查询100条数据
        /*  const db = wx.cloud.database()
         db.collection('blog').orderBy('createTime', 'desc').get().then((res)=>{
           console.log(res) //这里数据显示里面有20条数据，新建_count模板,输入db.collection('blog').orderBy('createTime', 'desc').get()显示25条数据
           const data = res.data
           for (let i = 0, len = data.length; i<len; i++){

             data[i].createTime = data[i].createTime.toString() 
             //吧createTime转换为字符串，blog-card.js的observers的val(val即createTime)需要字符串类型(否则时间都是显示NAN)
           }
           
           this.setData({
             blogList: data
           })          //云开发-数据库-权限设置的服务端指的是云函数(云函数运行在服务端)
         }) */  //吧上面的this._loadBlogList()先注释掉，blog-card.js的observers变成了NAN，要多加for循环这段代码
  },
  onSearch(event) {
    // console.log(event.detail.keyword)
    this.setData({
        blogList: [] //点击后先清空，因为是新的数据
    })
    keyword = event.detail.keyword
      wx.showLoading({
      title: '拼命加载中',
    })
    this._loadBlogList(0) //从零开始取数据，如果0没有传默认就是0(start = 0)
},
  _loadBlogList(start = 0) {
    // wx.showLoading({
    //   title: '拼命加载中',
    // })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword, //回到云函数中接收keyword
        start, //如果写成这样start:0,上拉触底会无限加载    可以写成start:this.data.blogList.length  start代表从第几条取数据，count代表1次取几条数据
        count:10,
        $url:'list',
      }
    }).then((res) => {
      wx.hideLoading()
      // console.log(res)
      // console.log(this.data.blogList.length,'第一次')
      this.setData({
        blogList: this.data.blogList.concat(res.result.data)
      })
      // console.log(this.data.blogList.length,'第二次')
     
      wx.stopPullDownRefresh() //停止下拉刷新   "enablePullDownRefresh": true
    })
  },
  goComment(event) {
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
  },
  onPullDownRefresh: function() { //下拉刷新，数据变为空，然后从第0条数据开始加载
    this.setData({
      blogList: []
    })
    let pages = getCurrentPages()
 
    let prevPage = pages[pages.length - 2]
    
if(!prevPage){ //如果不是上一个页面
  wx.showLoading({
      title: '拼命加载中',
    })
}

    this._loadBlogList(0)

    // wx.hideLoading()//这个是因为this._loadBlogList(0)里面有showLoading，blog-edit.js又有写了这句prevPage.onPullDownRefresh()
    // 就是不希望blog-edit.js再有这个拼命加载中的loading

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    wx.showLoading({
      title: '拼命加载中',
    })
    this._loadBlogList(this.data.blogList.length) //上拉触底从最后的数据加载
  // console.log(this.data.blogList.length,'------------------')
  },
// play(a){
//   this._loadBlogList(a) 
// }
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    // console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
    }
  }
})