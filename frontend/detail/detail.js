async function fetchModelDetails() {
    let modelName = localStorage.getItem('modelName'); // 从localStorage获取模型名称

    try {
        let showData = await ajax.post('/api/show', {"name": modelName});
        displayModelDetails(showData);
    } catch (error) {
        console.error('获取模型详情失败:', error);
        document.getElementById('modelDetails').innerText = '加载模型详情失败';
    }
}


const defaultData = {
    modelfile: '',
    parameters: '',
    template: '',
    system: '',
    details: {
        parent_model: '',
        format: '',
        family: '',
        families: null,
        parameter_size: '',
        quantization_level: ''
    },
    model_info: {
        'general.architecture': '',
        'general.file_type': '',
        'general.parameter_count': '',
        'general.quantization_version': '',
        'llama.attention.head_count': '',
        'llama.attention.head_count_kv': '',
        'llama.attention.layer_norm_rms_epsilon': '',
        'llama.block_count': '',
        'llama.context_length': '',
        'llama.embedding_length': '',
        'llama.feed_forward_length': '',
        'llama.rope.dimension_count': '',
        'tokenizer.ggml.bos_token_id': '',
        'tokenizer.ggml.eos_token_id': '',
        'tokenizer.ggml.model': '',
        'tokenizer.ggml.padding_token_id': '',
        'tokenizer.ggml.scores': null,
        'tokenizer.ggml.token_type': null,
        'tokenizer.ggml.tokens': null
    },
    modified_at: ''
};

function displayModelDetails(param) {

    // 合并默认值和传入的数据
    let data = Object.assign({}, defaultData, param);

    let detailsDiv = document.getElementById('modelDetails');

    let modelDetails = `
        <ul class="accordion" data-accordion>
            <li>
                <a href="javascript:;" class="accordion-title">模型文件 (Modelfile)</a>
                <div class="accordion-content" data-tab-content="modelfile">
                    <pre>${data.modelfile.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">参数 (Parameters)</a>
                <div class="accordion-content" data-tab-content="parameters">
                    <pre>${data.parameters.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">模板 (Template)</a>
                <div class="accordion-content" data-tab-content="template">
                    <pre>${data.template.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">系统 (System)</a>
                <div class="accordion-content" data-tab-content="system">
                    <pre>${JSON.stringify(data.system, null, 4)}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">细节 (Details)</a>
                <div class="accordion-content" data-tab-content="details">
                    <pre>${JSON.stringify(data.details, null, 4)}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">模型信息 (Model Info)</a>
                <div class="accordion-content" data-tab-content="model_info">
                    <pre>${JSON.stringify(data.details, null, 4)}</pre>
                </div>
            </li>
            <li>
                <a href="javascript:;" class="accordion-title">修改时间 (Modified At)</a>
                <div class="accordion-content" data-tab-content="modified_at">
                    <pre>${new Date(data.modified_at).toLocaleString()}</pre>
                </div>
            </li>
        </ul>
    `;

    detailsDiv.innerHTML = modelDetails

}

// 页面加载时获取模型详情
document.addEventListener('DOMContentLoaded', fetchModelDetails);
