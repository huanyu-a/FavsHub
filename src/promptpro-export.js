/**
 * PromptPro 导出/导入功能
 * 使用与自动备份相同的文件格式和备份文件夹
 */

import { backupManager } from './backup-manager.js';

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:8px;color:#fff;font-size:14px;z-index:99999;transition:opacity 0.3s;${type === 'error' ? 'background:#ef4444' : 'background:#10b981'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 导出按钮 — 写入自动备份文件夹
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const filename = await backupManager.performBackup(true);
        showToast(`已导出：${filename}`);
      } catch (err) {
        if (err.message === 'NO_FOLDER') {
          showToast('请先在主页设置中选择备份文件夹', 'error');
        } else if (err.message === 'NO_PERMISSION') {
          showToast('没有文件夹写入权限，请重新选择', 'error');
        } else if (err.message === 'NO_CHANGE') {
          showToast('数据无变化，不需新增记录文件');
        } else {
          showToast('导出失败：' + (err.message || '请重试'), 'error');
        }
      }
    });
  }

  // 导入按钮
  const importBtn = document.getElementById('importDataBtn');
  const importInput = document.getElementById('importFileInput');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (!confirm('确定要导入数据吗？当前数据将被覆盖。')) return;

          if (!PromptProDB.db) await PromptProDB.init();
          const success = await PromptProDB.importData(json);
          if (success) {
            showToast('数据已导入，正在刷新...');
            setTimeout(() => location.reload(), 500);
          } else {
            showToast('导入失败，请重试', 'error');
          }
        } catch (err) {
          console.error('[Import] 导入失败:', err);
          showToast('导入失败，请重试', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }
});
