// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init() 
// 云数据库中1对N关系的三种设计方式：数量大的存在N里，是因为数组存储的数据是有限制的
// 第一种：1对N，N不是很多，比如发表一个博客的图片9张   

// 第二种: 1对N，N很多，云数据库新建product和part集合，product产品和part零件是分别在不同的集合当中
// product(添加记录: 字段:name,类型:string,值:产品，文档ID是数据库自动生成的)part(添加3个记录: 字段:name,类型:string,值:零件1/零件2/零件3)
// product添加字段(字段:parts,类型:array)，再往parts:[]中添加part的3个_id的值
// 先取到product集合的值，再通过parts:[]里的_id取到part集合的值，分两次查询/取到集合的值

// 第三种: 1对N，N成千上万，云数据库新建blog-comment博客评价集合(添加2个记录:字段:content,类型:string,值:评价1/评价2)，在N的一方存储1的一方的数据,假如有几万条的评价都对同一个博客评价
// 在blog-comment集合的评价1和评价2，两个数据里添加一样的字段(字段:blogId,类型:string,值:原有的blog博客集合第一条数据的_id)

// 吧blog-comment里的两条记录都删了，要写其他代码



// 先在博客集合查询id,通过id查询评价的信息
const TcbRouter = require('tcb-router') //npm i tcb-router --save

const db = cloud.database()

const blogCollection = db.collection('blog')

const blogCommentCollection = db.collection('blog-comment')


const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  })

   // 云数据库模糊查询与索引管理，不输入点搜索会显示全部，输入有对应的显示对应的博客，输入没有的会显示空白  
  app.router('list', async(ctx, next) => { //更快模糊查询：数据库添加索引 数据库-索引管理-填写索引字段content和索引字段createTime(逆序/降序)，默认非唯一，命中次数是点击搜索了几次content/keyword
    const keyword = event.keyword
       let w = {} //输入的关键字/查询的关键字
    if (keyword.trim() != '') { //用户有没有输入keyword,不等于空格的时候再去拼一个查询的条件  content:/abc/i，查询忽略大小写的abc （i修饰符，忽略大小写的意思）
      w = {
        content: new db.RegExp({ //content是云函数数据里的content字段  (云函数数据里有createTime，_id等字段)  RegExp正则表达式/规则表达式
          regexp: keyword,
          options: 'i' //i忽略大小写  m换行匹配  s可以让点匹配包括换行符在内的所有的字符
        })
      }
    }

    let blogList = await blogCollection.where(w).skip(event.start) 
    .limit(event.count)
    .orderBy('createTime','desc')
    .get()
    ctx.body = blogList
  })  //.where(w)如果w是没有输入关键字，没有任何查询条件


    // 云函数可以查询日志，里面是返回的数据    第三种: 1对N
    app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    // 详情查询
    let detail = await blogCollection.where({
      _id: blogId  //_id是集合里数据的属性
    }).get().then((res) => {
      return res.data
    })  //是吧blog集合的id放到blog-comment的blogId里，通过两个where里的代码将blog博客详情和blog-comment博客评论联系在一起
    
    // 评论查询
    const countResult = await blogCommentCollection.count() //对象类型，总数
    const total = countResult.total //number类型，总数
    let commentList = {
      data: []
    }
    if (total > 0) { //有评论  如果有博客详情才会有评论
      const batchTimes = Math.ceil(total / MAX_LIMIT) //需要几次吧数据查询到，batchTimes是几次
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({
            blogId //指的是 let blogId = event.blogId的blogId  blogId是blogId：blogId的缩写，blogId是集合里数据的属性
          }).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }

      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {   // reduce累加器/累加   acc上次，cur这次
          return {
            data: acc.data.concat(cur.data) //上次的结果累加现在的值
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail,
    }
  })


  //bloghistory.js从云函数取数据需要用到openid，是因为通过openid能知道用户发布了多少条博客(_openid是用户的唯一标识)
  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async(ctx, next) => {
    ctx.body = await blogCollection.where({
        _openid: wxContext.OPENID // _openid是集合里数据的属性,指的是从login云函数的_openid,不是app.js的openid
      }).skip(event.start).limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })
  })

  return app.serve()

}