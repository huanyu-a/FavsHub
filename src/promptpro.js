/**
 * PromptPro 提示词管理系统 - 集成脚本
 * 直接打开 promptpro.html 页面
 */

(function() {
  'use strict';

  // 打开 PromptPro 提示词管理页面
  function showPromptPro() {
    console.log('[PromptPro] 打开提示词管理页面...');

    // 使用 Chrome 扩展 API 打开新标签页
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const promptproUrl = chrome.runtime.getURL('src/promptpro.html');
      chrome.tabs.create({ url: promptproUrl });
    } else {
      // 降级到 window.open
      window.open('promptpro.html', '_blank');
    }
  }

  // 绑定事件 - 侧边栏入口
  const promptproItem = document.querySelector('#promptpro-entry .promptpro-item');

  if (promptproItem) {
    promptproItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[PromptPro] 提示词管理被点击');
      showPromptPro();
    });
    console.log('[PromptPro] 侧边栏入口事件绑定完成');
  }

  // 也支持直接点击链接
  const promptproLink = document.getElementById('promptpro-link');
  if (promptproLink) {
    promptproLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[PromptPro] 链接被点击');
      showPromptPro();
    });
  }

  // 暴露全局函数（供其他脚本调用）
  window.showPromptPro = showPromptPro;

})();
