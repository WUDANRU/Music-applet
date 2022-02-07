
let musiclist=[] //这个数据如果是渲染在页面上的话，需要写在data里，这里是在这个页面计算，所以不用写在data里
// 正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager() //api
// let musicId=0
const app = getApp() //调用全局的属性和方法
Page({

  /**
   * 页面的初始数据
   */
  data: {   // .json文件的"disableScroll": true播放器在播放的时候用户不能拖动
    picUrl: '',
    isPlaying: false, // false表示不播放，true表示正在播放
    isLyricShow: false, //表示当前歌词是否显示
    lyric: '',
    isSame: false, // 表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options) //打印出{musicId: "1427681638", index: "8"}  components的musiclist.js的url: `../../pages/player/player?musicId=${musicid}`跳转到这个页面，加载可以打印musicId
    nowPlayingIndex = options.index //通过index取到缓存里歌曲的信息
    musiclist = wx.getStorageSync('musiclist') //需要用同步缓存，获取成功后再去执行下面的操作    getStorageSync跟两个musiclist有关
    // console.log(musiclist)
    // this._loadMusicDetail()
    // console.log(options)


    this._loadMusicDetail(options.musicId) //options.musicId，实参

  //  musicId=parseInt(options.musicId) //let musicId=0
  //   this._loadMusicDetail(musicId)
     

  },

  _loadMusicDetail(musicId) { //musicId 形参
    if (musicId == app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame:false 
      })
    }
    // 这里我给你优化下写法
    // this.setData({
    //   isSame: musicId == app.getPlayMusicId()
    // })
    if (!this.data.isSame) { //不是同一首歌曲需要停止
        backgroundAudioManager.stop()
    }

    // backgroundAudioManager.stop() //切换上一首和下一首的时候吧正在播放的那一首先暂停
    
    let music = musiclist[nowPlayingIndex]
    // console.log(music)
    wx.setNavigationBarTitle({
      title:music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false, //进来的时候是不播放的
    })
    // 左下角的播放暂停，返回到歌单，歌单不会高亮显示，因为跟musicId的type有关，所以在components/musiclist.js的show写上parseInt
    
    // components/musiclist.js(?musicId=${musicid})的id的值是设置的data-musicid,id是string   
    // onPrev()和onNext()的id的值是从(components/musiclist.js)缓存的id拿的，id是number(没有加引号的是number)，playingId

    // playingId和item.id的type不同不相等:components的musiclist.wxml的{{item.id === playingId ? 'playing': ''}}"和musiclist.js的show(){}的setData的playingId

    // console.log(musicId, typeof musicId) //当前这首打印出1426959223 string  上一首和下一首打印出408140418 "number"  点击当前这首和切换上一首和下一首
    app.setPlayMusicId(musicId) //调用全局的方法  //app.js-player.js-components/musiclist

    //请求数据的时候加载loading
    wx.showLoading({
      title:'歌曲加载中',
    })

    wx.cloud.callFunction({ //请求数据的时候了
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {

      // console.log(res)

      // console.log(JSON.parse(res.result)) //里面的url是mp3，可以粘贴在浏览器，可以播放歌曲 (要吧打印出的内容完全展开找到url再复制粘贴到浏览器)
      let result = JSON.parse(res.result)
      if(result.data[0].url==null){ //网易云的vip歌曲是无权限播放的,不写这个的话，歌单播放了会错乱
        wx.showToast({
          title:'无权限播放',
        })
        return
      }
      if (!this.data.isSame) { //如果不是同一首歌需要重新播放，同一首歌就不需要重新播放

        backgroundAudioManager.src = result.data[0].url //src是歌曲播放/音频播放，只要设置src，这个歌曲就要重头播放   
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放历史
        this.savePlayHistory() //歌曲播放的时候(backgroundAudioManager.src = result.data[0].url)保存到本地

    }

      // //后面这些代码在小程序界面左下显示的
      // backgroundAudioManager.src=result.data[0].url //云函数里只拿了一个数据来用，其他用的是缓存里的
      // backgroundAudioManager.title = music.name //没有title会报错，而且不会播放  app.json配置了一个requiredBackgroundModes，audio在后台播放，没人配置会报错
      // backgroundAudioManager.coverImgUrl = music.al.picUrl  //封面地址
      // backgroundAudioManager.singer = music.ar[0].name  //歌手信息
      // backgroundAudioManager.epname = music.al.name  //专辑名字      coverImgUrl，singer，epname都是api  
     
      this.setData({
        isPlaying:true  // 请求完数据要改为播放状态
      })
      wx.hideLoading()
      
     // 加载歌词  这个嵌套在上面的云函数里面，先拿到音频地址backgroundAudioManager.src，等到音乐播放了再加载歌词(歌词在封面信息背面)
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric',
        }
      }).then((res) => {
        // console.log(res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
       
        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
      })

  }, // 调用定义的云函数 music云函数的index.js文件的app.router('musicUrl'
  
 togglePlaying() { //如果正在播放就显示暂停按钮，如果暂停就显示播放按钮
    // 正在播放
    if (this.data.isPlaying) {
      backgroundAudioManager.pause() //自带方法，暂停
    } else {
      backgroundAudioManager.play() //自带方法，播放
    }


   this.setData({ //不写这个点击播放歌曲和暂停就只有一次效果，再点击就没反应了 而且<image class="player-img rotation {{isPlaying?'':'rotation-paused'}}"这个的rotation-paused样式也不会起作用

      isPlaying: !this.data.isPlaying //取反，随意点击切换暂停还是播放的按钮，和随意点击会播放歌曲和暂停歌曲
    
    })
  },

  onPrev() { //musiclist.length是多少首歌 最后一首歌的下标是musiclist.length-1
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1 //小于0的话(第一首是0)，需要播放最后一首歌
    }
    // console.log(musiclist) //点击上一首打印出数据
    // console.log(musiclist[0].id)
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)  //this._loadMusicDetail(options.musicId) musicId就是item.id
  },
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event) {
    // console.log(event)
    this.selectComponent('.lyric').update(event.detail.currentTime) //.lyric是选择器(这个选择器给了x-lyric组件)，update是方法，在lyric.js有这个update方法
  },
  onPlay() { //左下角的点击播放/暂停能跟界面上的播放/暂停同步
    this.setData({
        isPlaying: true,
    })
},
  onPause() {
      this.setData({
          isPlaying: false, //左下角的播放暂停，返回到歌单，歌单不会高亮显示，因为跟musicId的type有关
      })
    },

    // 保存播放历史
    savePlayHistory() {
      const music = musiclist[nowPlayingIndex] //当前正在播放的歌曲
      const openid = app.globalData.openid
   
      const history = wx.getStorageSync(openid) //一般先采用getStorageSync，后面不需要执行下一个用同步异步都可以，这个执行完才能做下一个用同步，不用等这个执行完可以同时执行下一个，用异步
      // console.log(typeof openid) //string
      let bHave = false //歌曲是否存在  去重操作 //标志位，如果是相同的歌曲就不添加到本地，相同的就把播放的歌曲往前面添加
    
      for (let i = 0, len = history.length; i < len; i++) {
          if (history[i].id == music.id) {
              bHave = true   // 相等就表示存储在缓存中了
              break
          }
      }

      // const listen=history.filter(val=>val!=music)
      // wx.clearStorageSync(openid,listen)
      if (!bHave) {
        history.unshift(music) //往前面添加播放的歌曲，music即播放的歌曲，push是往后添加
          // wx.setStorage({ //key是字符串
          //     key: openid, //key是唯一标识，相同的两个key,后面的会吧前面覆盖掉  全局的openid也是唯一标识
          //     data: history,
          // })
          wx.setStorageSync(openid,history) //同步要这种写法，异步要上面注释的写法，写的才对
        
      } //见player.js的保存播放历史
  }



  //   savePlayHistory() {
     
  //     const music = musiclist[nowPlayingIndex]
  //     const openid = app.globalData.openid
  //     console.log(music, openid)
      
  //     let history = wx.getStorageSync(openid) || []
  //     console.log(history)

  //     history = history.filter(row => row.id != music.id)
  //     history = history.unshift(music)
  //     console.log(history)

  //     // wx.setStorageSync(openid, history)
  // }

})

