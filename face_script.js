// 獲取 DOM 元素
const photoInput = document.getElementById('photo-input');
const selectPhotoButton = document.getElementById('select-photo-button');
const uploadPhotoButton = document.getElementById('upload-photo-button');
const clearSelectionButton = document.getElementById('clear-selection-button');
const photoName = document.getElementById('photo-name');

// 點擊 "選擇照片" 按鈕，觸發檔案選擇
selectPhotoButton.addEventListener('click', () => {
    photoInput.click(); // 手動觸發檔案選擇器
});

// 檔案選擇後顯示所有檔案名稱
photoInput.addEventListener('change', () => {
    if (photoInput.files.length > 0) {
        const fileNamesHtml = Array.from(photoInput.files)
            .map(file => `<li>${file.name}</li>`) // 將每個檔案名稱包裝成 <li>
            .join(''); // 將所有 <li> 合併為一段 HTML

        // 顯示多行格式的檔案名稱
        photoName.innerHTML = `<strong>已選擇檔案:</strong><ul>${fileNamesHtml}</ul>`;
    } else {
        photoName.textContent = '未選擇任何檔案';
    }
});

// 點擊 "取消選擇" 按鈕，清空檔案選擇
clearSelectionButton.addEventListener('click', () => {
    photoInput.value = ''; // 清空檔案選擇器
    photoName.textContent = '未選擇任何檔案'; // 重置顯示的檔案名稱
});

// 點擊 "上傳照片" 按鈕
uploadPhotoButton.addEventListener('click', () => {
    if (photoInput.files.length === 0) {
        alert('請先選擇照片！');
        return;
    }
    alert('照片已上傳！');
});


// 訓練模組按鈕功能
document.getElementById('train-module-button').addEventListener('click', () => {
    alert('新功能2已啟用');
});

document.getElementById('return-button').addEventListener('click', () => {
    window.location.href = './index.html'; // 跳轉回原頁面
});
