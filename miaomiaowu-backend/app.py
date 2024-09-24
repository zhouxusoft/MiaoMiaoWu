from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from create_db import create_database
from datetime import datetime
from modules import *
import pymysql
import requests
import os
import time
import uuid
import threading

load_dotenv()
# 从配置文件中读取数据
MYSQL_DATABASE_HOST = os.getenv("MYSQL_DATABASE_HOST") # 数据库主机地址
MYSQL_DATABASE_USER = os.getenv("MYSQL_DATABASE_USER") # 数据库用户名
MYSQL_DATABASE_PASSWORD = os.getenv("MYSQL_DATABASE_PASSWORD") # 数据库密码
if not MYSQL_DATABASE_PASSWORD:
    exit()
TOKEN_INVALID_TIME = os.getenv("TOKEN_INVALID_TIME") # access-token 过期时间
if not TOKEN_INVALID_TIME:
    TOKEN_INVALID_TIME = 15 # 默认 15
TOKEN_INVALID_TIME = int(TOKEN_INVALID_TIME)
APP_ID = os.getenv("APP_ID") # 小程序AppID
APP_SECRET = os.getenv("APP_SECRET") # 小程序AppSecret

# 创建一个线程锁对象，用于解决多个请求同时访问数据库问题
lock = threading.Lock()

create_database()

# 数据库连接
db = pymysql.connect(
    host=MYSQL_DATABASE_HOST,
    user=MYSQL_DATABASE_USER,
    password=MYSQL_DATABASE_PASSWORD,
    db="miao_miao_wu",
    charset="utf8mb4",
    autocommit=True
)
dbcursor = db.cursor()

app = Flask(__name__)

# 在所有请求前判断数据库连接状态
@app.before_request
def before_request():
    if not db.open:
        db.connect()

@app.route('/login', methods=['POST'])
def login():
    # 获取小程序端，用于请求用户信息的 code
    data = request.get_json()
    code = data['code']
    if not data:
        return jsonify({'success': False, 'message': '登录失败, Missing code'})

    # 小程序信息
    app_id = APP_ID
    app_secret = APP_SECRET

    # 向微信请求用户信息
    url = f'https://api.weixin.qq.com/sns/jscode2session?appid={app_id}&secret={app_secret}&js_code={code}&grant_type=authorization_code'
    
    response = requests.get(url)
    userdata = response.json()
    # 判断信息是否包含 openid 和 session_key
    if 'openid' in userdata and 'session_key' in userdata:
        openid = userdata['openid']
        session_key = userdata['session_key']
        print(openid)
        # 向数据库请求用户信息，若不存在则新建用户信息
        user_info = find_or_create_user(openid, session_key)

        # print(user_info)

        access_token = str(uuid.uuid4())

        # 创建 access-token
        sql = "INSERT INTO `access_token` (`user_id`, `token`) VALUES (%s, %s)"
        val = (user_info[0], access_token)
        lock.acquire()
        try:
            dbcursor.execute(sql, val)
            db.commit()
        finally:
            lock.release()

        return jsonify({'success': True, 'userInfo': user_info, 'accessToken': access_token})
    else:
        return jsonify({'success': False, 'message': '登录失败, Error userInfo'})

