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

// 页面加载完成时初始化事件
document.addEventListener('DOMContentLoaded', initializeEvent);
