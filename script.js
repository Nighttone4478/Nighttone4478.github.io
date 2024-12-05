// 初始化 DOM 元素
const lockStateElement = document.getElementById('lock-state');
const unlockButton = document.getElementById('unlock-button');
const passwordInput = document.getElementById('password-input');
const submitPasswordButton = document.getElementById('submit-password');
const registerFingerprintButton = document.getElementById('register-fingerprint');
const cameraElement = document.getElementById('camera');
const captureTrainButton = document.getElementById('capture-train');
const espMessages = document.getElementById('esp-messages');

// Adafruit IO 配置
const AIO_USERNAME = 'YOUR_AIO_USERNAME';
const AIO_KEY = 'YOUR_AIO_KEY';
const BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}`;

async function fetchLockState() {
    const response = await fetch(`${BASE_URL}/feeds/lock-state/data`, {
        headers: { 'X-AIO-Key': AIO_KEY }
    });
    const data = await response.json();
    lockStateElement.textContent = data[0]?.value || '未知';
}

// 每 5 秒更新一次狀態
setInterval(fetchLockState, 5000);
fetchLockState();

unlockButton.addEventListener('click', async () => {
    await fetch(`${BASE_URL}/feeds/unlock/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: 'unlock' })
    });
    alert('解鎖指令已發送');
});

submitPasswordButton.addEventListener('click', async () => {
    const password = passwordInput.value;
    if (!password) {
        alert('請輸入密碼！');
        return;
    }
    await fetch(`${BASE_URL}/feeds/password/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: password })
    });
    alert('密碼已提交！');
});

registerFingerprintButton.addEventListener('click', async () => {
    await fetch(`${BASE_URL}/feeds/fingerprint-register/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: 'register' })
    });
    alert('指紋註冊模式啟動！');
});

// 初始化相機
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    cameraElement.srcObject = stream;
});

// 模型訓練與特徵提取
async function trainAndExtractFeatures() {
    const canvas = document.createElement('canvas');
    canvas.width = cameraElement.videoWidth;
    canvas.height = cameraElement.videoHeight;
    canvas.getContext('2d').drawImage(cameraElement, 0, 0);
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

    const inputTensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([128, 128])
        .toFloat()
        .expandDims(0);

    const model = await tf.loadLayersModel('https://example.com/your-pretrained-model.json');
    const features = model.predict(inputTensor).dataSync();

    await uploadFeatures(features);
}

// 上傳特徵至 Adafruit IO
async function uploadFeatures(features) {
    await fetch(`${BASE_URL}/feeds/face-features/data`, {
        method: 'POST',
        headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: JSON.stringify(features) })
    });
    alert('特徵已上傳！');
}

// 捕捉並訓練按鈕
captureTrainButton.addEventListener('click', trainAndExtractFeatures);

// 模擬訊息接收，實際應根據 MQTT 或 WebSocket 實現
setInterval(() => {
    espMessages.value += `ESP32 訊息：模擬訊息 ${new Date().toLocaleTimeString()}\n`;
}, 2000);

// 選擇上傳檔案或拍照
document.getElementById('choose-upload').addEventListener('click', toggleUploadOptions);
document.getElementById('file-upload-btn').addEventListener('click', handleFileUpload);
document.getElementById('capture-photo-btn').addEventListener('click', startCamera);

// 訓練模型按鈕
document.getElementById('train-model').addEventListener('click', startTraining);

let videoElement = document.createElement('video');
let stream;

// 顯示 / 隱藏上傳選項
function toggleUploadOptions() {
    const uploadOptions = document.getElementById('upload-options');
    const trainButton = document.getElementById('train-model');
    uploadOptions.style.display = (uploadOptions.style.display === 'none') ? 'block' : 'none';
    trainButton.style.display = 'none'; // 隱藏訓練按鈕，直到選擇了上傳或拍照
}

// 啟動攝像頭拍照
function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (mediaStream) {
                stream = mediaStream;
                videoElement.srcObject = stream;
                videoElement.width = 300; // 設定視頻寬度
                videoElement.height = 200; // 設定視頻高度
                document.body.appendChild(videoElement); // 顯示視頻
                videoElement.play();
                // 顯示拍照訓練按鈕
                document.getElementById('train-model').style.display = 'inline';
            })
            .catch(function (error) {
                console.log("錯誤: " + error);
            });
    }
}

// 處理檔案上傳
function handleFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.click();

    fileInput.addEventListener('change', function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = function (e) {
                    // 處理每一個檔案（上傳圖片）
                    const imageData = e.target.result;
                    uploadImage(imageData);
                };
                reader.readAsDataURL(file); // 將文件轉換為 Data URL
            }
        }
    });
}

// 上傳圖片數據
function uploadImage(imageData) {
    // 模擬上傳圖片數據
    console.log("上傳圖片:", imageData);
    document.getElementById('esp-messages').value += "圖片已上傳！\n";
}

// 訓練模型
function startTraining() {
    console.log("開始訓練模型");
    // 模擬訓練過程
    document.getElementById('esp-messages').value += "模型訓練完成！\n";
}
