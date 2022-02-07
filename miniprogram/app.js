//app.js
App({
  onLaunch: function () { //onLaunch开始，发动，微信一启动就调用这个代码
    this.checkUpate()

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'text-h0dmv',
        traceUser: true, 
      })
    }

    this.getOpenid()

// 点击歌单会高亮显示，然后等切换下一首，高亮显示还是停留在刚才的位置，所以app.js写了playingMusicId
this.globalData = {  //全局属性
  playingMusicId: -1, //有些界面有的会对playingMusicId取值，有的对playingMusicId赋值
  openid: -1
}

},

// onShow(options){
//   console.log('onShow 执行')
//   console.log(options)
// },

  setPlayMusicId(musicId) { //对playingMusicId赋值，setPlayMusicId设置值需要传进来参数(musicId) 
    this.globalData.playingMusicId = musicId   //app.js-player.js-components/musiclist
  },
  
  getPlayMusicId() { //对playingMusicId取值
    return this.globalData.playingMusicId
  },

  getOpenid() { //在login云函数拿到openid  前面写了this.getOpenid()
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      const openid= res.result.openid
      this.globalData.openid=openid
      if (wx.getStorageSync(openid) == '') { //如果openid是空的，吧openid, []保存到本地(Storage)
        wx.setStorageSync(openid, []) //wx.setStorageSync(key,data)，key和openid都是唯一标识，key即openid
      }

    }) //openid不等于空的在player.js写了

  },
  


  //小程序更新机制
  checkUpate(){ //前面有this.checkUpate()
    const updateManager = wx.getUpdateManager() //更新管理器对象，获取全局唯一的版本更新管理器，用于管理小程序更新
    // 检测版本更新
    updateManager.onCheckForUpdate((res)=>{ //向微信后台请求检查更新结果事件的回调函数
      if (res.hasUpdate){ //hasUpdate是否有新版本
        updateManager.onUpdateReady(()=>{ //小程序有版本更新事件的回调函数,监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用',
            success(res){ //点击确定，新版本会应用，并且重启
              if(res.confirm){ //点击确定    在音乐页面添加编译模式，编译设置选中下次编译时模拟更新，出现模态框，点击确定，小程序会重启
                updateManager.applyUpdate() //新版本会应用，并且重启
              }
            }  
          })
        })
      }
    })
  },

})