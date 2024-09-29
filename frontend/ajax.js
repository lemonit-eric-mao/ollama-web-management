class ajax {
    // 基础URL
    static baseURL = '';

    /**
     * 发起请求
     * @param url
     * @param options
     * @returns {Promise<any>}
     */
    static async request(url, options) {
        let response = await fetch(`${ajax.baseURL}${url}`, options);
        return response; // 返回原始响应
    }

    /**
     * GET 请求
     * @param url
     * @returns {Promise<*>}
     */
    static async get(url) {
        let response = await ajax.request(url, {});
        return response.json();
    }

    /**
     * POST 请求
     * @param url
     * @param data
     * @returns {Promise<*>}
     */
    static async post(url, data) {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        let response = await ajax.request(url, options);
        return response.json();
    }

    /**
     * PUT 请求
     * @param url
     * @param data
     * @returns {Promise<*>}
     */
    static async put(url, data) {
        let options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        let response = await ajax.request(url, options);
        return response.json();
    }

    /**
     * DELETE 请求
     * @param url
     * @returns {Promise<*>}
     */
    static async delete(url) {
        let options = {
            method: 'DELETE',
        };
        let response = await ajax.request(url, options);
        return response.json();
    }

    /**
     * 流式 POST 请求
     * @param url
     * @param data
     * @returns {Promise<*>}
     */
    static async postStream(url, data) {
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
        let response = await ajax.request(url, options);
        return response.body; // 返回流，交给业务代码处理
    }


}
