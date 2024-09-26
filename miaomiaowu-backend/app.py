from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from create_db import create_database
from datetime import datetime
from modules import *
from coverOutput.makeCover import *
import pymysql
import requests
import os
import json
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

"""
    登录接口 /login

    请求方法:
        POST

    请求参数:
        - code (str): 用于请求用户信息的小程序端 code

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - userInfo (dict): 用户信息
            - accessToken (str): 用户的访问令牌
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
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

"""
    保存用户资料接口 /save_profile

    请求方法:
        POST

    请求参数:
        - userInfo (dict): 用户信息，包括 nickName 和 avatarUrl
        - accessToken (str): 用户的访问令牌

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - userInfo (dict): 更新后的用户信息
            - message (str): 操作成功信息
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
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

"""
    验证用户的登录状态 /check_session

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌。

    返回值:
        - 成功:
            - success (bool): 请求是否成功。
            - message (str): 提示信息，当前已登录。
            - userInfo (dict): 用户信息。
        - 失败:
            - success (bool): 请求是否成功。
            - message (str): 提示信息，当前未登录。
"""
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

"""
    获取用户的追番列表 /get_user_drama

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - dramas (List): 用户的追番列表
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 提示信息
"""
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

"""
    添加用户的追番 /add_drama

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaInfo (dict): 用户的追番信息

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - message (str): 操作成功信息
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
@app.route('/add_drama', methods=['POST'])
def add_drama():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})

    check = checkCookie(accessToken)
    user_id = check['user_id']
    dramaInfo = data.get('dramaInfo')
    print(user_id, dramaInfo)
    
    sql = """
        INSERT INTO `drama` (
            user_id, drama_name, cover_url, introduction, made_company, playing_platform, 
            is_update, total_number, update_number, watch_number, update_time, 
            love, remark
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
    playing_platform = json.dumps(dramaInfo['playing_platform'])
    update_time = json.dumps(dramaInfo['update_time'])
    
    # 执行插入操作
    lock.acquire()
    try:
        dbcursor.execute(sql, (
            user_id, dramaInfo['drama_name'], dramaInfo['cover_url'], dramaInfo['introduction'], 
            dramaInfo['made_company'], playing_platform, dramaInfo['is_update'], 
            dramaInfo['total_number'], dramaInfo['update_number'], dramaInfo['watch_number'], 
            update_time, dramaInfo['love'], dramaInfo['remark']
        ))
        db.commit()
    finally:
        lock.release()
    
    return jsonify({'success': True, 'message': 'Add drama success'})

"""
    更新用户的追番 /update_drama

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaInfo (dict): 用户的追番信息

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - message (str): 操作成功信息
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
@app.route('/update_drama', methods=['POST'])
def update_drama():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})
    check = checkCookie(accessToken)
    if not check['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})
    user_id = check['user_id']
    dramaInfo = data.get('dramaInfo')
    print(user_id, dramaInfo)
    
    sql = """
        UPDATE `drama` 
        SET 
            introduction = %s, 
            made_company = %s, 
            playing_platform = %s, 
            is_update = %s, 
            total_number = %s, 
            update_number = %s, 
            watch_number = %s, 
            update_time = %s, 
            love = %s, 
            remark = %s 
        WHERE id = %s
    """

    playing_platform = json.dumps(dramaInfo['playing_platform'])
    update_time = json.dumps(dramaInfo['update_time'])
    
    # 执行插入操作
    lock.acquire()
    try:
        dbcursor.execute(sql, (
            dramaInfo['introduction'], 
            dramaInfo['made_company'], 
            playing_platform, 
            dramaInfo['is_update'], 
            dramaInfo['total_number'], 
            dramaInfo['update_number'], 
            dramaInfo['watch_number'], 
            update_time, dramaInfo['love'], 
            dramaInfo['remark'],
            dramaInfo['id']
        ))
        db.commit()
    finally:
        lock.release()
    
    return jsonify({'success': True, 'message': 'Update drama success'})

"""
    删除用户的追番 /delete_drama

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaId (int): 用户的追番信息

    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - message (str): 操作成功信息
        - 失败:
            - success (bool): 请求是否成功 
            - message (str): 错误信息
"""
@app.route('/delete_drama', methods=['POST'])
def delete_drama():
    data = request.get_json()
    accessToken = data.get('accessToken')
    dramaId = data.get('dramaId')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})
    check = checkCookie(accessToken)
    if not check['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})

    print(dramaId)
    
    # 后端删除操作不实际删除，将 user_id 设置为 0， 0 为空用户
    sql = "UPDATE `drama` SET `user_id` = 0 WHERE id = %s"
    val = (dramaId,)
    lock.acquire()
    try:
        dbcursor.execute(sql, val)
        db.commit()
    finally:
        lock.release()
    
    return jsonify({'success': True, 'message': 'Delete drama success'})

"""
    获取默认封面 /get_default_cover

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaName (str): 需要制作封面的番名
    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - coverUrl (str): 封面地址
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
@app.route('/get_default_cover', methods=['POST'])
def get_default_cover():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})
    check = checkCookie(accessToken)
    if not check['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})
    
    imgname = data.get('dramaName')
    coverUrl = out_img(imgname)
    
    return jsonify({'success': True, 'coverUrl': coverUrl})

"""
    AI 生成简介 /auto_jian_jie

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaName (str): 需要生成简介的番名
    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - jianjie (str): 简介
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
@app.route('/auto_jian_jie', methods=['POST'])
def auto_jian_jie():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})
    check = checkCookie(accessToken)
    if not check['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})
    
    dramaName = data.get('dramaName')
    jianjie = ''
    for text in ai_jian_jie(dramaName):
        jianjie += text
        if len(jianjie) > 100:
            break
        print(text, end='')
    
    return jsonify({'success': True, 'jianjie': jianjie})

"""
    从 Agedm 获取番剧信息 /get_drama_info_online

    请求方法:
        POST

    请求参数:
        - accessToken (str): 用户的访问令牌
        - dramaName (str): 需要获取信息的番名
    返回值:
        - 成功:
            - success (bool): 请求是否成功
            - dramaInfo (dict): 番剧信息
        - 失败:
            - success (bool): 请求是否成功
            - message (str): 错误信息
"""
@app.route('/get_drama_info_online', methods=['POST'])
def get_drama_info_online():
    data = request.get_json()
    accessToken = data.get('accessToken')
    if not accessToken:
        return jsonify({'success': False, 'message': 'Missing accessToken'})
    check = checkCookie(accessToken)
    if not check['success']:
        return jsonify({'success': False, 'message': 'Invalid accessToken'})
    
    dramaName = data.get('dramaName')
    result = get_drama_info_from_agedm(dramaName)
    if result['success']:
        return jsonify({'success': True, 'dramaInfo': result['drama_info']})
    
    return jsonify({'success': False, 'message': '未找到相关结果'})

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)