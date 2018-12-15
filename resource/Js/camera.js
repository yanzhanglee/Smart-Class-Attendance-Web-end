let videoPlaying = false;
function turnOnCamera() {
  const constraints = {
    video: {width: {min: 1280}, height: {min: 720}},
    audio: false,
  };
  videoPlaying = false;
  let v = document.getElementById('v');
  let promise = navigator.mediaDevices.getUserMedia(constraints);

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // 首先，如果有getUserMedia的话，就获得它
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // 否则，为老的navigator.getUserMedia方法包裹一个Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  promise.then(stream => {
    // 旧的浏览器可能没有srcObject
    if ('srcObject' in v) {
      v.srcObject = stream;
    }
    else {
      // 防止再新的浏览器里使用它，应为它已经不再支持了
      v.src = window.URL.createObjectURL(stream);
    }
    v.onloadedmetadata = function(e) {
      v.play();
      videoPlaying = true;
    };
  }).catch(err => {
    console.error(err.name + ': ' + err.message);
  });
}

var status=false;
var namecount = 0;
var filename;
var type = 'jpg';
var _fixType = function(type){
  type = type.toLowerCase().replace(/jpg/i,'jpeg');
  var r = type.match(/png|jpeg|bmp|gif/)[0];
  return 'image/' + r;
};
var namelist = new Array("LiYanzhang","TangXiaoyue","WangTianduo","ZhuBo","LuoYifan","NgaiMan","Norman");

function startTakePhoto(){

  status=true;
  console.log(status);
  console.log("start to Take Photos!");
    setInterval(function() {
      if(videoPlaying) {
        namecount++;
        let canvas = document.getElementById('canvas');
        canvas.width = v.videoWidth/4;
        canvas.height = v.videoHeight/4;
        canvas.getContext('2d').drawImage(v, 0, 0,canvas.width,canvas.height);
        downloadPhoto();
      }
    },2500);
  }

function downloadPhoto() {

  console.log(status);
  if(status==="true"){
    console.log(status);
    searchPhoto();
  }else{
    console.log("STOP.")
  }
}

function stopTakePhoto() {
  if(status){
    status=false;
    console.log(status);
  }
}

function callbackdata(data) {

  var URL = "http://13.250.98.176/";
  var id =  data.results[0].user_id;
  var confidence = data.results[0].confidence;
  var length = data.results.length;

  if (length != 0) {

    if (confidence >= 60) {

      var datasend = new FormData();
      datasend.append("name",id);
      datasend.append("classNo","class6");

      $.ajax({
        url:URL+"update",
        type:'POST',
        cache:false,
        processData: false,
        contentType: false,
        data:datasend,

        success(data){
          counts.push(id);
        },

        error:function() {
          console.log("ERROR, Server not open!");
        }
        
      });

    }
  }
}


var id = [];
var counts=[];
function searchPhoto() {
  
  console.log("Searching photo");
  dataURItoBlob = function(dataURI) { // 图片转成Buffer
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], {type: mimeString});
}


  var data = new FormData();
  var imgFiles = dataURItoBlob(document.getElementById('canvas').toDataURL(type));//.replace(_fixType(type), 'image/octet-stream');
  var url = "https://api-us.faceplusplus.com/facepp/v3/search";
  data.append('api_key',"lLmuNCeU8XzoRm3O1yBJ6qpwjhLFunFm");
  data.append('api_secret',"UJ0NDCcZeOmWgkZuuFaK3HGITOEW1s_v");
  data.append('image_file',imgFiles);
  data.append('outer_id',"tuesdayDemo");

  $.ajax({
    url:url,
    type:'POST',
    cache:false,
    processData: false,
    contentType: false,
    data:data,

    success(data){
      console.log("Got Face++ Data");
      length = data.results.length;
      //console.log(data);
      if (length != 0) {
        var confidence = data.results[0].confidence;
        console.log("confidence: "+confidence);
        if (confidence >= 60) {
          var newid = data.results[0].user_id;
          console.log(newid);
          var repeat = 0;
          for(var idid of id){
            if(newid === idid){
              repeat++;
            }
          }
          if(repeat===0){
            if(newid==="teacher1"){
              alertTeacher(1);
            }else if(newid==="teacher2"){
              alertTeacher(2);
            }
            else{
              callbackdata(data);
              id.push(newid);
              var p = document.getElementById("attendance-status");
              p.innerHTML = "Number of Students Attended: "+id.length;
              $(p).css({
                'fontWeight':'600',
              }).show();
              console.log("numbers update: " +id.length);
              alertPerson(newid);
            }
          }
        }
        else {
          console.log("Unknown!");
          alertUnknownPerson()}
      }

    },
    error:function() {
      alert("ERROR");
    }
    
  });

}




function alertPerson(alertId) {
  showTips(alertId,300,2.5);

}

