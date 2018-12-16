$(function () {
  // 显示上传图片的名称
  $(".upload").on("change", "input[type='file']", function () {
    var filePath = $(this).val();
    if (filePath.indexOf("jpg") != -1 || filePath.indexOf("png") != -1 || filePath.indexOf("jpeg") != -1) {
      var arr = filePath.split('\\');
      var fileName = arr[arr.length - 1];
      $(".showFileName").html(fileName);
      jsReadFiles(this.files);
    } else {
      $(".showFileName").html("").hide();
      $(".fileerrorTip").html("您未上传文件，或者您上传文件类型有误！").show();
      return false;
    }
  })

  //js 读取计算机中的图片
  function jsReadFiles(files) {
    if (files.length) { //判断是否上传了文件
      var file = files[0];
      var reader = new FileReader(); //h5 new一个FileReader实例
      if(/image+/.test(file.type)){ //判断上传的文件是否是图片类型
        reader.onload = function () { // onload文件读取成功时触发,结果存储在result属性中
          changeBackgroundImage(this.result);
        }
        reader.readAsDataURL(file);
      }
    }
  }
  // 获取URL
  function getCurrentTabUrl(callback) {
    let queryInfo = {
      active: true,
      currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tab) => {
      let url = tab.url;
      console.assert(typeof url === 'string', 'tab.url should be a string');
      callback(url);
    });
  }

  // 选择颜色后改变背景颜色并保存。
  function getColor(color) {
    //return color;
    getCurrentTabUrl((url)=>{
      changeBackgroundColor(color);
      saveBackgroundColor(url,color)
    })
    
  }
  // 初始化拾色器插件
  Colorpicker.create({
    bindClass: 'picker', // 这里的picker可随意填类名
    change: function (elem, hex) {
      // elem: 绑定的元素
      // hex：当前选中颜色的hex值     
      elem.style.backgroundColor = hex;
      getColor(hex);
    }
  })
 
  //  改变当前页面的背景颜色。
  function changeBackgroundColor(color) {
    let script = `
    document.body.style.backgroundImage="url('')";
    document.body.style.backgroundColor="${color}";
    `;
    // 向页面动态注入js代码
    chrome.tabs.executeScript({
      code: script
    });
  }
  // 改变当前页面的背景图片
  function changeBackgroundImage(image) {
    let script = `
    document.body.style.backgroundImage="url('${image}')";
    document.body.style.backgroundAttachment="fixed";
    document.body.style.backgroundSize="100%";
    document.body.style.backgroundRepeat="no-repeat";
    `
    chrome.tabs.executeScript({
      code: script
    });
  }

  //  取出保存的页面背景颜色 如果曾经用插件改变过这个页面的背景颜色。
  function getSavedBackgroundColor(url, callback) {
    // https://developer.chrome.com/apps/storage#type-StorageArea
    chrome.storage.sync.get(url, (items) => {
      callback(chrome.runtime.lastError ? null : items[url]);
    });
  }

    // 用来保存选择的背景颜色 
  function saveBackgroundColor(url,color) {
    let items = {};
    items[url] = color;
    chrome.storage.sync.set(items);
  }

  // 插件会先加载用户上次选择的颜色，如果存在的话。
    getCurrentTabUrl((url) => {
        getSavedBackgroundColor(url, (savedColor) => {
            if (savedColor) {
              changeBackgroundColor(savedColor);
            }
          });
    });
})