/**
 * js使用canvas将文字转换成图像数据base64
 * @param {string}    text              文字内容  "abc"
 * @param {number}    fontSize          文字大小  20
 * @param {string}    fontColor         文字颜色  "#000"
 */
function textBecomeImg(text, fontSize, fontColor) {
  let canvas = document.createElement('canvas')
  //小于32字加1  小于60字加2  小于80字加4    小于100字加6
  let buHeight = 0
  if (fontSize <= 32) {
    buHeight = 1
  }
  else if (fontSize > 32 && fontSize <= 60) {
    buHeight = 2
  }
  else if (fontSize > 60 && fontSize <= 80) {
    buHeight = 4
  }
  else if (fontSize > 80 && fontSize <= 100) {
    buHeight = 6
  }
  else if (fontSize > 100) {
    buHeight = 10
  }
  //对于g j 等有时会有遮挡，这里增加一些高度
  canvas.height = fontSize + buHeight
  let context = canvas.getContext('2d')
  // 擦除(0,0)位置大小为200x200的矩形，擦除的意思是把该区域变为透明
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = fontColor
  context.font = fontSize + 'px Arial'
  //top（顶部对齐） hanging（悬挂） middle（中间对齐） bottom（底部对齐） alphabetic是默认值
  context.textBaseline = 'middle'
  context.fillText(text, 0, fontSize / 2)

  //如果在这里直接设置宽度和高度会造成内容丢失 , 暂时未找到原因 , 可以用以下方案临时解决
  //canvas.width = context.measureText(text).width;


  //方案一：可以先复制内容  然后设置宽度 最后再黏贴    
  //方案二：创建新的canvas,把旧的canvas内容黏贴过去  
  //方案三： 上边设置完宽度后，再设置一遍文字

  //方案一： 这个经过测试有问题，字体变大后，显示不全,原因是canvas默认的宽度不够，
  //如果一开始就给canvas一个很大的宽度的话，这个是可以的。	
  //var imgData = context.getImageData(0,0,canvas.width,canvas.height);  //这里先复制原来的canvas里的内容	
  //canvas.width = context.measureText(text).width;  //然后设置宽和高	
  //context.putImageData(imgData,0,0); //最后黏贴复制的内容

  //方案三：改变大小后，重新设置一次文字
  canvas.width = context.measureText(text).width
  context.fillStyle = fontColor
  context.font = fontSize + 'px Arial'
  context.textBaseline = 'middle'
  context.fillText(text, 0, fontSize / 2)

  //注意这里背景透明的话，需要使用png
  return canvas.toDataURL('image/png')
}

export const TextToImage = (text, fontSize, fontColor) => {
  return textBecomeImg(text, fontSize, fontColor)
}