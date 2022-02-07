// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  options: {
    styleIsolation: 'apply-shared', // 这个第三种可以使用全局样式的方式，还有除值apply-shared外，其他的值，有的值可以使这个类名，多个同类名一个样式
    multipleSlots: true, //当前启用多个插槽的意思
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.setData({
        modalShow: false,
      })
    }
  }
})