
let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '请输入关键字'
    }
  },

//这个是pages/blog/blog.wxml的iconfont="iconfont" icon-sousuo="icon-sousuo"传过来的，因为是用到全局下的iconfont.wxss文件(全局下的iconfont.wxss文件指的是miniprogram下的iconfont.wxss文件)
  externalClasses: [  //这里面放的是类名
    'iconfont',
    'icon-sousuo',
  ],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      // console.log(event)
      keyword = event.detail.value //输入关键字
    },

    onSearch() {
      // console.log(keyword) //显示关键字
     
      this.triggerEvent('search', { //吧关键字抛给调用方(倾向这个)或者吧查询的事件写在这里(只能在这里使用)
        keyword
      })
    },
  }
})