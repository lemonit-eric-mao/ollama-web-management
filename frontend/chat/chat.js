// 从 localStorage 中获取模型名称
let modelSelect = document.getElementById('modelSelect');
let models = JSON.parse(localStorage.getItem('modelList')) || [];

models.forEach(modelName => {
    let option = document.createElement('option');
    option.value = modelName;
    option.textContent = modelName;
    modelSelect.appendChild(option);
});

// 发送按钮状态控制
let chatInput = document.getElementById('chatInput');
let sendButton = document.getElementById('sendButton');
chatInput.addEventListener('input', () => {
    sendButton.disabled = chatInput.value.trim() === '';
});

async function sendMessage() {
    let message = chatInput.value.trim();
    if (message) {
        // 在聊天区域添加用户消息
        document.getElementById('chatContainer').innerHTML += `
                <div class="user-message">
                    <img class="avatar" src="user-avatar.png" alt="用户头像">
                    <span class="user-message-textarea">${message}</span>
                </div>
            `;
        chatInput.value = '';
        sendButton.disabled = true; // 发送后禁用按钮

        let response = await ajax.postStream('/api/chat/completions', {
            "question": message, "history": [], "stream": true, "model": modelSelect.value, "temperature": 0.01
        });

        // 处理流
        let reader = response.getReader();
        let decoder = new TextDecoder('utf-8');
        let readStream = async () => {
            let message = `
                    <img class="avatar" src="ai-avatar.png" alt="AI头像">
                    <pre class="ai-message-textarea"></pre>
                `

            // 必须要创建一个DOM元素，才能在下面使用appendChild()追加
            let wrapper = document.createElement('div');
            wrapper.classList.add('ai-message');
            // 将模板内容追加到DOM元素
            wrapper.innerHTML = message;
            // 将DOM元素追加到页面
            document.getElementById('chatContainer').appendChild(wrapper);

            while (true) {
                let {done, value} = await reader.read();
                if (done) break;

                // 解码并处理每一行
                let text = decoder.decode(value, {stream: true});
                text.split('\n').forEach(line => {
                    if (line.trim()) { // 只处理非空行
                        let jsonObject = JSON.parse(line.replaceAll('data: {"text": ', '{"text": '));
                        wrapper.querySelector('.ai-message-textarea').innerHTML += jsonObject.text; // 将文本添加到页面
                    }
                });
            }
        };
        await readStream(); // 等待流读取完成
    }
}

// 发送消息功能
sendButton.onclick = () => {
    sendMessage();
};

// 回车事件
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault(); // 阻止换行
            sendMessage();
        }
    }
});

// 当前页面国际化语言
initI18n(localStorage.getItem('language'));