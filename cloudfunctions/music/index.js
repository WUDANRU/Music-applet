// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router') //require加载一个模块 刚刚报错是因为这个没有写，再报错是因为没有上传并创建

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数    //安装tctb-Router 右键在终端打开npm install --save tcb-router

exports.main = async (event, context) => {        //这个跟tcbRouter的有点不同，不需要全局中间件了
 
  const app = new TcbRouter({ //tcb自动帮我们处理事件中的参数和路由转发
    event //event参数
  })


app.router('playlist',async(ctx,next)=>{
  ctx.body = await cloud.database().collection('playlist') //写在里面，要吧return换成ctx.body=
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then((res) => {
      return res
    })
})

  app.router('musiclist', async (ctx, next) => { 
     
    //向服务端发送请求需要安装request request-promise music云函数右键在终端打开npm install --save request和npm install --save request-promise

    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId)) //event.playlistId指的是pages/musiclist/musiclist.js的 playlistId: options.playlistId  //event.playlistId返回的是字符串
      .then((res) => {
        return JSON.parse(res)  //res返回的是字符串  JSON.parse和parseInt都是吧返回的字符串转换为对象
      })
  })

  app.router('musicUrl', async (ctx, next) => { //这个是可以播放歌曲的MP3接口
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => { //event.musicId指的是player.js文件的wx.cloud.callFunction({ name: 'music', data: { musicId,
      return res
    })
  }) //music云函数文件夹的index.js文件右键点击云函数增量上传:更新文件，跟上传并部署是一样的




  app.router('lyric', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })



  return app.serve() //我需要吧当前的服务进行返回

//   return await cloud.database().collection('playlist')  //一开始是这样写的，用于pages的playlist.js的_getPlaylist(),后面才做优化的
//   .skip(event.start)
//   .limit(event.count)
//   .orderBy('createTime','desc') // 是由{ getPlaylist文件夹的index.js插入在云数据库的playlist集合的createTime: db.serverDate() }获取的createTime
//   .get()
//   .then((res)=>{
// return res
//   })

  //当前数据库的集合playlist (cloud.database当前数据库)   skip(event.start)歌单数据比较多，下拉的时候也要分页去加载歌单数据    limit(event.count)每次查询的对应的歌单总数
  //orderBy排序 新的歌单排在前，旧的歌单排在后  createTime排序的时候对应的字段  desc逆序，排列的顺序，默认是正序的

}