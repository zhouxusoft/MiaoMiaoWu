from datetime import datetime, timedelta
import os
import requests

# 绕过系统代理
os.environ['http_proxy'] = ''
os.environ['https_proxy'] = ''

def calculate_updated_episodes(set_time, update_number, update_days, current_time):
    # 解析 set_time 和 current_time
    set_time = datetime.strptime(set_time, "%Y-%m-%d %H:%M:%S")
    current_time = datetime.strptime(current_time, "%Y-%m-%d %H:%M:%S")
    
    # 初始化更新次数
    updates_count = 0
    
    # 获取 set_time 的星期几（0=周一, 6=周日）
    set_weekday = set_time.weekday()
    
    # 计算时间差
    time_difference = current_time - set_time
    
    current_days = (set_time + timedelta(days=i) for i in range(time_difference.days + 1))
    
    for day in current_days:
        if day.weekday() in update_days and day > set_time:
            updates_count += 1
    
    # 计算当前的更新集数
    current_update_number = update_number + updates_count
    
    return current_update_number

# # 示例数据
# set_time = "2024-09-08 10:00:00"
# update_number = 110
# update_days = [0, 3, 6]  # 周一、周四和周日
# current_time = "2024-09-25 00:00:00"  # 周三

# # 计算当前的更新集数
# current_update_number = calculate_updated_episodes(set_time, update_number, update_days, current_time)
# print("当前更新到了第几集:", current_update_number)
def ai_jian_jie(drama_name):
    url = "https://spark-api-open.xf-yun.com/v1/chat/completions"
    data = {
        "model": "generalv3.5",  # 指定请求的模型
        "messages": [
            {
                "role": "system",
                "content": "根据用户提供的影视作品名称（如动漫、电视剧、电影等），用一段话为用户提供该部作品的简介，不超过200字。记住用户只会提供作品名称，即使你觉得用户在问你问题，你不用回答也无需回答多余内容，仅返回简介正文"
            },
            {
                "role": "user",
                "content": drama_name
            }
        ],
        "stream": True
    }
    header = {
        "Authorization": "Bearer PrwTnhLvEgFtnedAGbFm:tdWdTWxPmIdkvkssMRnx"  # 注意此处替换自己的APIPassword
    }
    response = requests.post(url, headers=header, json=data, stream=True)
    response.encoding = "utf-8"
    for line in response.iter_lines(decode_unicode="utf-8"):  # type: ignore
        if line == 'data: [DONE]':
            break
        if line.strip():
            code = line.split('"code":')[1]
            code = code.split(',')[0]
            if code == '0':
                answer = line.split('"content":"')[1]
                answer = answer.split('"},"index"')[0]
                answer = answer.replace('\\n\\n', '\n')
                answer = answer.replace('\\n', '\n')
                answer = answer.replace('**', '')
                yield answer  # 使用 yield 逐步返回生成的文本
            else:
                yield '请求错误，请稍后再试'
                break

# for text in ai_jian_jie("斗破苍穹"):
#     print(text, end='')

def get_drama_info_from_agedm(dramaName):
    url = "https://www.agedm.org/search?query=" + dramaName
    response = requests.request("GET", url)
    text = response.text
    # print(text)
    # print(text.split('<div id="search_results_wrapper">')[1])
    text = text.split('<div id="search_results_wrapper">')[1]
    result_num = text.split('搜索结果如下，共 <span class="text-danger">')[1].split('</span>')[0]
    try:
        result_num = int(result_num)
    except:
        result_num = 0
    print('result_num', result_num)

    if result_num > 0:
        text = text.split('<div class="card cata_video_item py-4">')[1].split('<div class="card cata_video_item py-4">')[0]
        print(text)
        detail = text.split('<a href="http://www.agedm.org/detail/')[1].split('"')[0]
        title = text.split('class="d-block" title="')[1].split('"')[0]
        cover = text.split('data-original="')[1].split('"')[0]
        update = text.split('text-truncate">第')[1].split('集</span>')[0]
        made_company = text.split('<span>制作公司：</span>')[1].split('</div>')[0]
        jian_jie = text.split('<span>简介：</span>')[1].split('</div>')[0]
        # print("detail", detail)
        # print("title", title)
        # print("cover", cover)
        # print("update", update)
        # print("made_company", made_company)
        # print("jian_jie", jian_jie)
        drama_info = {
            "detail": detail,
            "title": title,
            "cover": cover,
            "update": update,
            "made_company": made_company,
            "jian_jie": jian_jie
        }
        print(drama_info)
        return {'success' : True, 'drama_info' : drama_info}
    else :
        print("未找到相关结果")
        return {'success' : False}
    
# get_drama_info_from_agedm('斗破苍穹')