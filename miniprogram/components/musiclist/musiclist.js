const app = getApp() //调用全局的属性和方法
Component({
  /**
   * 组件的属性列表
   */
  properties: { //组件调用时传递给我这边的  data是内部的数据
    musiclist:Array
  },//app.js-player.js-components/musiclist

  /**
   * 组件的初始数据
   */
  data: { //playingId播放的id
    playingId: -1 //初始值-1，实际情况的musicid不能是-1，不能和实际情况冲突
  },
  pageLifetimes: {
    show() { //生命周期函数，页面被展示 // 加上parseInt，因为左下角的播放暂停，返回到歌单，歌单不会高亮显示，因为跟musicId的type有关(见player.js的console.log(musicId, typeof musicId))
        this.setData({ //parseInt转换为number型(即整型)
            playingId:parseInt(app.getPlayMusicId()) // 点击歌单会高亮显示，然后等切换下一首，高亮显示还是停留在刚才的位置，所以app.js写了playingMusicId和getPlayMusicId
        })
    }  //原来不补充细节点击歌单会显示高亮，现在歌单倒不会显示高亮了，要加parseInt才能显示高亮
},
  /**
   * 组件的方法列表
   */
  methods: {
//上面的编译-点击添加编译模式-吧打印出来的参数playlistId= 2851627206设置到编译的参数上，显示是当前进入的页面
    onSelect(event) {

// console.log('被选中')  事件源是这个文件夹下的{{item.name}}，点击事件源冒泡到绑定的事件上  currentTarget绑定的事件
      // console.log(event) //事件源target的dataset: {}和绑定事件currentTarget的dataset: {index: 1, musicid: 1444503072}      (data-musicid和musicid: 1444503072)
    
      // 事件源 事件处理函数(onSelect) 事件对象(event) 事件类型(type: "tap")

      // console.log(event.currentTarget.dataset.musicid)
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        // url: `../../pages/player/player?musicId=${musicid}`  当前文件夹的wxml的data-index="{{index}}"就是ds.index
        url: `/pages/player/player?musicId=${musicid}&index=${ds.index}`, //通过index取到缓存里歌曲的信息，跳转到player页面，可以看到歌曲对应的musicId和index
      })
    }  // ?musicId= 这个musicId是自己定义的变量，会传到player.js文件的onLoad: function (options){console.log(options.musicId)}
  } 
}) //player.js的onLoading的this._loadMusicDetail(options.musicId)和url: `/pages/player/player?musicId=的musicId需要一样，musicId是自己定义的变量名