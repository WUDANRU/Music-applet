// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: { //data的数据可以在控制台的AppData看到，listInfo的数据写在当前文件夹下的musiclist.wxml，musiclist的数据写在components/musiclist/musiclist.wxml
    musiclist: [],  //这个数据写在当前文件夹下的musiclist.wxml
    listInfo: {},   //这个数据写在components/musiclist/musiclist.wxml
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // console.log(options) //点击歌曲列表的歌曲能够跳转并打印id   由compoments/playlist.js来的id(playlistId)
    wx.showLoading({
      title:'加载中',
    })
    // 通过id去数据库取歌曲列表的信息，调用music云函数是因为歌曲信息都在这个music云函数里
    wx.cloud.callFunction({
      name: 'music', //music云函数
      data: {
        playlistId: options.playlistId, //吧这个传给music云函数的event.playlistId
        $url: 'musiclist' //这个也是指pages/musiclist/musiclist,这个是固定这样写
      }
    }).then((res) => {
      // console.log(res) //需要点击音乐列表的某一个才会显示有数据，不然会显示null
      const pl = res.result.playlist
      this.setData({
        musiclist: pl.tracks,
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name,
        }
      })
      this._setMusiclist() //吧res的部分数据(即musiclist数据)存储到storage setStorage异步 setStorageSync同步
      wx.hideLoading()
    })

  },
  
  _setMusiclist() {  //点击控制台的Storage，回到首页点击歌单列表就会跳转到新页面，可以看到缓存变化,( this.data.musiclist是保存在缓存里的 )
    // console.log(this) //_setMusiclist()这个是被挂在了this上了( this._setMusiclist() )，才能显示有东西
    
    wx.setStorageSync('musiclist', this.data.musiclist)//这里可以用setStorage或者setStorageSync，因为写完下面一句后面没有什么要写了

    // setStorage异步，就是还没执行成功能执行其他操作   setStorageSync同步，就是执行完成后才能执行其他操作

    //setStorageSync(key,data) 当有相同的key时，后面的setStorageSync(key,data)会把前面的覆盖掉
  },
})