function alertUnknownPerson() {
  var height = 300;
  var time = 2.5;
  var windowWidth  = $(window).width();

  var tipsDiv = '<div id="tips" class="tipsClass">' + '<div class="row tips-title"> Check In Failed! </div>' +'<div class="row" style="margin-bottom: 20px"><img alt="" src="resource/photo/fail.png"></div>'+ '</div>';

  $( 'body' ).append( tipsDiv );
  $( 'div.tipsClass' ).css({
    'top'       : height + 'px',
    'left'      : ( windowWidth / 2 ) - 350/2 + 'px',
    'position'  : 'absolute',
    'padding'   : '3px 5px',
    'background': '#E4F1FD',
    'font-size' : 24 + 'px',
    'margin'    : '10px 20px 20px 20px',
    'text-align': 'center',
    'width'     : '350px',
    'height'    : 'auto',
    'color'     : '#555555',
    'opacity'   : '1',
  }).show();
  $('div.tips-title').css({
    'margin-top':'20px',
    'margin-left':'10px',
    'margin-right':'10px',
    'font-size':'150%',
    'color':'red',
    'font-weight':'700'
  }).show();
  $('img').css({
    'margin':'20px auto 20px',
    'width':'100px',
    'height':'auto',
  }).show();

  setTimeout( function(){$( 'div.tipsClass' ).fadeOut();$("#tips").remove();}, ( time * 1000 ) );

}

//content为要显示的内容
//height为离窗口顶部的距离
//time为多少秒后关闭的时间，单位为秒
function showTips(content, height, time ){
  //窗口的宽度
  var windowWidth  = $(window).width();
  var count = 0;

  for(var i = 0;i<namelist.length;i++){
    if(content===namelist[i]){
      console.log("111111");
      var tipsDiv = '<div id="tips" class="tipsClass">' + '<div class="row tips-title"> Check In Success! </div>' +'<div class="row"><img alt="" id="showImg" src="resource/photo/'+content+'.jpg"></div>'+'<div class="row" style="margin-bottom: 20px">'+content+'</div>'+ '</div>';
      count++;
    }
  }
  if(count===0){
    var tipsDiv = '<div id="tips" class="tipsClass">' + '<div class="row tips-title"> Check In Success! </div>' +'<div class="row"><img alt="" id="showImg" src="resource/photo/newvisitor.jpg"></div>'+'<div class="row" style="margin-bottom: 20px">VISITOR'+content+'</div>'+ '</div>';
  }

  $( 'body' ).append( tipsDiv );
  $( 'div.tipsClass' ).css({
    'top'       : height + 'px',
    'left'      : ( windowWidth / 2 ) - 350/2 + 'px',
    'position'  : 'absolute',
    'padding'   : '3px 5px',
    'background': '#E4F1FD',
    'font-size' : 24 + 'px',
    'margin'    : '10px 20px 20px 20px',
    'text-align': 'center',
    'width'     : '350px',
    'height'    : 'auto',
    'color'     : '#555555',
    'opacity'   : '1',
    'box-shadow':'0 2px 10px rgba(0, 0, 0, 0.3)'
  }).show();
  $('div.tips-title').css({
    'margin-top':'20px',
    'font-size':'150%',
    'color':'#FBB040',
    'font-weight':'700'
  }).show();
  $('#showImg').css({
    'margin':'20px auto 20px',
    'width':'150px',
    'height':'auto',
    'border-radius':'75px',
    'border':'4px solid #2F7DC0'
  }).show();

  setTimeout( function(){$( 'div.tipsClass' ).fadeOut();$("#tips").remove();}, ( time * 1000 ) );
}

function alertTeacher(a) {
  var height = 300;
  var time = 2.5;
  var windowWidth  = $(window).width();

  if(a===1){
    var tipsDiv = '<div id="tips" class="tipsClass">' + '<div class="row tips-title">Welcome!</div>' +'<div class="row"><img id="showImg" src="resource/photo/Ngai-ManCheung.jpg"></div>'+'<div class="row" style="margin-bottom: 20px">Ngai-Man Cheung</div>'+ '</div>';
  }else if(a===2){
    var tipsDiv = '<div id="tips" class="tipsClass">' + '<div class="row tips-title">Welcome!</div>' +'<div class="row"><img id="showImg" src="resource/photo/NormanLee.jpg"></div>'+'<div class="row" style="margin-bottom: 20px">Norman Lee</div>'+ '</div>';
  }
  $( 'body' ).append( tipsDiv );
  $( 'div.tipsClass' ).css({
    'top'       : height + 'px',
    'left'      : ( windowWidth / 2 ) - 350/2 + 'px',
    'position'  : 'absolute',
    'padding'   : '3px 5px',
    'background': '#E4F1FD',
    'font-size' : 24 + 'px',
    'margin'    : '10px 20px 20px 20px',
    'text-align': 'center',
    'width'     : '350px',
    'height'    : 'auto',
    'color'     : '#fff',
    'opacity'   : '1',
    'box-shadow':'0 2px 10px rgba(0, 0, 0, 0.3)'
  }).show();
  $('div.tips-title').css({
    'margin-top':'20px',
    'font-size':'150%',
    'color':'red',
    'font-weight':'700'
  }).show();
  $('img').css({
    'margin':'20px auto 20px',
    'width':'100px',
    'height':'auto',
    'border-radius':'75px',
    'border':'4px solid #2F7DC0'
  }).show();

  setTimeout( function(){$( 'div.tipsClass' ).fadeOut();$("#tips").remove();}, ( time * 1000 ) );
}
