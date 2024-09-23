from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
import requests
from create_db import create_database
from datetime import datetime
from modules import *
import pymysql
import os
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
        
        # 向数据库请求用户信息，若不存在则新建用户信息
        user_info = find_or_create_user(openid, session_key)

        # print(user_info)

        return jsonify({'success': True, 'userInfo': user_info, 'accessToken': ''})
    else:
        return jsonify({'success': False, 'message': '登录失败, Error userinfo'})

# 查询用户，没有查到就创建新的用户
def find_or_create_user(openid, session_key):
    # 查询用户的id、昵称、头像链接
    sql = "SELECT `id`, `nickname`, `avatar` FROM `users` WHERE openid = %s"
    val = (openid,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        result = dbcursor.fetchone()
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
            result = dbcursor.fetchone()
        finally:
            lock.release()
    # 返回用户信息
    return result

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)