class ajax {
    /**
     * 基础URL
     */
    static baseURL = 'http://localhost:11345';

    /**
     * 发起请求
     * @param url
     * @param options
     * @returns {Promise<any>}
     */
    static async request(url, options) {
        let response = await fetch(`${ajax.baseURL}${url}`, options);
        return response.json();
    }

    /**
     *
     * @param url
     * @returns {Promise<*>}
     */
    static async get(url) {
        return ajax.request(url, {});
    }

    /**
     *
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
        return ajax.request(url, options);
    }

    /**
     *
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
        return ajax.request(url, options);
    }

    /**
     *
     * @param url
     * @returns {Promise<*>}
     */
    static async delete(url) {
        let options = {
            method: 'DELETE',
        };
        return ajax.request(url, options);
    }
}