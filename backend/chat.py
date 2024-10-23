from openai import OpenAI


class ChatServer(object):

    def __init__(self):
        self.client = OpenAI(base_url="http://221.180.141.96:11434/v1/", api_key="empty")

    # 拼接提示词
    def join_prompt(self, question, history, system_prompt: str = None):
        messages = history + [{"role": "user", "content": question}]
        if system_prompt:
            messages.insert(0, {"role": "system", "content": system_prompt})
        return messages

    # 聊天函数
    def chat(self, question, history, **kwargs):
        # 1. 拼接对话记录
        messages = self.join_prompt(question, history)

        # 2. 发起对话
        response = self.client.chat.completions.create(
            messages=messages,
            **kwargs
        )

        # 4. 返回流式对话结果
        if kwargs.get("stream"):
            return response

        # 5. 返回同步对话结果
        return response.choices[0].message.content
