// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: { //这个是player.wxml的isLyricShow="{{!isLyricShow}}"传递过来的
      type: Boolean,
      value: false,
    },
    lyric: String, //接收player.wxml文件传来的，并监听lyric
  },

  observers: {
    lyric(lrc) {
      // console.log(lrc)
      if (lrc == '暂无歌词') { //没有这个methods的console.log(lrcList)打印出空数组，有这个打印出暂无歌词
        this.setData({
          lrcList: [{
            lrc,
            time: 0, //如果暂无歌词，time初始值为0
          }],
          nowLyricIndex: -1 //谁也不高亮选中
        })
      } 
      else { //不加else,暂无歌词页面上显示不出来
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [], //数组里有歌词和时间
    nowLyricIndex: 0, // 当前选中的歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
  },

  lifetimes: { //所以生命周期函数都需要写在lifetimes里面
    ready() { //换算，吧rpx换算成px   .lyric {  min-height: 64rpx; }是单句歌词的高度
       // 在小程序里每个手机的宽度都是750rpx，rpx是相对单位,res.screenWidth是px单位
      wx.getSystemInfo({ //能够获取不同手机的信息
        success(res) {
          // console.log(res) //res.screenWidth:320当前屏幕的宽度，px单位
          //求出1rpx的大小，res.screenWidth / 750
          lyricHeight = res.screenWidth / 750 * 64 //当前屏幕下每一行歌词的高度
        },
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) { //这个是player.js的timeUpdate(event)方法传过来的
      // console.log(currentTime)
      let lrcList = this.data.lrcList
      // console.log(lrcList)  // 2: {lrc: "如果云层是天空的一封信", time: 1.078}
      if (lrcList.length == 0) {
        return
      }

       // 因为有的歌唱到末尾的歌词滚动就停了，还有其他歌词信息没有滚动到最后，所以用到scrollTop
      if (currentTime > lrcList[lrcList.length - 1].time) { //lrcList[lrcList.length - 1].time最后一个歌词的时间
        if (this.data.nowLyricIndex != -1) { 
          this.setData({
            nowLyricIndex: -1,//-1是哪一句歌词都不会高亮显示
            scrollTop: lrcList.length * lyricHeight //lyricHeight是px单位
          })
        }
      }
      
      // for(let i=0;i<3;i++)或for(var i=0;i<3;i++)输出的i都是 0，1，2，length为3，最后一个索引是length-1或i-1
      for (let i = 0, len = lrcList.length; i < len; i++) { //for循环遍历每句歌词
        // console.log(lrcList.length) //6
        // console.log(i) //0,1,2,3,4,5(下标)
        if (currentTime <= lrcList[i].time) { //高亮显示的歌词    currentTime当前时间    lrcList[i].time当前遍历的数组的时间(.time时间    lrcList[i]，是个对象，当前遍历的数组)
          this.setData({
            nowLyricIndex: i - 1, // i - 1当前这句歌词的索引
            scrollTop: (i - 1) * lyricHeight  //scrollTop向上滚动   遍历到的每句歌词的高度向上滚动
          })
          break //当前这句歌词高亮显示了就不用for循环了
        }
      }

    },
    _parseLyric(sLyric) { //解析歌词
      // console.log(sLyric) //[00:01.078]如果云层是天空的一封信
      let line = sLyric.split('\n') //换行
      // console.log(line) //返回数组，0: "[00:00.000] 作曲 : 小5"  1: "[00:00.359] 作词 : 申名利"  2: "[00:01.078]如果云层是天空的一封信"
      let _lrcList = []
      line.forEach((elem) => { // (\d{2,3}) \d表示数字 2,3表示是2位数还是3位数，对于时间这个毫秒有的是2位数，有的是3位数  \d{?}表示0个或是1个  {2,}有逗号表示2个或2个以上
      //   (?:\.(\d{2,3}))?这个的最后加了问号

//   /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g的[]代表[00:00.000]的[]

        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g) //match匹配  匹配正则表达式   ?:\.是冒号还是点的方式都取到
        // console.log(time) //["[02:20.180]"]
        
        if (time != null) {
          // console.log(time[1]) //undefined
 //返回歌词lrc 因为是以分，秒，毫秒为单位的所以还要分割
          let lrc = elem.split(time)[1] //通过time去分割得到数组，elem.split(time)[0]是时间
          // console.log(time) //["[02:46.082]"]
          // console.log(time[0]) //[02:46.082]，这个在if (time != null)外面打印不出值
          // console.log((elem.split(time)[0])) //显示空白
          //timeReg这个要转换成秒和onTimeUpdate的秒比较
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/) //time[0]指的是时间(不是指elem.split(time)[0]) //正则表达式匹配这个[02:20.180]，分，秒，毫秒
          // console.log(timeReg) //返回数组  0: "00:00.000"  1: "00"  2: "00"  3: "000"，1是分，2是秒，3是毫秒
          
          // 把时间转换为秒   //* 60是1分钟等于60秒  parseInt转换为整型  / 1000是1秒等于1000毫秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000 
          //  console.log(time2Seconds)

          _lrcList.push({ //吧歌词进行存储，每次去循环的时候，给这个对象push值
            lrc, //elem.split(time)[1]这个是歌词
            time: time2Seconds, //代表这句歌词的当前秒数
          })

        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})