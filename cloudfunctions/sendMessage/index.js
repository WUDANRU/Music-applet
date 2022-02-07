// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {
  // env: cloud.DYNAMIC_CURRENT_ENV
}
)
//  "templateMessage.send"
// 云函数入口函数    //微信公众平台登录 设置-完善设置的基本信息后可以看到主体信息是个人，功能-订阅消息(完善了就可以开通订阅消息)，就有模板消息
exports.main = async (event, context) => {

   const {OPENID} = cloud.getWXContext()
  const result = await cloud.openapi.subscribeMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,   // 希望用户打开的页面  // config.json配置模板消息的权限,才能调用模板消息的方法
    lang: 'zh_CN',
    data: { //关键词至少2个参数     // 微信公众号-小程序公众号平台-功能，订阅消息-公共模板库评价场景说明随便输入，点击提交
      thing1: { //微信公众号-小程序公众号平台-功能，订阅消息-我的模板-详情-关键词 评价结果:{{thing1.DATA}}  评价内容:{{thing2.DATA}} 
      
       value: '评价完成'
      },
      thing2: {
        value: event.content
      }
    },
    templateId: '_LbWb4Rah0T43y-xYh9WMUZB70433oPVIhpQI8xqHQ4', //模板ID 订阅消息-我的模板就有
    // formId: event.formId,
    miniprogramState: 'developer',
    emphasisKeyword: 'thing1.DATA'
  })
  return result
}