# OLLAMA 服务端地址
# OLLAMA_URL = "http://221.180.141.96:11434"
OLLAMA_URL = "http://42.202.134.15:11434"


def get_ollama_url():
    return OLLAMA_URL


def set_ollama_url(url):
    global OLLAMA_URL
    OLLAMA_URL = url


# 主机地址
HOST_URL = "0.0.0.0"
HOST_PORT = 11345
