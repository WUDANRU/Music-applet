
// 输入文字最大的个数
const MAX_WORDS_NUM = 140
// 最大上传图片数量
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
// 输入的文字内容
let content = ''
let userInfo = {}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 输入的文字个数
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true, // 添加图片元素是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options) //{nickName: "鹿人神经粉", avatarUrl:""  //添加编译nickName=鹿人神经粉&avatarUrl=https
     userInfo = options
  },
  onInput(event) {

    // console.log(event) //输入文字打印内容  event.detail.value是输入的内容

    let wordsNum = event.detail.value.length
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },

  onFocus(event) { //触发焦点键盘弹出的键盘高度设置
    // 模拟器获取的键盘高度为0
    // console.log(event)
    this.setData({
      footerBottom:event.detail.height, //键盘高度
    })
  },
  onBlur() { //失去焦点键盘隐藏的键盘高度设置
    this.setData({
      footerBottom:0,
    })
  },

  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'], //代表图片类型，里面两个值是初始值和压缩过的
      sourceType: ['album', 'camera'], //源头的类型，里面两个值是从相册选择和拍照选择
      success: (res) => {
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // console.log(max) //9
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.images.length
        // console.log(max) //5
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },

  onDelImage(event) { //删除图片，event指的是data-index="{{index}}"
   //先删除这张图片再保存图片数组
   console.log(event)
    this.data.images.splice(event.target.dataset.index, 1) //splice用于索引
    this.setData({
      images: this.data.images
    }) //不要写成这样，会错  this.setData({this.data.images.splice(event.target.dataset.index, 1)})
    
    if (this.data.images.length == MAX_IMG_NUM - 1) { //这里用 ===/==/<= 都可以
      this.setData({
        selectPhoto: true,
      })
    }
  },

  onPreviewImage(event) { //event指的是data-imgsrc="{{item}}"
    // ios会显示6/9张图片，安卓没有显示
   console.log(event)
    wx.previewImage({
      urls: this.data.images, //图片列表，预览图片时可以左右滑动切换图片
      current: event.target.dataset.imgsrc, //预览图片
    })
  },
  send(){//发布

    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid(用户的唯一标识)、昵称、头像、时间(发布的时间)
    // 1、图片 -> 云存储 fileID 云文件ID      //图片上传到云存储，拿着图片fileID传到数据库

    if (content.trim() === '') { //文字内容如果为空格或没有输入内容
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return 
    }

    wx.showLoading({
      title: '发布中',
      mask: true, //产生loading带的遮罩层
    })

    let promiseArr = []
    let fileIds = []
    // 图片上传     云存储的api只支持单图片/单文件上传，所以需要遍历每张图片     wx.cloud.uploadFile代表云存储
    for (let i = 0, len = this.data.images.length; i < len; i++) { //for循环是因为图片上传到云存储需要图片一张一张插入，所以用了for循环
      let p = new Promise((resolve, reject) => {  // 需要吧图片一张一张插入到云数据库用到了promise all
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]  //正则表达式   \w表示字母/数字/下划线  \w+表示字母有多个  \.表示给点转义  \w+$/的$表示以w+结尾  .exec(item)[0]取到第0个就是当前文件的扩展名   .exec(item)[0]的item就是当前文件
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, //blog是上传在云存储的文件夹，blog后面写的严谨是为了相同文件不重复，为了后面上传的文件不会吧前面同名的文件覆盖  //Date.now()从1970年到现在的时间
          filePath: item, //filePath当前(临时)路径   //cloudPath云端路径 
          success: (res) => { //上传到云存储成功
               console.log(res)  //点击发布成功后控制台打印数据，并在blog文件夹可以看到3张图片的fileID
            // console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID) //图片fileID一个一个插入的
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
      console.log(p)
    }

    // 存入到云数据库  //在小程序操作云数据库，会自带openId (在云函数和在小程序操作云数据库)
    Promise.all(promiseArr).then((res) => { //在插入的时候会有openId
      db.collection('blog').add({
        data: {
          ...userInfo, //userInfo是个对象，取到多个属性，用户信息,里面有昵称和头像
           content, //happydd:content
          img: fileIds, // img: fileIds,
          createTime: db.serverDate(), //当前保存时间，服务端时间(客户端时间不准确)
        }
      }).then((res) => { //发布成功后刷新blog集合就会显示数据(可以只输入文字发布,不输入图片)
        wx.hideLoading()
  
  wx.showToast({
    title: '发布成功',
   
  })//返回上一个界面，之后要刷新，发布的内容才会更新显示

   //返回上一个界面
   setTimeout(()=>{
    wx.navigateBack()
   },1000)
  // 返回blog页面，并且刷新(吧新发布的博客刷新显示出来)

        const pages = getCurrentPages() //取到当前小程序的界面的方法
        // console.log(pages) // [Ue, Ue]    pages.length - 1就是当前这个界面，pages/blog-edit/blog-edit
        
        const prevPage = pages[pages.length - 2] // 取到上一个页面，pages/blog/blog
        
        prevPage.onPullDownRefresh() //取到上一个页面，并调用上一个页面pages/blog.js的方法onPullDownRefresh()
        // prevPage.play(0) 
        // 因为wx.navigateBack()是返回上一个界面，返回到blog页面，所以不能算是当前页面，blog-edit才是当前页面，或者说返回到blog页面并刷新blog页面

      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
})