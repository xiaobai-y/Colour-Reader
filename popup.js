$(function(){ 

  // 获取URL
  function getCurrentTabUrl(callback) {
    // queryInfo就是随query的一个配置
    let queryInfo = {
      active: true,
      currentWindow: true
    };
  
    chrome.tabs.query(queryInfo, (tabs) => {
      //原文这里的大致意思就是 只要能点击这个按钮 肯定是存在一个tab 所有tabs不会为空。
      let tab = tabs[0];
  
      // tab包含的选项卡的一些信息。
      // See https://developer.chrome.com/extensions/tabs#type-Tab
      let url = tab.url;
      console.assert(typeof url === 'string', 'tab.url should be a string');
      callback(url);
    });
  }

  // 初始化拾色器插件
  Colorpicker.create({
    bindClass:'picker', // 这里的picker可随意填类名
    change: function(elem,hex){
      // elem: 绑定的元素
      // hex：当前选中颜色的hex值     
      elem.style.backgroundColor = hex;
      changeBackgroundColor(hex);
      // saveBackgroundColor(url, hex);
    }
})

  /**
   *改变当前页面的背景颜色。
   *
   * @param {string} color The new background color.
   */
  function changeBackgroundColor(color) {
    let script = 'document.body.style.backgroundColor="' + color + '";';
    // See https://developer.chrome.com/extensions/tabs#method-executeScript.
    // 向页面注入JavaScript代码.
    // chrome.tabs.insertCSS({
    //   file: 'popup.css'  
    // });
    chrome.tabs.executeScript({
      code:   script
    });
  }
  
  /**
   * 取出保存的页面背景颜色 如果用户曾经用插件改变过这个页面的背景颜色。
   *
   * @param {string} url URL whose background color is to be retrieved.
   * @param {function(string)} callback called with the saved background color for
   *     the given url on success, or a falsy value if no color is retrieved.
   */
  function getSavedBackgroundColor(url, callback) {
    // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
    // for chrome.runtime.lastError to ensure correctness even when the API call
    // fails.
    chrome.storage.sync.get(url, (items) => {
      callback(chrome.runtime.lastError ? null : items[url]);
    });
  }
  
  /**
   * 用来保存用户选择的背景颜色的函数
   *
   * @param {string} url URL for which background color is to be saved.
   * @param {string} color The background color to be saved.
   */
  function saveBackgroundColor(url, color) {
    let items = {};
    items[url] = color;
    // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
    // optional callback since we don't need to perform any action once the
    // background color is saved.
    chrome.storage.sync.set(items);
  }
  
  // 插件会先加载用户上次选择的颜色，如果存在的话。
  
  document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {
      
      let picker = $('picker');
     
      // Load the saved background color for this page and modify the picker
      // value, if needed.
      getSavedBackgroundColor(url, (savedColor) => {
        if (savedColor) {
          changeBackgroundColor(savedColor);
          picker.value = savedColor;
        }
      });
  
      // 用户选择新的颜色  保存。
      // picker.addEventListener('change', () => {
      //   changeBackgroundColor(picker.value);
      //   saveBackgroundColor(url, picker.value);
      // });
    });
  });
})

