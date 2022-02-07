
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数    云调用生成小程序码，这个小程序用客户扫一扫，能够知道是谁分享的
exports.main = async(event, context) => {  //config.json的openapi.wxacode.getUnlimited是接口方法
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({ 

    //当上线，用户扫描会进入/跳转到page: "pages/blog/blog"，拿到scene的值，即在blog/index.js的onLoad有console.log(options.scene)可以实现电商分销等功能
    scene: wxContext.OPENID, //这个只能是32个字符串，OPENID是28位字符串   拿的是在login云函数的openId
    // page: "pages/blog/blog", //只有上线/发布才用这个page,page如果有参数要写在scene上
    lineColor: { //rgb颜色，是太阳射光的颜色
      'r': 211,
      'g': 60,
      'b': 57   //云函数获取数据需要用到openId,如果是从数据库去就不用openId，如果是插入/存储到数据库再取出来的就需要openId（openId知道是谁发布的博客和分享的二维码）
    },
    isHyaline: true //透明背景，默认背景是白色的
  })

  //profile的wxml和js文件(bind:tap="onTapQrCode"和onTapQrCode)，需要点击我的页面(profile)的小程序码，这个在云函数云端测试才能打印出来
  console.log(result) //返回buffer二进制，通过云存储吧二进制转换成用户常用的图片格式

  // 吧buffer二进制上传到云存储
  const upload = await cloud.uploadFile({ //在云函数里调用云存储
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png', //上传的路径，qrcode是云存储新建的文件夹
    fileContent: result.buffer //buffer二进制
  })
  return upload.fileID //会给我们返回fileID，返回到小程序的调用端(profile.js文件的const fileId = res.result)

}
  // 返回buffer二进制是不能直接用的，通过云存储吧它转换成用户常用的图片格式


