// pages/demo/demo.js
import regeneratorRuntime from '../../utils/runtime.js'  //regeneratorRuntime 这个必须这样写

Page({

  /**
   * 页面的初始数据
   */

  data: {
    openid:'',
    arr: ['wxml', 'js', 'wxss','json'],
    arrObj:[
      {
      id:1,
      name:'wxml'
    },
      {
        id: 2,
        name: 'js'
      },
      {
        id: 3,
        name: 'wxss'
      },
      {
        id: 4,
        name: 'json'
      }
    ]
  },
  sort(){
const length=this.data.arr.length;
    for (let i = 0; i < length; i++) { //for循环也可以省略
  const x = Math.floor(Math.random() * length)
  const y = Math.floor(Math.random() * length)
  const temp=this.data.arr[x]
  this.data.arr[x]=this.data.arr[y]
  this.data.arr[y]=temp
}
this.setData({
  arr:this.data.arr
})
  },

  sortObj() {
    const length = this.data.arrObj.length;
    for (let i = 0; i < length; i++) { //这个i没用到，for循环不写，效果也是一样的
      const x = Math.floor(Math.random() * length)
      const y = Math.floor(Math.random() * length)
      const temp = this.data.arrObj[x]
      this.data.arrObj[x] = this.data.arrObj[y]
      this.data.arrObj[y] = temp
    }
    this.setData({
      arrObj: this.data.arrObj
    })
  },


  // tcb-router  基于 koa 风格的小程序·云开发云函数轻量级类路由库，主要用于优化服务端函数处理逻辑
  
  // 一个用户只能创建2个云环境      优化路由:tcb-router  一个用户在一个云环境中只能创建50个云函数 koa洋葱模型(node.js有关的，中间件，通过next吧每个中间件关联)

  // 点击两个按钮调用同一个云函数,接收不同的路由请求，获取各自相关的信息

  getMusicInfo(){
    wx.cloud.callFunction({ //wx.cloud.callFunction调用云函数
name:'tcbRouter',
data:{
  $url: 'music'  // $url:'music'固定这样写的，调用music的router
},
}).then((res)=>{
  console.log(res) //errMsg: "cloud.callFunction:ok"调用成功   data: {openId: "oLVm55fPnjrJX7KHtAVpnBwu5_eE", musicName: "数鸭子", musicType: "儿歌"}
      }) //接收不同的路由请求,获取音乐相关的信息
  },

  getMovieInfo(){
    wx.cloud.callFunction({
      name: 'tcbRouter',
      data: {
        $url: 'movie'  // $url: 'movie'固定这样写的，调用movie的router
      },
    }).then((res) => {
      console.log(res)
      }) //接收不同的路由请求,获取电影相关的信息
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  // const obj=new Object();
  // const array=new Array();

  //代码规范建议这样写
  // const obj ={}; 
  // const array = [];

//  wx.cloud.callFunction({
//       name:'login'
//     }).then((res)=>{
//       console.log(res)
//       this.setData({
//         openid:res.result.openid //这个值要在AppData显示出来，需要编译到demo文件
//       })
//     })



    //login的index.js文件是云函数
    //调用云函数,报错是因为没有上传，在login文件夹右键点击创建并部署(不上传node_modules),右下角有上传的进度条，完成上传，然后点击云开发的云函数，上传成功云开发的云函数就有数据，和打印res的返回值
    // let _this=this //用了_this,console的AppData就有openid的值了，不推荐这样写，用箭头函数写
    // wx.cloud.callFunction({
    //   name:'login'  //对应login文件的console.log(event)  console.log(context)
    // }).then(function(res){
    //   console.log(res)
    //   _this.setData({ //this.setData赋值  一开始是this.setData，只要遇到报错什么什么of undefined就有一个是undefined.setData(比如Cannot read property 'setData' of undefined)
    //     openid:res.result.openid
    //   })
    // })


    // new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log(1)
    //     resolve()
    //   }, 1000)
    // }).then((res) => {
    //   setTimeout(() => {
    //     console.log(2)  //写resolve()，.then了才能打印出2
    //   }, 2000)
    // }) 


    // let p1 = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log('p1')
    //     resolve('p1')
    //   }, 2000)
    // })
    // let p2 = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log('p2')
    //     resolve('p2')
    //   }, 1000)
    // })
    // let p3 = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log('p3')
    //     resolve('p3') //这里的resolve没有写参数，Promise.all就不会显示出['p1','p2','p3']，显示[undefined,undefined,undefined]
    //   }, 3000)
    // })

    //  Promise.all([p1, p2, p3]).then((res) => {
    //    console.log('全部完成')
    //    console.log(res) //这个打印出['p1','p2','p3']
    //  }).catch((err) => {
    //    console.log('失败')
    //    console.log(err)
    //  })

    // Promise.race([p1, p2, p3]).then((res) => {
    //   console.log('完成') //Promise.all全部完成才是完成  Promise.race 1个完成其他失败就是完成
    //   console.log(res)
    // }).catch((err) => {
    //   console.log('失败')
    //   console.log(err)
    // })


    // async await ES7         async await是处理异步请求的
    // 云函数端支持async await，小程序端不支持，小程序端需要引用regeneratorRuntime
       
    this.foo()

    // console.log(this.foo()) //async返回的是promise对象

    // this.timeout() //这个返回了1，没有返回resolved

  },
  // foo(){
  // console.log('foo')
  // },

  async foo() {
    console.log('foo')
    // return 1 //这个要注释掉下面的代码才能输出内容
    let res = await this.timeout() //await 相当于等待
    console.log(res) //输出resolved
  },
timeout(){
return new Promise((resolve,reject)=>{
  setTimeout(()=>{
    console.log(1)
    resolve('resolved')
  },1000)
})
},





onGetUserInfo(event) {
  console.log(event)
},

getOpenid() {
  wx.cloud.callFunction({
    name: 'login'
  }).then((res) => {
    console.log(res)
  })
},




})