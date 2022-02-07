// components/blog-card/blog-card.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object //这个是page/blog.wxml的blog="{{item}}"传过来的
  },

  observers: {
    ['blog.createTime'](val) {
      if (val) {
        // console.log(val) //字符串类型的
        this.setData({
          _createTime: formatTime(new Date(val)) //formatTime(new Date(val))的(new Date(val))等于../../utils/formatTime.js的(date)
        })
      }
    }     //输入new Date("Tue Jun 16 2020 15:20:54 GMT+0800 (中国标准时间)")  显示Tue Jun 16 2020 15:20:54 GMT+0800 (中国标准时间)
  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(event) {
      const ds = event.target.dataset
      wx.previewImage({
        urls: ds.imgs,
        current: ds.imgsrc,
      })
    },
  }
})