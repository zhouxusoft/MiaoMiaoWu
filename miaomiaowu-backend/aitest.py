import requests
import json

url = "https://spark-api-open.xf-yun.com/v1/chat/completions"
data = {
        "model": "generalv3.5", # 指定请求的模型
        "messages": [
            {
                "role": "user",
                "content": "为斗破苍穹动漫写一个简短的简介"
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
for line in response.iter_lines(decode_unicode="utf-8"): # type: ignore
    # print(repr(line))
    if line == 'data: [DONE]':
        # print('\n<完>')
        break
    if line.strip():
        # print(line)
        answer = line.split('"content":"'   )[1]
        answer = answer.split('"},"index"')[0]
        answer = answer.replace('\\n\\n', '\n')
        answer = answer.replace('\\n', '\n')
        answer = answer.replace('**', '')
        print(answer, end='')
        # print(repr(answer))
        
    
    