@app.route('/save_profile', methods=['POST'])
def save_profile():
    data = request.get_json()
    user_info = data.get('userInfo')
    access_token = data.get('accessToken')
    if not user_info:
        return jsonify({'success': False, 'message': 'Missing userInfo'})
    user_about = checkCookie(access_token)
    if not user_about['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})
    print(user_info)
    print(access_token)
    user_id = user_about['user_id']
    nickname = user_info.get('nickName')
    avatar_url = user_info.get('avatarUrl')

    if not user_id or not nickname or not avatar_url:
        return jsonify({'success': False, 'message': 'Incomplete userInfo'})
    
    # 更新用户信息
    sql = "UPDATE `users` SET nickname = %s, avatar = %s WHERE id = %s"
    val = (nickname, avatar_url, user_id)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        db.commit()
    finally:
        lock.release()
    
    # 获取更新后的用户信息
    sql = "SELECT `id`, `nickname`, `avatar` FROM `users` WHERE id = %s"
    val = (user_id,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchone()
    finally:
        lock.release()
    
    return jsonify({'success': True, 'userInfo': result, 'message': 'Get UserInfo Success'})

@app.route('/check_session', methods=['POST'])
def check_session():
    data = request.get_json()
    accessToken = data.get('accessToken')
    print(accessToken)
    if accessToken:
        check = checkCookie(accessToken)
        # 向前端返回当前的登录状态
        if check['success']:
            user_info = get_user_info(check['user_id'])
            return jsonify({'success': True, 'message': '当前已登录', 'userInfo': user_info})
        else:
            return jsonify({'success': False, 'message': '当前未登录'})
    else:
        return jsonify({'success': False, 'message': '当前未登录'})

@app.route('/get_user_drama', methods=['POST'])
def get_user_drama():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})

    check = checkCookie(accessToken)
    user_id = check['user_id']

    sql = "SELECT * FROM `drama` WHERE `user_id` = %s"
    val = (user_id,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchall()
    finally:
        lock.release()

    return jsonify({'success': True, 'dramas': result})


# 查询用户，没有查到就创建新的用户
def find_or_create_user(openid, session_key):
    # 查询用户的id、昵称、头像链接
    sql = "SELECT `id`, `nickname`, `avatar` FROM `users` WHERE openid = %s"
    val = (openid,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchall()
    finally:
        lock.release()

    # 获取当前时间，用于刷新用户的最近登录时间
    latest_login_time = datetime.now()

    # 判断用户是否存在于数据库，若没有，则新建用户
    if result:
        # 更新用户的 session_key 和 最近登录时间
        sql = "UPDATE users SET `session_key` = %s, `latest_login_time` = %s WHERE openid = %s"
        val = (session_key, latest_login_time, openid)
        lock.acquire()
        try:
            dbcursor.execute(sql, val)
            db.commit()
        finally:
            lock.release()
    else:
        # 创建新的用户
        sql = "INSERT INTO `users` (`openid`, `session_key`, `latest_login_time`) VALUES (%s, %s, %s)"
        val = (openid, session_key, latest_login_time)
        lock.acquire()
        try:
            dbcursor.execute(sql, val)
            db.commit()
        finally:
            lock.release()
        # 创建完成后查询该用户
        sql = "SELECT `id`, `nickname`, `avatar` FROM `users` WHERE openid = %s"
        val = (openid,)
        lock.acquire()
        try:
            dbcursor.execute(sql, val)
            result = dbcursor.fetchall()
        finally:
            lock.release()
    # 返回用户信息
    return result[0]

# 判断 access-token 是否有效
def checkCookie(token):
    # 判断当前 token 是否存在于数据库中
    sql = "SELECT `user_id`, `set_time` FROM `access_token` WHERE `token` = %s"
    val = (token,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchall()
    finally:
        lock.release()
    # 若数据库中存在当前 cookie, 判断其时间是否过期
    if len(result) > 0:
        current_time = datetime.now()
        if isTimeOut(result[0][1], current_time):
            return ({'success': False, 'message': '登录过期'})
        return  ({'success': True, 'message': '已登录', 'user_id': result[0][0]})
    else:
        return ({'success': False, 'message': '未登录'})

# 判断 cookie 是否过期
def isTimeOut(time1, time2):
    # 计算时间差值
    difference = abs(time2 - time1)
    # 判断差值是否大于 TOKEN_INVALID_TIME 天
    if difference.days >TOKEN_INVALID_TIME:
        return True
    else:
        return False

# 获取用户信息
def get_user_info(user_id):
    sql = "SELECT `id`, `nickname`, `avatar` FROM `users` WHERE `id` = %s"
    val = (user_id,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchall()
    finally:
        lock.release()
    return result[0]

# 上传图片到超星云盘，并返回下载链接、
def upload_image_to_chaoxing(file):
    file_path = './可爱小鸭子.png'
    files=[
        ('file',('bilibili.png',open('D:\\系统默认\\下载\\bilibili.png','rb'),'image/png'))
    ]
    headers = {
        'Host': 'pan-yz.chaoxing.com'
    }
    url = 'http://pan-yz.chaoxing.com/upload/uploadfile?fldid=1045061839022714880&_token=99ad00c891d3e9e9bc9a613314ef9890&puid=198665227'
    response = requests.request("POST", url, headers=headers, files=files)
    
    print(response.text)
    
    if response.status_code == 200:
        print('Upload successful:', response.json())
    else:
        print('Upload failed:', response.status_code, response.text)
    previewurl = ''
    return previewurl


# upload_image_to_chaoxing(1)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)