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
        return await fetch(`${ajax.baseURL}${url}`, options); // 返回原始响应
    }

    /**
     * GET 请求
     * @param url
     * @param params
     * @param useBody
     * @returns {Promise<*>}
     */
    static async get(url, params, useBody = false) {

        let options = {
            method: 'GET',
        };

        if (useBody) {
            // 如果通过请求体传递参数
            options.headers = {'Content-Type': 'application/json'};
            options.body = JSON.stringify(params);
        } else {
            // 否则通过查询字符串传递参数（标准 HTTP 规范）
            let queryString = new URLSearchParams(params).toString();
            url = queryString ? `${url}?${queryString}` : url;
        }

        let response = await ajax.request(url, options);
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
     * @param params
     * @param useBody
     * @returns {Promise<*>}
     */
    static async delete(url, params, useBody = false) {
        let options = {
            method: 'DELETE',
        };

        // 通过请求体传递参数（兼容服务端不规范的实现）
        if (useBody) {
            options.headers = {'Content-Type': 'application/json'};
            options.body = JSON.stringify(params);
        } else {
            // 否则通过查询字符串传递参数（标准 HTTP 规范）
            let queryString = new URLSearchParams(params).toString();
            url = queryString ? `${url}?${queryString}` : url;
        }

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
