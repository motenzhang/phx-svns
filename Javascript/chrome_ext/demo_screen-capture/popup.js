// Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
// source code is governed by a BSD-style license that can be found in the
// LICENSE file.

function $(id) {
  return document.getElementById(id);
}

function isWindowsOrLinuxPlatform() {
  return navigator.userAgent.toLowerCase().indexOf('windows') > -1 ||
      navigator.userAgent.toLowerCase().indexOf('linux') > -1;
}

var isWindowsOrLinux = isWindowsOrLinuxPlatform();

chrome.extension.onRequest.addListener(function(request, sender, response) {
  if (request.msg == 'page_capturable') {
    $('tip').style.display = 'none';
    $('captureSpecialPageItem').style.display = 'none';
    if (isWindowsOrLinux)
      $('captureScreenItem').style.display = 'block';
    $('captureWindowItem').style.display = 'block';
    $('captureAreaItem').style.display = 'block';
    $('captureWebpageItem').style.display = 'block';
  } else if (request.msg == 'page_uncapturable') {
    i18nReplace('tip', 'special');
    if (isWindowsOrLinux) {
      $('captureScreenItem').style.display = 'block';
      $('tip').style.display = 'none';
    } else {
      $('tip').style.display = 'block';
    }
    $('captureSpecialPageItem').style.display = 'none';
    $('captureWindowItem').style.display = 'none';
    $('captureAreaItem').style.display = 'none';
    $('captureWebpageItem').style.display = 'none';
  }
});

function toDo(what) {
  var bg = chrome.extension.getBackgroundPage();
  switch (what) {
    case 'capture_screen':
      bg.screenshot.captureScreen();
      window.close();
      break;
    case 'capture_window':
      bg.screenshot.captureWindow();
      window.close();
      break;
    case 'capture_area':
      bg.screenshot.showSelectionArea();
      window.close();
      break;
    case 'capture_webpage':
      bg.screenshot.captureWebpage();
      $('loadDiv').style.display = 'block';
      $('item').style.display = 'none';
      break;
    case 'capture_special_page':
      bg.screenshot.captureSpecialPage();
      window.close();
      break;
  }
}

function i18nReplace(id, name) {
  return $(id).innerHTML = chrome.i18n.getMessage(name);
}

function resizeDivWidth(id, width) {
  $(id).style.width = width + "px";
}

