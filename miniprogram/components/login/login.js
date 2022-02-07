// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event) {
      console.log(event)
      const userInfo = event.detail.userInfo
       //允许授权 //授权成功，需要吧用户信息，比如头像，名称传出去，传给博客blog.js用
      if (userInfo) {
        this.setData({
          modalShow: false
        })
        this.triggerEvent('loginsuccess',{
          userInfo 
        }) //this.triggerEvent吧定义的名称和拿到的值抛出去，抛给博客blog.js用  值userInfo抛出去了也没有用到
      } else { //拒绝授权
        console.log(event)
        this.triggerEvent('loginfail')
      }
    }
  }
})