/**
 * 初始化 i18n
 */
function initI18n(language) {

    // 默认语言
    let defaultLanguage = language || 'zh';
    // 将默认语言保存到本地
    localStorage.setItem('language', defaultLanguage);

    // 初始化 i18next
    i18next
        .use(i18nextHttpBackend)
        .init({
            lng: defaultLanguage, // 默认语言
            fallbackLng: defaultLanguage,
            backend: {
                loadPath: '/frontend/i18n/{{lng}}.json'
            }
        }, (err, t) => {
            if (err) {
                console.log(err)
                return;
            }
            updateContent();
        });


    // 语言切换器
    let languageSwitcher = document.getElementById('languageSwitcher');
    if (languageSwitcher) {
        // 让下拉框默认选中
        languageSwitcher.value = defaultLanguage;
        languageSwitcher.onchange = () => {
            localStorage.setItem('language', languageSwitcher.value);
            i18next.changeLanguage(languageSwitcher.value, updateContent);
        };
    }
}

/**
 * 更新页面内容
 */
function updateContent() {
    // 用于替换元素的文本内容
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        let key = element.getAttribute('data-i18n');
        element.innerText = i18next.t(key);
    });

    // 用于替换元素的属性值，比如 title、placeholder 等
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
        let attrPair = element.getAttribute('data-i18n-attr');
        let [attr, key] = attrPair.split(':');
        element.setAttribute(attr, i18next.t(key));
    });
}