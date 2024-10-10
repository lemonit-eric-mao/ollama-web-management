/**
 * @file index.js
 * @brief 首页
 * @author 毛巳煜
 */

let tableBody = document.getElementById('tableBody');
let refreshIntervalInput = document.getElementById('refreshInterval');
let refreshInterval = 10000; // 默认10秒
let refreshTimer = null;

/**
 * 初始化事件
 * @returns {Promise<void>}
 */
async function initializeEvent() {
    await loadModels(); // 加载模型列表

    // 加载 i18next 和 i18next-fetch-backend 插件
    initI18n('zh')

    // 处理刷新间隔变化事件
    refreshIntervalInput.onchange = (event) => {
        refreshInterval = parseInt(event.target.value, 10); // 更新刷新间隔
        startAutoRefresh(); // 重新启动定时器
    };

    // 启动自动刷新
    startAutoRefresh();
}

/**
 * 加载模型列表
 * @returns {Promise<void>}
 */
async function loadModels() {
    try {
        let tagsData = await ajax.get('/api/tags'); // 获取服务标签
        let psData = await ajax.get('/api/ps'); // 获取服务状态

        // 创建运行中模型的集合
        let runningModels = new Set(psData.models.map(model => model.name));

        localStorage.setItem('modelList', JSON.stringify([...runningModels]));// 存储模型名称

        tableBody.innerHTML = ''; // 清空表格
        tagsData.models.forEach(model => {
            let isRunning = runningModels.has(model.name); // 判断当前模型是否在运行中
            let statusLabel = isRunning ? '<span class="success label" data-i18n="index.running">运行中</span>' : '<span class="alert label" data-i18n="index.stopped">已停止</span>';
            let optionLabel = isRunning ? `<button class="warning button stop-btn margin-0" onclick="stopModel('${model.name}')" data-i18n="index.stop">停止</button>` : `<button class="success button start-btn margin-0" onclick="startModel('${model.name}')" data-i18n="index.start">启动</button>`;

            // 单位映射
            let units = {
                GB: 1000 ** 3,
                MB: 1000 ** 2,
            };
            // 确定使用的单位
            let unit = model.size >= units.GB ? 'GB' : 'MB';
            let divisor = units[unit];
            let modelSize = (model.size / divisor).toFixed(1);
            let newRow = `
                <tr>
                    <td>${model.name}</td>
                    <td>${modelSize}${unit}</td>
                    <td>${model.details.parameter_size}</td>
                    <td>${model.details.quantization_level}</td>
                    <td>${statusLabel}</td>
<!--                    <td>${model.processor}</td>-->
                    <td>
                        <button class="button view-btn margin-0" onclick="showModel('${model.name}')" data-i18n="index.view">查看</button>
                        ${optionLabel}
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', newRow); // 添加新行

            // 页面刷新时，更新国际化内容
            updateContent();
        });
    } catch (error) {
        console.log('加载模型服务列表失败:', error);
    }
}

/**
 * 启动自动刷新
 */
function startAutoRefresh() {
    clearInterval(refreshTimer); // 清除当前定时器
    refreshTimer = setInterval(() => {
        loadModels();
    }, refreshInterval);
}

/**
 * 查看模型详细
 * @param modelName
 */
function showModel(modelName) {
    localStorage.setItem('modelName', modelName); // 存储模型名称
    window.open(`/frontend/detail/detail.html`, '_blank');
}

/**
 * 启动模型
 * @param modelName
 */
function startModel(modelName) {
    ajax.post('/api/generate', {
        "model": modelName,
        "keep_alive": -1,
        "stream": true,
        "options": {"num_ctx": 4096}
    });
}

/**
 * 停止模型
 * @param modelName
 */
function stopModel(modelName) {
    ajax.post('/api/generate', {
        "model": modelName,
        "keep_alive": 0
    });
}

// 页面加载完成时初始化事件
document.addEventListener('DOMContentLoaded', initializeEvent);
