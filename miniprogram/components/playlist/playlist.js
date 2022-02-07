// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表,组件接收的值/数据
   */
  properties: {
  //playlist: Object,

  playlist:{
    type: Object, //接收pages的playlist.wxml的playlist="{{item}}
// observer(){
//数据监听器 旧的写法
// }
}
  },

  // observers数据监听器(监听到属性playlist的数据的变化)，新的写法  val定义的参数
  observers:{

// playlist(val){
//   console.log(val) //拿到整个对象的数据
// }

['playlist.playCount'](count){
  // console.log(count)
  // console.log(this._tranNumber(count, 2)) //这个会不断变化
  // this.setData({ //这样写会死循环，observers监听['playlist.playCount']的不断变化
  //   ['playlist.playCount']:this._tranNumber(count, 2) //保留小数点后的2位数
  // })

  this.setData({
    _count: this._tranNumber(count, 2) //监听某个对象，不建议赋值时再写某个对象，避免死循环，即吧这个['playlist.playCount']换成_count不会死循环
  })

}
  },

  /**
   * 组件的初始数据,本身的数据
   */
  data: {
    _count:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist(){
      wx.navigateTo({ //this.properties.playlist.id这个也可以写成this.data.playlist.id 然后见pages/musiclist.js的onLoading的打印id: console.log(options) 
      url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,  // playlist的数据，_id指的是云数据库的组件的id，id指的是网易云音乐的id
})
    },
    _tranNumber(num,point){ //str.substring(3,7)取到第四位到第七位
      let numStr = num.toString().split('.')[0] //通过点分隔，取到点后的0位数，即是吧点后的都省去
    // console.log(num)
      if (numStr.length < 6) { //6位就是10万
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        // console.log(decimal) //decimal小数点后的数字
        return parseFloat(parseInt(num / 10000) + '.' + decimal) +
          '万'
      }
       else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'  //parseFloat取小数，parseInt取整
      }

    }
  }
})
