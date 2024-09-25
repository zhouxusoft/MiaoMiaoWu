import json
import os
import time
import requests
from PIL import Image, ImageDraw, ImageFont

def add_vertical_text_to_image(image_path, output_path, text, start_position, font_path=None, font_size=20, text_color=(255, 255, 255), line_spacing=5):
    # 打开原始图片
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    # 使用默认字体或指定字体
    if font_path:
        font = ImageFont.truetype(font_path, font_size)
    else:
        font = ImageFont.load_default()

    # 当前绘制位置
    current_position = list(start_position)

    # 绘制每一个字符，逐行排布
    for char in text:
        draw.text(tuple(current_position), char, font=font, fill=text_color)
        current_position[1] += font_size + line_spacing  # 移动到下一行位置

    # 保存生成的新图片
    image.save(output_path)

def out_img(name):
    # 获取当前脚本文件所在的目录
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # 使用相对路径引用图片和字体文件
    image_path = os.path.join(script_dir, 'background.png')
    output_path = os.path.join(script_dir, 'output_image.png')
    font_path = os.path.join(script_dir, 'YunFengFeiYunTi-2.ttf')

    text = name
    start_position = (646, 65)  # 文本起始位置 (x, y)
    font_size = 165  # 字体大小
    text_color = (217, 107, 108)  # 文本颜色
    line_spacing = 5  # 行间距

    add_vertical_text_to_image(image_path, output_path, text, start_position, font_path, font_size, text_color, line_spacing)
    # print(123)
    text = name
    start_position = (640, 60)  # 文本起始位置 (x, y)
    font_size = 165  # 字体大小
    text_color = (255, 255, 255)  # 文本颜色
    line_spacing = 5  # 行间距

    add_vertical_text_to_image(output_path, output_path, text, start_position, font_path, font_size, text_color, line_spacing)
    # print(456)
    # 绕过系统代理
    os.environ['http_proxy'] = ''
    os.environ['https_proxy'] = ''
    url = "http://pan-yz.chaoxing.com/upload/uploadfile?fldid=1045061839022714880&_token=99ad00c891d3e9e9bc9a613314ef9890&puid=198665227"

    files=[
    ('file',('output_image.png',open(output_path,'rb'),'image/png'))
    ]
    # print(files)

    response = requests.request("POST", url, files=files)
    response_dict = json.loads(response.text)
    preview_url = response_dict["data"]["previewUrl"]
    print(preview_url)
    return preview_url

out_img("斗破苍穹")