// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router') //require加载一个模块  //一个用户在一个云环境中只能创建50个云函数和一个用户只能创建2个云环境  //koa洋葱模型/koa中间件
cloud.init()

// 云函数入口函数    //洋葱模型: 点击模拟器的获取音乐信息(demo.wxml)，吧当前这个index.js文件上传并部署，点击日志，选择tcbRouter,看到输出的:进入全局中间件 进入音乐名称中间件
exports.main = async (event, context) => { //写完云函数代码，点击上传并部署后，调用云函数(见demo.js文件)

//  tcbRouter云函数右键点击在终端打开，输入命令npm install --save tcb-router

  const app = new TcbRouter({ //tcb自动帮我们处理事件中的参数和路由转发   github搜索tcb-router   
    event //event参数
  })

  app.use(async (ctx, next) => { //openId是音乐和电影共有的，app.use这个代码是音乐和电影共用的，app.use写了await next()才能用音乐和电影的代码
    console.log('进入全局中间件')
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId //小程序的健全机制可以获取用户的openId，event.userInfo.openId小程序自带的  //event如果在当前作用域取不到会去上一级作用域去找
    await next()
    console.log('退出全局中间件')
  })

  app.router('music', async (ctx, next) => { //配置音乐路由      app.router('music'和app.router('movie'固定是这样写的
    console.log('进入音乐名称中间件') //中间件
    ctx.data.musicName = '数鸭子'
    await next() //这个是执行下面的ctx.data.musicType = '儿歌'
    console.log('退出音乐名称中间件')
  }, async (ctx, next) => {
    console.log('进入音乐类型中间件') //中间件
    ctx.data.musicType = '儿歌'
    ctx.body = {
      data: ctx.data //吧data的值进行返回，因为data里既有openId，musicName，musicType
    }
    console.log('退出音乐类型中间件')
  })

  app.router('movie', async (ctx, next) => {
    console.log('进入电影名称中间件')
    ctx.data.movieName = '千与千寻'
    await next()
    console.log('退出电影名称中间件')
  }, async (ctx, next) => {
    console.log('进入电影类型中间件')
    ctx.data.movieType = '日本动画片'
    ctx.body = {
      data: ctx.data
    }
    console.log('退出电影类型中间件')
  })

  return app.serve() //我需要吧当前的服务进行返回

}