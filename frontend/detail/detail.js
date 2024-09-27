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
                <a href="#" class="accordion-title">模型文件 (Modelfile)</a>
                <div class="accordion-content" data-tab-content="modelfile">
                    <pre>${data.modelfile.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">参数 (Parameters)</a>
                <div class="accordion-content" data-tab-content="parameters">
                    <pre>${data.parameters.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">模板 (Template)</a>
                <div class="accordion-content" data-tab-content="template">
                    <pre>${data.template.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">系统 (System)</a>
                <div class="accordion-content" data-tab-content="system">
                    <pre>${data.system.replace(/\n/g, '<br>')}</pre>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">细节 (Details)</a>
                <div class="accordion-content" data-tab-content="details">
                    <ul>
                        <li class="item"><label>父模型 (Parent Model):</label> <pre>${data.details.parent_model || ''}</pre></li>
                        <li class="item"><label>格式 (Format):</label> <pre>${data.details.format}</pre></li>
                        <li class="item"><label>系列 (Family):</label> <pre>${data.details.family}</pre></li>
                        <li class="item"><label>系列数量 (Families):</label> <pre>${data.details.families || 'null'}</pre></li>
                        <li class="item"><label>参数大小 (Parameter Size):</label> <pre>${data.details.parameter_size}</pre></li>
                        <li class="item"><label>量化级别 (Quantization Level):</label> <pre>${data.details.quantization_level}</pre></li>
                    </ul>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">模型信息 (Model Info)</a>
                <div class="accordion-content" data-tab-content="model_info">
                    <ul>
                        <li class="item"><label>架构 (Architecture):</label> <pre>${data.model_info['general.architecture']}</pre></li>
                        <li class="item"><label>文件类型 (File Type):</label> <pre>${data.model_info['general.file_type']}</pre></li>
                        <li class="item"><label>参数数量 (Parameter Count):</label> <pre>${data.model_info['general.parameter_count']}</pre></li>
                        <li class="item"><label>量化版本 (Quantization Version):</label> <pre>${data.model_info['general.quantization_version']}</pre></li>
                        <li class="item"><label>注意力头数量 (Attention Head Count):</label> <pre>${data.model_info['llama.attention.head_count']}</pre></li>
                        <li class="item"><label>注意力头数量 KV (Attention Head Count KV):</label> <pre>${data.model_info['llama.attention.head_count_kv']}</pre></li>
                        <li class="item"><label>层归一化 RMS 容差 (Layer Norm RMS Epsilon):</label> <pre>${data.model_info['llama.attention.layer_norm_rms_epsilon']}</pre></li>
                        <li class="item"><label>块数量 (Block Count):</label> <pre>${data.model_info['llama.block_count']}</pre></li>
                        <li class="item"><label>上下文长度 (Context Length):</label> <pre>${data.model_info['llama.context_length']}</pre></li>
                        <li class="item"><label>嵌入长度 (Embedding Length):</label> <pre>${data.model_info['llama.embedding_length']}</pre></li>
                        <li class="item"><label>前馈长度 (Feed Forward Length):</label> <pre>${data.model_info['llama.feed_forward_length']}</pre></li>
                        <li class="item"><label>ROPE 维度数量 (Rope Dimension Count):</label> <pre>${data.model_info['llama.rope.dimension_count']}</pre></li>
                        <li class="item"><label>词元 ID (BOS Token ID):</label> <pre>${data.model_info['tokenizer.ggml.bos_token_id']}</pre></li>
                        <li class="item"><label>词元 ID (EOS Token ID):</label> <pre>${data.model_info['tokenizer.ggml.eos_token_id']}</pre></li>
                        <li class="item"><label>模型 (Model):</label> <pre>${data.model_info['tokenizer.ggml.model']}</pre></li>
                        <li class="item"><label>填充词元 ID (Padding Token ID):</label> <pre>${data.model_info['tokenizer.ggml.padding_token_id']}</pre></li>
                        <li class="item"><label>得分 (Scores):</label> <pre>${data.model_info['tokenizer.ggml.scores'] || 'null'}</pre></li>
                        <li class="item"><label>词元类型 (Token Type):</label> <pre>${data.model_info['tokenizer.ggml.token_type'] || 'null'}</pre></li>
                        <li class="item"><label>词元 (Tokens):</label> <pre>${data.model_info['tokenizer.ggml.tokens'] || 'null'}</pre></li>
                    </ul>
                </div>
            </li>
            <li>
                <a href="#" class="accordion-title">修改时间 (Modified At)</a>
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