function init() {
  i18nReplace('captureSpecialPageText', 'capture_window');
  i18nReplace('capturing', 'capturing');
  i18nReplace('captureScreenText', 'capture_screen');
  i18nReplace('captureWindowText', 'capture_window');
  i18nReplace('captureAreaText', 'capture_area');
  i18nReplace('captureWebpageText', 'capture_webpage');
  i18nReplace('optionItem', 'option');

  $('option').addEventListener('click', function () {
    chrome.tabs.create({ url: 'options.html'});
  }, false);
  if (HotKey.isEnabled()) {
    $('captureWindowShortcut').style.display = 'inline';
    $('captureAreaShortcut').style.display = 'inline';
    $('captureWebpageShortcut').style.display = 'inline';
    if (isWindowsOrLinux)
      $('captureScreenShortcut').style.display = 'inline';
    document.body.style.minWidth = "190px"
  } else {
    $('captureWindowShortcut').style.display = 'none';
    $('captureAreaShortcut').style.display = 'none';
    $('captureWebpageShortcut').style.display = 'none';
    if (isWindowsOrLinux)
      $('captureScreenShortcut').style.display = 'none';
    document.body.style.minWidth = "140px";
  }
  var isScriptLoad = false;
  chrome.tabs.getSelected(null, function(tab) {
    if (tab.url.indexOf('chrome') == 0 || tab.url.indexOf('about') == 0) {
      i18nReplace('tip', 'special');
      if (isWindowsOrLinux) {
        $('captureScreenItem').style.display = 'block';
        $('tip').style.display = 'none';
      }
      return;
    } else {
      $('tip').style.display = 'none';
      $('captureSpecialPageItem').style.display = 'block';
      if (isWindowsOrLinux)
        $('captureScreenItem').style.display = 'block';
      showOption();
    }
    chrome.tabs.sendRequest(tab.id, {msg: 'is_page_capturable'},
      function(response) {
        isScriptLoad = true;
        if (response.msg == 'capturable') {
          $('tip').style.display = 'none';
          if (isWindowsOrLinux)
            $('captureScreenItem').style.display = 'block';
          $('captureSpecialPageItem').style.display = 'none';
          $('captureWindowItem').style.display = 'block';
          $('captureAreaItem').style.display = 'block';
          $('captureWebpageItem').style.display = 'block';
          var textWidth = $('captureWindowText')['scrollWidth'];
          resizeDivWidth('captureWindowText', textWidth);
          resizeDivWidth('captureAreaText', textWidth);
          resizeDivWidth('captureWebpageText', textWidth);
          var bg = chrome.extension.getBackgroundPage();
          if (bg.screenshot.isThisPlatform('mac')) {
            $('captureAreaShortcut').innerText = '\u2325\u2318R';
            $('captureWindowShortcut').innerText = '\u2325\u2318V';
            $('captureWebpageShortcut').innerText = '\u2325\u2318H';
          }
        } else if (response.msg == 'uncapturable') {
          i18nReplace('tip', 'special');
          if (isWindowsOrLinux) {
            $('captureScreenItem').style.display = 'block';
            $('tip').style.display = 'none';
          } else {
            $('tip').style.display = 'block';
          }
        } else {
          i18nReplace('tip', 'loading');
        }
      });
  });
  chrome.tabs.executeScript(null, {file: 'isLoad.js'});
  var insertScript = function() {
    if (isScriptLoad == false) {
      chrome.tabs.getSelected(null, function(tab) {
        if (tab.url.indexOf('chrome') == 0 || 
            tab.url.indexOf('about') == 0) {
          i18nReplace('tip', 'special');
        } else {
          $('tip').style.display = 'none';
          $('captureSpecialPageItem').style.display = 'block';
          showOption();
        }
      });
      if (isWindowsOrLinux) {
        $('captureScreenItem').style.display = 'block';
        $('tip').style.display = 'none';
      }
    }
    var captureItems = document.querySelectorAll('li.menuI');
    var showSeparator = false;
    for (var i = 0; i < captureItems.length; i++) {
      if (window.getComputedStyle(captureItems[i]).display != 'none') {
        showSeparator = true;
        break;
      }
    }
    $('separatorItem').style.display = showSeparator ? 'block' : 'none';
  }
  setTimeout(insertScript, 500);

  // Update hot key.
  if (HotKey.get('area') != '@')
    $('captureAreaShortcut').innerText = 'Ctrl+Alt+' + HotKey.get('area');
  if (HotKey.get('viewport') != '@') {
    $('captureWindowShortcut').innerText = 'Ctrl+Alt+' +
        HotKey.get('viewport');
  }
  if (HotKey.get('fullpage') != '@') {
    $('captureWebpageShortcut').innerText ='Ctrl+Alt+' +
        HotKey.get('fullpage');
  }
  if (HotKey.get('screen') != '@')
    $('captureScreenShortcut').innerText = 'Ctrl+Alt+' + HotKey.get('screen');

  if (isWindowsOrLinux) {
    showOption();
  }

  $('captureSpecialPageItem').addEventListener('click', function(e) {
    toDo('capture_special_page');
  });
  $('captureAreaItem').addEventListener('click', function(e) {
    toDo('capture_area');
  });
  $('captureWindowItem').addEventListener('click', function(e) {
    toDo('capture_window');
  });
  $('captureWebpageItem').addEventListener('click', function(e) {
    toDo('capture_webpage');
  });
  $('captureScreenItem').addEventListener('click', function(e) {
    toDo('capture_screen');
  });
}

function showOption() {
  $('option').style.display = 'block';
  $('separatorItem').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);
