// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位  这句写在外面的都是全局的，写在每个函数里的duration是通用的，全局的
let isMoving = false // 表示当前进度条是否在拖拽，解决：当歌曲进度条拖动时候(歌曲有在播放的时候)和updatetime事件有冲突的问题

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean // 表示是否为同一首歌  这个是player传过来的
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0, //移动的距离
    progress: 0,   //移动的距离
  },

  lifetimes: {
    ready() { //生命周期函数，组件会在页面布局完成之后执行
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') { //写这个是因为当同一首歌点了第一次播放到中间再返回重新点它播放的时候，因为没有调用this._setTime() ，它的totalTime显示的是00:00

        this._setTime() //重新调用duration的值

      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {  //通过缓存取到的数据是不能够写编译在player页面的，这样会报错，要编译在musiclist页面
    onChange(event) { //bindchange拖拽进度条和bindtouchend松手进度条
      
      //每次去移动需要去获取当前移动的时间或移动的距离
      console.log(event) //this.setData的progress和movableDis写的代码，即使进度条走动就会打印出这个 {type: "change", timeStamp: 10373, target: {…}, currentTarget: {…}, mark: {…}, …} 
      //打印出的bindchange的source表示产生移动的原因，即this.setData的progress和movableDis写的代码
     
      // bindchange返回的source表示产生移动的原因  值touch代表拖动  值空字符串代表setData
   

      // 拖动
      if (event.detail.source == 'touch') {  //console.log(event)打印的source是空字符串，当拖动进度条source是touch
     
     //这两个值是保存在这里的，当松手了再吧两个值设置在setData里，设置在setData里就是会显示到页面上
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100  //走过的距离/进度条总长*100份(pregent是0-100，有乘以100拖动才会显示拖动过的进度条显示白色)  //100份或者百分比  //当前占的总的份数 
        
        this.data.movableDis = event.detail.x   //touch拉动的进度/播放的进度
       
        isMoving = true //表示有在拖拽         
        // console.log('change', isMoving)  //写了isMoving，但是打印有概率事件， 打印出这个之后console.log('end',false)会打印出console.log('change', true)再打印出console.log('onPlay'),这样isMoving是true,onTimeUpdate就不会执行，播放不会走动[ if(!isMoving) ]，所以要在onPlay事件写isMoving = false( 因为onPlay事件之后就是onTimeUpdate事件 )   注：下面的onPlay等事件的console.log('onPlay')不要被注释才能看到事件的打印顺序

      }
    },

    onTouchEnd() {  // 当手松开，吧当前的状态设置到this.setData里
      
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))

      this.setData({ //当松手了再吧两个值设置在setData里，设置在setData里就是会显示到页面上

        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec

      })
      
      //进度条到的位置会和音频播放到的位置同步  duration以秒为单位，下面这句计算后返回的单位是秒
      backgroundAudioManager.seek(duration * this.data.progress / 100)  //音频播放到的位置 duration播放总时长,是全局变量，下面有 _setTime(){duration = backgroundAudioManager.duration}，下面原来是写const duration = 后面吧const去掉   速度*时间=距离   this.data.progress走过的距离
     
      isMoving = false //表示没有拖拽
      // console.log('end', isMoving)
      console.log(duration,this.data.progress)
    },
    _getMovableDis() { //先获取进度条宽度，进度条宽度只有90%
      const query = this.createSelectorQuery()  //会返回SelectorQuery对象
      query.select('.movable-area').boundingClientRect()  //获取选择器的宽度
      query.select('.movable-view').boundingClientRect()  
      query.exec((rect) => { //返回结果，返回数组
        // console.log(rect) //显示两个有宽度的数组
        movableAreaWidth = rect[0].width //拿到第一个数组的宽度
        movableViewWidth = rect[1].width //拿到第二个数组的宽度
        // console.log(movableAreaWidth, movableViewWidth) //iphone6的显示233.5 18，不同尺寸的手机的宽度不同 
      })

    },

    _bindBGMEvent() { //绑定音乐事件
      backgroundAudioManager.onPlay(() => { //播放事件
        // console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay') //当左下角的音频播放和暂停会触发这里的onPlay和onPause
      })

      backgroundAudioManager.onStop(() => { //停止
        // console.log('onStop')
      })

      backgroundAudioManager.onPause(() => { //暂停
        // console.log('Pause')
        this.triggerEvent('musicPause') //传给player.wxml的<x-progress-bar>
      })

      backgroundAudioManager.onWaiting(() => { //监听当前的音频正在加载当中，比如进度条挪到一个位置，当前音频可能没有加载到这个位置的话，它就会停止相应的加载，这个时候就会触发这个事件
        // console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => { //监听背景音乐进入可以播放的状态
        // console.log('onCanplay') //触发这个事件代表可以播放 再触发onPlay正在播放事件 正在播放会触发onTimeUpdate事件，也就是当前时间正在更新 点击暂停会触发Pause事件 onTimeUpdate事件 再点击播放触发onPlay  进度条再走触发onTimeUpdate
        // console.log(backgroundAudioManager.duration) //背景音乐的总时长，这个经常显示undefined
        if (typeof backgroundAudioManager.duration != 'undefined') { //这样判断比较严谨  如果写成backgroundAudioManager.duration != 'undefined'，值是null也是==undefined,也可以写成!==
        this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      // 每更新一秒进度都要发生变化，进度变化，需要在onTimeUpdate里写    当暂停的时候onTimeUpdate事件不会触发，当播放的时候控制台的Wxml里的movable-view标签里x的数值和progress标签里的percent数值会变化
      backgroundAudioManager.onTimeUpdate(() => { //监听音乐播放的进度，只有小程序前台的时候才会触发回调函数，比如小程序在后台执行，就是接电话，此时小程序切换到后台，它后面的回调函数就不会执行，联动进度条功能的话就用到它对应的事件
        // console.log('onTimeUpdate')
        if (!isMoving) { //没有拖拽的时候才会执行onTimeUpdate，因为在播放的时候，拖动进度条，onTimeUpdate和拖动(onChange)会产生冲突(因为两个是都设置了data里的值movableDis和progress，具体的冲突是小圆点会闪动退回去)
          const currentTime = backgroundAudioManager.currentTime //当前时间,输出以秒为单位，这个时间打印是会不断变化的
          const duration = backgroundAudioManager.duration //播放总时长,输出以秒为单位
        
        const sec = currentTime.toString().split('.')[0] //currentTime的值17.452534是数字，需要转为字符串通过点分割拿到第一个（第一个就是17，第二个是452534）
        if (sec != currentSec) { // sec不等于-1执行下面的操作 原来是一秒内执行this.setData里的movableDis和progress4次，后来优化成一秒内只触发1次
        
        const currentTimeFmt = this._dateFormat(currentTime) 
        //下面this.setData里的movableDis和progress一秒内触发4次，优化成一秒内只触发1次，因为currentTime当前时间是不停变化的，currentTime和因currentTime变化的currentTimeFmt，所以要做优化
       
            this.setData({ //<movable-view>对应{{movableDis}} (<movable-view x="{{movableDis}}"  x控制水平滑动的距离  movableDis移动的距离 //movableAreaWidth - movableViewWidth进度条的宽度减去圆点的宽度  

              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,  //播放的进度 
              // (movableAreaWidth - movableViewWidth)/ duration 1秒走多少，再乘以当前时间等于播放的进度，走了多少距离)

              progress: currentTime / duration * 100,//当前占的总的份数，progress是100份，currentTime / duration播放的等比  //<progress  percent="{{progress}}"  <progress>对应{{progress}} percent当前移动了多少  progress移动的距离 

              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,

              
            }) //当暂停的时候onTimeUpdate事件不会触发，当播放的时候控制台的Wxml里的movable - view标签里x的数值和progress标签里的percent数值会变化
        // console.log(this.data.movableDis, this.data.progress, currentTimeFmt, currentTime) //176.01621810068508 81.67805944347334 {min: "03", sec: 21} 201.628124 这个要打印要吧后面的注释掉就不会报错
             currentSec = sec //更新当前的秒数currentSec，即是吧sec的值赋值给当前的秒数currentSec
             // console.log(currentTime) //这个代码放在上面1秒执行多次，放在这里1秒执行1次，movableDis和progress也会随着currentTime变化
            // 联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime //这个抛给了player.wxml了，bind:timeUpdate="timeUpdate"
            })
            // console.log(currentTimeFmt)
          }
        }
      })

      backgroundAudioManager.onEnded(() => { //背景音乐播放完成，会自动进入播放下一首歌曲，使用onEnded
        // console.log("onEnded")
        this.triggerEvent('musicEnd') //trigger触发/激活 自定义事件，抛出musicEnd，见player.wxml的bind:musicEnd="onNext"
      })

      backgroundAudioManager.onError((res) => { //播放出错
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },

    _setTime() {  //设置当前时长，获取它_setTime()是个概率时件(因为backgroundAudioManager.duration有时候获取不到显示undefined就是概率事件)
      duration = backgroundAudioManager.duration  //背景音乐的总时长，输出以秒为单位的时间
      // console.log(duration)  //37.632秒，需要格式化时间，显示这样的分和秒，00:00
      const durationFmt = this._dateFormat(duration)
      // console.log(durationFmt)  //{min: "05", sec: 20}
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
        // ['showTime.totalTime']: durationFmt.min+':'+durationFmt.sec
      })
    },

    // 格式化时间
    _dateFormat(sec){ //sec指的是秒，指的是37.632秒
      // 分钟
      const min = Math.floor(sec / 60) //显示分
      sec = Math.floor(sec % 60)  //显示秒
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec),
      }
      
    },

    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec //05:05 五分五秒
    }
  }
})