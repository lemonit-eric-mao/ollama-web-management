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
            let newRow = `
                <tr>
                    <td>${model.name}</td>
                    <td>
                        <button class="button view-btn" onclick="showModel('${model.name}')" data-i18n="model.view">查看</button>
                        <button class="warning button delete-btn" onclick="deleteModel('${model.name}')" data-i18n="model.delete">删除</button>
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

/**
 * 更新进度条显示
 */
function updateProgress(responseContainer, data) {

    if (data.status) {
        let statusMessages = {
            'pulling manifest': '📄 正在拉取清单...',
            'success': '✅ 模型拉取成功！',
            'verifying sha256 digest': '🔑 验证中...',
            'writing manifest': '✍️ 正在写入清单...',
            'removing any unused layers': '🧹 正在移除未使用的层...'
        };

        switch (data.status) {
            case 'pulling manifest':
            case 'success':
            case 'verifying sha256 digest':
            case 'writing manifest':
            case 'removing any unused layers':
                responseContainer.innerHTML = `<div class="callout"><span>${statusMessages[data.status]}</span></div>`;
                break;
            default:
                if (data.status.startsWith('pulling') && data.completed) {// 更新进度条
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
}

// 页面加载完成时初始化事件
document.addEventListener('DOMContentLoaded', initializeEvent);
