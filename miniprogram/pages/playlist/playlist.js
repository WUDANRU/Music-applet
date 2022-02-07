const MAX_LIMIT=15
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [
      {
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    // playlist: [
    //   { "_id": "08560c9e5d042a5c0174f1ca26f1d7b2", "copywri天气转热er": "热门推荐", "playCount": 1.4641238e+06, "highQuality": false, "type": 0.0, "canDislike": true, "name": "天气转热了，适合听点凉爽的歌。", "alg": "cityLevel_unknow", "createTime": { "$date": "2019-06-14T23:14:36.746Z" }, "id": 2.780381322e+09, "picUrl": "https://p2.music.126.net/Biky7TE4CtW6NjGuqoUKZg==/109951164041827987.jpg", "trackCount": 53.0 },
    //   { "_id": "08560c9e5d042a5c0174f1da7aa357aa", "highQuality": false, "copywriter": "热门推荐", "canDislike": true, "playCount": 622822.6, "id": 2.740107647e+09, "name": "「时空潜行」囿于昼夜的空想主义者", "type": 0.0, "alg": "cityLevel_unknow", "createTime": { "$date": "2019-06-14T23:14:36.955Z" }, "picUrl": "https://p2.music.126.net/Q0eS0avwGK04LufWM7qJug==/109951164116217181.jpg", "trackCount": 20.0 },
    //   { "_id": "08560c9e5d042a5c0174f1de21c7e79e", "id": 2.828842343e+09, "type": 0.0, "name": "粤语情诗：与你听风声，观赏过夜星", "picUrl": "https://p2.music.126.net/K9IcG8cU6v4_SwuQ_x2xMA==/109951164124604652.jpg", "highQuality": false, "alg": "cityLevel_unknow", "playCount": 1.785097e+06, "trackCount": 52.0, "copywriter": "热门推荐", "canDislike": true, "createTime": { "$date": "2019-06-14T23:14:36.982Z" } },
    //   { "_id": "08560c9e5d042a5d0174f1e67d1bb16f", "playCount": 7.719329e+06, "highQuality": false, "trackCount": 950.0, "alg": "cityLevel_unknow", "id": 9.17794768e+08, "type": 0.0, "name": "翻唱简史：日本四百首", "canDislike": true, "createTime": { "$date": "2019-06-14T23:14:37.037Z" }, "copywriter": "热门推荐", "picUrl": "https://p2.music.126.net/NczCuurE5eVvObUjssoGjQ==/109951163788653124.jpg" },
    //   { "_id": "08560c9e5d042a5d0174f1ea32c4c288", "type": 0.0, "copywriter": "热门推荐", "highQuality": false, "createTime": { "$date": "2019-06-14T23:14:37.097Z" }, "id": 2.201879658e+09, "alg": "cityLevel_unknow", "playCount": 1.06749088e+08, "name": "你的青春里有没有属于你的一首歌？", "picUrl": "https://p2.music.126.net/wpahk9cQCDtdzJPE52EzJQ==/109951163271025942.jpg", "canDislike": true, "trackCount": 169.0 },
    //   { "_id": "08560c9e5d0829820362a79f4b049d2d", "alg": "cityLevel_unknow", "name": "「乐队的夏天」参赛歌曲合集丨EP04更新", "highQuality": false, "picUrl": "http://p2.music.126.net/2WE5C2EypEwLJd2qXFd4cw==/109951164086686815.jpg", "trackCount": 158.0, "createTime": { "$date": "2019-06-18T00:00:02.553Z" }, "copywriter": "热门推荐", "playCount": 1.5742008e+06, "canDislike": true, "id": 2.79477263e+09, "type": 0.0 }

    // ]
    playlist: [] //这个文件的这个数据通过music云函数的index.js文件读取数据库的数据(见music云函数的index.js文件的await cloud.database().collection('playlist'))
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist() //onLoad第一次加载
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
  onPullDownRefresh: function () { //用户下拉清空列表数据，清空之后，加载对应的信息
  this.setData({
    playlist:[], //下拉的时候要从服务端请求新的数据回来,所以要清空
  })
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { //滚动条滚动到底部的时候
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 从服务端获取的数据和从云数据库读取数据

  // music云函数的index.js文件和这个文件夹的playlist.json写的"enablePullDownRefresh":true //允许用户下拉刷新   enablePullDownRefresh跟wx.stopPullDownRefresh()跟onPullDownRefresh: function () {有关系

  _getPlaylist(){ //获取歌单列表
    wx.showLoading({ //请求时间过长的话，需要loading
      title: '加载中',
    })
    wx.cloud.callFunction({ //请求云函数
      name: 'music', //云函数名称
      data: { //start和count是传给music云函数index.js的event.start和event.count

        start: this.data.playlist.length, //不能写成这样start:0 //event.start和event.count 第一次从第0条开始取，取到对应的15条，第二次从第15条开始取
        count: MAX_LIMIT, //15条数据请求2次，目前只有显示30条数据，但是随着定时器的更新，网易云的数据也是不断变化，数据会显示不止30条
        $url: 'playlist' //指定的是playlist路由  music云函数的index.js文件的app.router('playlist'  写了这个是因为一开始是吧数据写在外面，后来吧数据搬到playlist路由里
      } //$url: 'playlist'也指的是pages/playlist/playlist.js
     
    }).then((res) => {  // 箭头函数改变this指向
      // console.log(res) //显示15条数据(res.result.data)
      // console.log(this.data.playlist.length) 第一次显示0 第二次显示15
      this.setData({
        playlist: this.data.playlist.concat(res.result.data)
      })
      // console.log(this.data.playlist.length) 第一次显示15 第二次显示30
      wx.stopPullDownRefresh() // 数据请求回来停止向下刷新的动作，下拉的三个小点存在是因为小程序不知道数据有没有请求回来，这个代码是手动的
      wx.hideLoading()
    })
  }
})