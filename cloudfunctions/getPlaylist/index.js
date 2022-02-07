// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise');

const URL = 'http://musicapi.xiecheng.live/personalized' // 网易云音乐推荐给我们的歌单信息

const db=cloud.database()

const playlistCollection=db.collection('playlist')

const MAX_LIMIT = 100 //假设每次取100条     因为是playlist集合只有30条数据，为了能测试到分3次取数据的代码可以先写成10，然后测试一次再改成100(因为当前的集合数据比较少(比如30条，每次取10条)，但之后会增多(比如210条，每次取100条))


// 定时触发器 定时触发云函数 新建的config.json的名字是不能改变的,开发文档-云函数-定时器，    "name":"myTrigger"，myTrigger这个可以更改，其他是固定的
// "config": "0 0 10,14,16,23 * * * *" 每天的10点/14点/16点/23点，都会获取网易云音乐推荐给我们的歌单信息，到配置的这个时间就会去触发对应的云函数

// getPlaylist右键点击上传触发器，点击云函数-配置-超时设为20秒(3秒满足不了我们,网络不好的话超过时间会报错，改为20秒)    

// 云函数的云测试结果显示null(需要改代码)/0(数据库如果是刚创建的新的集合playlist，云函数点击云测试就会变成30，再点击云函数的云测试结果显示0)/30(返回的30条数据，需要吧数据库的playlist删除，再点击数据库创建新的集合playlist，再点击云测试才会显示30，再点击云测试就显示0了)
// 云函数的云测试结果显示null/0/30，都是正常的     假如测试失败，测试不符合自己所想或者这个文件有修改代码，可以吧getPlaylist重新上传并部署


// 云函数入口函数   //分三次去取才能完全取到原来的集合playlist全部的值和 从服务器端获取到值和 去重和 将数据一条一条插入到云数据库和 设置定时触发器
exports.main = async (event, context) => {

// 使用第三方发送请求库(request/request-promise/axios)，云函数向服务端发请求  // node -v / npm -v / npm install --save request(安装在生产环境的，-D是安装在开发环境)

// npm install --save request      npm install --save request-promise
 
 // 这个存的是歌单里已有的数据   这个代码在云函数的数据库的集合中只能获取100条数据，需要做优化，因为随着时间变化，URL网易云歌单数据增多，不止只获取100条
//  const list = await playlistCollection.get() //通过get能获取这个集合所有数据，云函数每次能获取100条，但是在小程序只能获取20条，list.data才能拿到playlistCollection.get()的数据
  
 // 数据的多次获取，因为云函数只能获取100条
  const countResult = await playlistCollection.count() //playlistCollection.count()和countResult返回一个对象， 获取数据的总数，是异步，也要计算,要加await

  const total = countResult.total //取到总的条数(是一个数字)   因为countResult返回一个对象

  //向上取整，取到总的次数     假如有210条数据，每次取都是异步操作，取3次完的异步任务累加到list上，吧这3次的放在一起用Promise.all
  const batchTimes=Math.ceil(total/MAX_LIMIT)
 

  const tasks = [] //tasks放的是promise的集合

  for (let i = 0; i < batchTimes; i++) { //skip当i等于0，从0条开始取，当i等于1，从100条开始取，当i等于2，从200条开始取
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get() //promise异步对象 skip当前从第几条开始取 limit条数(每次只能获取100条) get取到
    tasks.push(promise) //tasks有多个异步对象
  }


  let list = {
    data: [] //对应下面的list.data.length，let list = { data: [] }也是指playlistCollection.get()
  }
  if (tasks.length > 0) { //当前任务tasks大于0，需要分多次去取，所有的任务都完成再去迭代/累加数据
    list = (await Promise.all(tasks)).reduce((acc, cur) => { //reduce累加 //所有的任务都完成也是异步数据  acc之前的值  cur当前循环遍历对应的数据的值  acc, cur指的是上上一次的值和上一次的值和下一次的值
      return {
        data: acc.data.concat(cur.data) //cur.data当前数据对应的data的值
      }
    })
  }


 // 这个取到的是服务器端获取到的数据
  const playlist=await rp(URL).then((res) => { //async await后面是异步请求
    return JSON.parse(res).result //云函数当修改了需要重新创建并部署到云服务器
})

 // console.log(playlist) //云函数的打印信息在云函数的日志当中，在getPlaylist右键点击选中需要创建并部署(不上传node_modules),云端测试，吧默认的参数("key1": "test value 1")删除,因为不需要参数

 
 // 存的跟取到的可能有交集，所以要去重，定义新的数据
const newData=[]
let flag = true // 标志位，false不重复/不相等
for(let i=0,len1=playlist.length;i<len1;i++){
  // let flag = true// 标志位，true不重复/不相等
  for (let j = 0, len2 = list.data.length; j < len2; j++) { //list.data.length的list一开始指的是const list = await playlistCollection.get()
    if (playlist[i].id === list.data[j].id) { //id是指歌单的id,歌单的唯一标识   _id指的是大的数组里面每个小的数组的唯一标识
flag=false
break
  }
}
if(flag){
  newData.push(playlist[i])
}
}


 // 需要循环遍历吧数据一条一条的插入到云数据库(创建集合playlist，插入到云数据库的集合当中:playlist)
 // for (let i = 0, len = playlist.length;i<len;i++){
  for (let i = 0, len = newData.length; i < len; i++) { //newData是去重了的数据

  await playlistCollection.add({ //集合的名称playlist  collection集合  add插入   await+异步操作  这个文件修改了要重新创建并部署-点击云函数-点击云端测试-点击云数据库就有数据了
  data:{
    ...newData[i], // ...playlist[i], //取到playlist的每个值
    createTime: db.serverDate(), //当前插入数据的时间由服务器获取的时间
  }
}).then((res)=>{
  console.log('插入成功')
}).catch((err)=>{
  console.error('插入失败')
})

}

  return newData.length // 返回newData的长度,返回当前的数据有多少条信息   点击高级操作会有count模板，可查询有多少条信息 db.collection('playlist') .count() 显示39条信息  再点击云端测试显示状态成功 数据0 (没有更新歌单信息，时间非常短)

    
}