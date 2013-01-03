//alert('ntp back')
// 调用 getMostVisited 初始化
// 检查更新
// 检测关闭，发送 cdata  统计

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
  alert(0)
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
    else
      sendResponse({}); // snub them.
  });
