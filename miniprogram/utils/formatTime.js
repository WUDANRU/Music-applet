module.exports = (date) => {
  let fmt = 'yyyy-MM-dd hh:mm:ss'
  const o = {
    'M+': date.getMonth() + 1, // 月份  M+代表一个或多个M
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分钟
    's+': date.getSeconds(), // 秒
  }

  if (/(y+)/.test(fmt)) { //test匹配 replace替换  RegExp内置对象，正则表达式  $1代表/(y+)/，指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
    fmt = fmt.replace(RegExp.$1, date.getFullYear())
  }
  
  for (let k in o) { //k指的是M+ d+ h+等
    if (new RegExp('(' + k + ')').test(fmt)) { //('(' + k + ')')这么写相当于是 new RegExp('(s+)')
      fmt = fmt.replace(RegExp.$1, o[k].toString().length == 1 ? '0' + o[k] : o[k])
    }
  }

  // console.log(fmt)
  return fmt  // 返回给blog-card.js用
}