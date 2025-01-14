// 初始化 DOM 元素
const lockStateElement = document.getElementById('lock-state'); //鎖狀態 文字
const unlockButton = document.getElementById('unlock-button'); // 解鎖按鈕
const passwordInput = document.getElementById('password-input'); // 輸入文字框
const submitPasswordButton = document.getElementById('submit-password'); // 上傳密碼
const registerFingerprintButton = document.getElementById('register-fingerprint'); //註冊指紋按鈕
const espMessages = document.getElementById('esp-messages'); //顯示訊息框
const facetrain = document.getElementById('face-train') // 開啟人臉辨識頁面

// Adafruit IO 配置
const AIO_USERNAME = 'Nighttone';
const AIO_KEY = atob("YWlvX3BTeU8zMjdkSGlYcGowODhPY204VFJ3SVBBQ00=");
const BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/`;

// 每 0.5 秒 查詢鎖的狀態  OK
async function fetchLockState() {
    try {
        const response = await fetch(`${BASE_URL}/door-status/data/last`, {
            method: 'GET',
            headers: {
                'X-AIO-Key': AIO_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 判斷返回的值
        if (data.value === "1") {
            lockStateElement.textContent = "解鎖";
        } else if (data.value === "0") {
            lockStateElement.textContent = "上鎖";
        } else {
            lockStateElement.textContent = "未知狀態";
        }
    } catch (error) {
        console.error("無法獲取鎖狀態:", error);
        lockStateElement.textContent = "錯誤";
    }
}

// 每 0.5 秒更新一次狀態
setInterval(fetchLockState, 500);
fetchLockState();


//解鎖按鈕 OK
unlockButton.addEventListener('click', async () => {
    await fetch(`${BASE_URL}/door-status/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ value: "1" })
    });
    alert('解鎖指令已發送');
});

// 提交密碼 OK
submitPasswordButton.addEventListener('click', async () => {
    const password = passwordInput.value;
    // 驗證密碼是否為空
    if (!password) {
        alert('請輸入密碼！');
        return;
    }
    // 驗證密碼長度（假設長度限制為 4-8）
    if (password.length < 4 || password.length > 8) {
        alert('密碼長度需為 4 到 8 字元！');
        return;
    }
    // 提交密碼
    try {
        const response = await fetch(`${BASE_URL}/door-password/data`, {
            method: 'POST',
            headers: {
                'X-AIO-Key': AIO_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: `${password}` })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('密碼已提交！');
        passwordInput.value = ''; // 清空輸入框
    } catch (error) {
        alert(`提交失敗，請稍後重試！${error}`);
        console.error('提交失敗:', error);
    }
});

// 註冊指紋按鈕 OK
registerFingerprintButton.addEventListener('click', async () => {
    await fetch(`${BASE_URL}/door-enrollfinger/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: "1" })
    });
    alert('指紋註冊模式啟動！');
});

// 訓練模型
facetrain.addEventListener('click', async () => {
    await fetch(`${BASE_URL}/door-enrollface/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: "1" })
    });
    alert('已發送人臉辨識註冊請求!');
});

// 函式：格式的時間轉換為 'MM/DD HH:mm:ss'
function formatDate(isoString) {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以要加 1
    const day = String(date.getDate()).padStart(2, '0'); // 確保天數是兩位數
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
}
// 函式：格式化時間轉換為 'MM/DD HH:mm:ss'
function formatDate(isoString) {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以要加 1
    const day = String(date.getDate()).padStart(2, '0'); // 確保天數是兩位數
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
}

let messageHistory = []; // 保存最新的 10 條訊息

// 從 Adafruit IO 獲取資料並更新顯示
async function fetchDataAndUpdate() {
    try {
        // 從 Adafruit IO 或其他服務取得新資料
        const response = await fetch(`${BASE_URL}/door-serial/data`, {
            headers: {
                'X-AIO-Key': AIO_KEY
            }
        });
        const data = await response.json();

        // 假設 `data` 是一個包含歷史訊息的陣列，最新的訊息在最前面
        const messages = data.map(entry => ({
            time: entry.created_at, // ISO 時間格式
            value: entry.value
        }));

        // 合併歷史訊息並保留最新的 10 條
        messageHistory = [...messages].slice(0,20);
        messageHistory.reverse();

        // 更新顯示
        espMessages.value = messageHistory
            .map(msg => `${formatDate(msg.time)} ESP32訊息: ${msg.value}`)
            .join('\n');
        espMessages.scrollTop = espMessages.scrollHeight; // 滾動到最底部顯示最新訊息
    } catch (error) {
        console.error("資料取得錯誤：", error);
    }
}

// 設置定時器，每秒更新一次資料
setInterval(fetchDataAndUpdate, 1000);