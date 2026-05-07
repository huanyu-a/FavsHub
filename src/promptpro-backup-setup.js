import { backupManager } from './backup-manager.js';

async function checkBackupSetup() {
    try {
        const folderName = await backupManager.getFolderName();
        if (folderName) return;

        const modal = document.getElementById('backupSetupModal');
        const selectBtn = document.getElementById('setupBackupFolderBtn');
        const skipBtn = document.getElementById('skipBackupSetupBtn');
        const confirmBtn = document.getElementById('confirmBackupSetupBtn');
        const folderNameEl = document.getElementById('setupFolderName');
        let selectedName = null;

        modal.classList.add('active');

        selectBtn.addEventListener('click', async () => {
            try {
                const name = await backupManager.selectFolder();
                if (name) {
                    selectedName = name;
                    folderNameEl.textContent = name;
                    folderNameEl.style.color = 'var(--text-primary, #1e293b)';
                    confirmBtn.disabled = false;
                }
            } catch (err) {
                console.error('选择文件夹失败:', err);
            }
        });

        skipBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        confirmBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            if (selectedName) {
                showToast(`备份目录已设置：${selectedName}`);
            }
        });
    } catch (err) {
        console.error('检查备份目录失败:', err);
    }
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkBackupSetup);
} else {
    checkBackupSetup();
}
