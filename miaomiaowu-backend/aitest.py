import requests
import json
import time

url = "https://spark-api-open.xf-yun.com/v1/chat/completions"
data = {
        "model": "generalv3.5", # 指定请求的模型
        "messages": [
            {
                "role": "system",
                "content": "根据用户提供的影视作品名称（如动漫、电视剧、电影等），用你所知的为用户提供该部作品的简介。你无需回答多余内容，仅返回简介正文即可"
            },
            {
                "role": "user",
                "content": "斗破苍穹"
            }
        ],
   		"stream": True
    }
header = {
    "Authorization": "Bearer PrwTnhLvEgFtnedAGbFm:tdWdTWxPmIdkvkssMRnx" # 注意此处替换自己的APIPassword
}
response = requests.post(url, headers=header, json=data, stream=True)

# 流式响应解析示例
response.encoding = "utf-8"

def print_content(content):
    for i in range(0, len(content)):
        print(content[i], end='', flush=True)
        time.sleep(0.02)

for line in response.iter_lines(decode_unicode="utf-8"): # type: ignore
    # print(repr(line))
    if line == 'data: [DONE]':
        # print('\n<完>')
        break
    if line.strip():
        code = line.split('"code":')[1]
        code = code.split(',')[0]
        # print(code)
        if code == '0':
            # print(line)
            answer = line.split('"content":"'   )[1]
            answer = answer.split('"},"index"')[0]
            answer = answer.replace('\\n\\n', '\n')
            answer = answer.replace('\\n', '\n')
            answer = answer.replace('**', '')
            print_content(answer)
            # print(answer, end='')
            # print(repr(answer))
        else:
            print('请求错误，请稍后再试', code)