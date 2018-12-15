function countDown() {
  var date = new Date();
  var now = date.getTime();
//设置截止时间
  var str = '2018/12/11 16:30:00';
  var endDate = new Date(str);
  var end = endDate.getTime();
  var leftTime = end - now;
  //console.log("time: " + endDate);
//定义变量 d,h,m,s保存倒计时的时间
  var d, h, m, s;
  if (leftTime >= 0) {
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
    h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
    m = Math.floor(leftTime / 1000 / 60 % 60);
    s = Math.floor(leftTime / 1000 % 60);
  }
//将倒计时赋值到div中
  document.getElementById('hour').innerHTML = h + ':';
  document.getElementById('min').innerHTML = m + ':';
  document.getElementById('sec').innerHTML = s;
//递归每秒调用countTime方法，显示动态时间效果
  setTimeout(countDown, 1000);
}