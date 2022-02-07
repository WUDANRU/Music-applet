let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,  // blogId是指blog.wxml的blogId="{{item._id}}"
    blog: Object,
  },
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
 // 登录组件是否显示
 loginShow: false,
 // 底部弹出层是否显示
 modalShow: false,
 content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                // console.log(res)
                
                //userInfo是赋值给添加到集合的(userInfo.nickName和userInfo.avatarUrl)
                 userInfo = res.userInfo //拿到头像和昵称  这行代码跟下面的userInfo = event.detail不是同一个
                // 显示评论弹出层
                this.setData({
                  modalShow: true,
                })
              }
            })
          } else {
            this.setData({
              loginShow: true, //授权框显示
            })
          }
        }
      })
    },
    onLoginsuccess(event) { // 首次登录的时候登录框点击允许授权后会弹出评论框
      console.log(event)
       userInfo = event.detail  //components/login.js传出来的userInfo，有没有这个都会显示评论框(已授权时)
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
    },

    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: '',
      })
    },
//     onInput(event){
//       console.log(event)
// this.setData({
//   content:event.detail.value
// })
//     },

    onSend(event) {//event是来自form标签
  console.log(event)
   // let content=this.data.content


  let key='_LbWb4Rah0T43y-xYh9WMUZB70433oPVIhpQI8xqHQ4'
  wx.requestSubscribeMessage({
          tmplIds: [key],
          success:(res)=>{
          if(res[key]=='accept'){
            wx.cloud.callFunction({
              name: 'sendMessage',
            data: {
              // replier: '发送人消息',
              content:  event.detail.value.content,
              blogId:this.properties.blogId
            }
            })
          }
          }
        })



// 插入数据库   // 小程序公众号平台-功能，模板消息-模板库，评价完成通知，点击选用，选中评价结果，评价内容，提交，我的模板，个人模板库，模板ID，新建云函数sendMessage
      // let formId = event.detail.formId  // formId模板推送很重要的属性，打印的话模拟测试显示一段英文，真机是真正的formId，每次提交表单都会生成formId,有效期7天
      let content = event.detail.value.content 
      if (content.trim() == '') { //没有输入内容或输入空格
          wx.showModal({
              title: '评论内容不能为空',
              content: '',
          })
          return
      }
      wx.showLoading({
          title: '评论中',
          mask: true, //蒙版，用户不能进行操作
      })

      //小程序和云函数获取云数据的数据分别是每次20条，100条，小程序和云函数插入数据库择没有数量限制，在云数据库插入和获取是不同的
      
      //小程序吧数据插入云数据库，吧评论内容保存在云数据库的集合里    blog-comment评价的集合，里面是空的
      db.collection('blog-comment').add({ //小程序插入云数据库需要openId(默认有openId,自带的,不需要写的),云函数插入云数据库不需要openId，云函数也可以通过event.openId获取到数据(获取才需要openId)     (小程序默认有openId,云函数没有)
          data: {
              content,
              createTime: db.serverDate(),
              blogId: this.properties.blogId,
              nickName: userInfo.nickName, 
              avatarUrl: userInfo.avatarUrl
          }
      }).then((res) => {
         // (云调用/云开发/云函数/sendMessage)推送模板消息    这个推送消息模拟测试不了，需要真机测试，当评论完成，退出评论，会有服务通知，点击服务消息，会跳转新的页面
         
        //  wx.cloud.callFunction({
        //       name: 'sendMessage',
        //       data: {
        //           content,
        //           // formId,
        //           blogId: this.properties.blogId
        //       }
        //   }).then((res) => {
        //       console.log(res)
        //   })

          wx.hideLoading() //小程序插入成功了在数据库集合里有数据，数据里有openid,小程序插入数据库自带openid
          wx.showToast({
              title: '评论成功',
          })
          this.setData({
              modalShow: false,
              content: '',
          })

          // 父元素刷新评论页面
          this.triggerEvent('refreshCommentList')
      })
      
  }
  }
})
