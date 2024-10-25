let tableBody = document.getElementById('tableBody');

/**
 * 初始化事件
 * @returns {Promise<void>}
 */
async function initializeEvent() {
    await loadModels(); // 加载模型列表

    // 当前页面国际化语言
    initI18n(localStorage.getItem('language'));

    // 处理操作事件
    tableBody.click = (event) => {
        if (event.target.classList.contains('delete-btn')) {
            let row = event.target.closest('tr'); // 找到对应的行
            if (row) {
                row.remove(); // 删除行
            }
        }
    };

}

/**
 * 加载模型列表
 * @returns {Promise<void>}
 */
async function loadModels() {
    try {
        let tagsData = await ajax.get('/api/tags'); // 获取模型列表

        tableBody.innerHTML = ''; // 清空表格
        tagsData.models.forEach(model => {

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
                    <td>
                        <button class="button view-btn margin-0" onclick="showModel('${model.name}')" data-i18n="model.view">查看</button>
                        <button class="warning button delete-btn margin-0" onclick="deleteModel('${model.name}')" data-i18n="model.delete">删除</button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', newRow); // 添加新行

            // 页面刷新时，更新国际化内容
            updateContent();
        });
    } catch (error) {
        console.log('加载模型列表失败:', error);
    }
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
 * 删除模型
 * @param modelName
 */
async function deleteModel(modelName) {
    try {
        await ajax.delete('/api/delete', {"name": modelName}, true);
        // 重新渲染列表
        await loadModels()
    } catch (error) {
        console.log(`删除模型【${modelName}】失败:`, error);
    }
}

/**
 * 拉取模型
 */
async function pullModel() {
    let modelNameInput = document.getElementById('modelName');
    let responseContainerPre = document.getElementById('responseContainer');

    let modelName = modelNameInput.value;

    try {
        let response = await ajax.postStream('/api/pull', {
            "name": modelName,
            "stream": true,
        });

        // 处理流
        let reader = response.getReader();
        let decoder = new TextDecoder('utf-8');
        let readStream = async () => {
            while (true) {
                // 读取流数据
                let {done, value} = await reader.read();
                if (done) break;

                // 解码并处理每一行
                let text = decoder.decode(value, {stream: true});

                // 解析每一行的 JSON 数据
                let lines = text.split('\n');
                for (let line of lines) {
                    if (line.trim() !== '') {
                        let jsonData = JSON.parse(line);
                        // 更新进度条
                        updateProgress(responseContainerPre, jsonData);
                    }
                }
            }
        };
        await readStream(); // 等待流读取完成

        // 重新渲染列表
        await loadModels()
    } catch (error) {
        responseContainerPre.innerHTML = `<div class="callout"><span  style="color: red;">拉取模型失败: ${error.message}</span></div>`;
    }
}

// 标准状态码
const statusMessages = {
    'pulling manifest': '📄 正在拉取清单...',
    'downloading digestname': '⬇️ 正在下载摘要名称...',
    'verifying sha256 digest': '🔑 验证中...',
    'writing manifest': '✍️ 正在写入清单...',
    'removing any unused layers': '🧹 正在移除未使用的层...',
    'success': '✅ 模型拉取成功！',
    'reading model metadata': '📚 正在读取模型元数据...',
    'creating system layer': '🛠️ 正在创建系统层...',
    'loading model': '⏳ 模型加载中，请稍后...',
};

// 代有前缀的动态状态信息
const progressStates = ['pulling', 'creating new layer', 'writing', 'using already created layer'];

/**
 * 更新进度条显示
 */
function updateProgress(responseContainer, data) {

    if (data.status) {

        let message = statusMessages[data.status]

        if (message) {
            responseContainer.innerHTML = `<div class="callout"><span>${message}</span></div>`;
        } else if (progressStates.some(state => data.status.startsWith(state)) && data.completed) {
            // 更新进度条
            // 单位映射
            let units = {
                GB: 1000 ** 3,
                MB: 1000 ** 2,
            };

            // 确定使用的单位
            let unit = data.total >= units.GB ? 'GB' : 'MB';
            let divisor = units[unit];

            let completedSize = (data.completed / divisor).toFixed(2);
            let totalSize = (data.total / divisor).toFixed(2);
            let progress = ((data.completed / data.total) * 100).toFixed(2);

            responseContainer.innerHTML = `
                <div class="callout">
                    <strong>Downloading: </strong><span>${data.digest}</span><strong> [${completedSize}${unit}/${totalSize}${unit}]</strong>
                    <div class="progress" role="progressbar" tabindex="0" aria-valuenow="${progress}" aria-valuemin="0" aria-valuetext="${progress}%" aria-valuemax="100">
                        <span class="progress-meter" style="width: ${progress}%">
                            <p class="progress-meter-text">${progress}%</p>
                        </span>
                    </div>
                </div>
            `;
        }
    }

    // 自动滚动到最新信息
    responseContainer.scrollTop = responseContainer.scrollHeight;
}


const defaultModelFileContent = `
# ------------------------------
# 模型文件模板
# ModelFile Template
# ------------------------------

# 定义要使用的基础模型 (必填)
# Specify the base model to use. (required)
FROM 

# 设置 Ollama 运行模型的参数
# Sets the parameters for how Ollama will run the model.
PARAMETER 

# 要发送到模型的完整提示模板
# The full prompt template to be sent to the model.
TEMPLATE """

"""

# 指定将在模板中设置的系统消息
# Specifies the system message that will be set in the template.
SYSTEM 

# 定义应用于模型的 (Q)LoRA 适配器
# Defines the (Q)LoRA adapters to apply to the model.
ADAPTER 

# 指定法律许可证
# Specifies the legal license.
LICENSE 

# 指定消息历史
# Specify message history.
MESSAGE 
`

function showLoadModelDialog() {
    document.getElementById('loadModelDialog').style.display = 'flex';
    document.getElementById('dialogModelName').value = '';
    document.getElementById('dialogModelFileContent').value = defaultModelFileContent;

    // 当前页面国际化语言
    // initI18n(localStorage.getItem('language'));
}

function closeLoadModelDialog() {
    document.getElementById('loadModelDialog').style.display = 'none';
    document.getElementById('dialogModelName').value = '';
    document.getElementById('dialogModelFileContent').value = defaultModelFileContent;
}


/**
 * 加载本地模型
 */
async function loadLocalModel(event) {

    event.preventDefault(); // 阻止表单提交

    let modelName = document.getElementById('dialogModelName').value;
    let modelFileContent = document.getElementById('dialogModelFileContent').value;
    let responseContainerPre = document.getElementById('responseContainer');

    try {

        responseContainerPre.innerHTML = `<div class="callout"><span>${statusMessages['loading model']}</span></div>`;

        let response = await ajax.postStream('/api/create', {
            "name": modelName,
            "modelfile": modelFileContent,
            "stream": true,
        });

        // 请求成功，关闭窗口
        closeLoadModelDialog();

        // 处理流
        let reader = response.getReader();
        let decoder = new TextDecoder('utf-8');
        let readStream = async () => {
            while (true) {
                // 读取流数据
                let {done, value} = await reader.read();
                if (done) break;

                // 解码并处理每一行
                let text = decoder.decode(value, {stream: true});

                // 解析每一行的 JSON 数据
                let lines = text.split('\n');
                for (let line of lines) {
                    if (line.trim() !== '') {
                        let jsonData = JSON.parse(line);
                        // 更新进度条
                        updateProgress(responseContainerPre, jsonData);
                    }
                }
            }
        };
        await readStream(); // 等待流读取完成

        // 重新渲染列表
        await loadModels()
    } catch (error) {
        responseContainerPre.innerHTML = `<div class="callout"><span  style="color: red;">加载模型失败: ${error.message}</span></div>`;
    }
}

// 页面加载完成时初始化事件
document.addEventListener('DOMContentLoaded', initializeEvent);
