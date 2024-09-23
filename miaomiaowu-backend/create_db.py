from dotenv import load_dotenv
import pymysql
import os

load_dotenv()
# 从配置文件中读取数据
MYSQL_DATABASE_HOST = os.getenv("MYSQL_DATABASE_HOST")
MYSQL_DATABASE_USER = os.getenv("MYSQL_DATABASE_USER")
MYSQL_DATABASE_PASSWORD = os.getenv("MYSQL_DATABASE_PASSWORD")
if not MYSQL_DATABASE_PASSWORD:
    exit()

def create_database():
    # 创建数据库连接
    db = pymysql.connect(
        host=MYSQL_DATABASE_HOST,
        user=MYSQL_DATABASE_USER,
        password=MYSQL_DATABASE_PASSWORD, # type: ignore
        charset="utf8mb4"
    )
    dbcursor = db.cursor()
    # 创建数据库
    dbcursor.execute("CREATE DATABASE IF NOT EXISTS `miao_miao_wu`")
    # 选择数据库
    dbcursor.execute("use miao_miao_wu")

    # 创建数据表
    dbcursor.execute("CREATE TABLE IF NOT EXISTS `users`  (\
        `id` int NOT NULL AUTO_INCREMENT,\
        `openid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,\
        `session_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
        `latest_login_time` datetime NULL DEFAULT NULL,\
        `status` int NOT NULL DEFAULT 1 COMMENT '1 正常，0 注销，2 封禁',\
        PRIMARY KEY (`id`) USING BTREE\
        ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;"
    )

    dbcursor.execute("CREATE TABLE IF NOT EXISTS `access_token`  (\
        `id` int NOT NULL AUTO_INCREMENT,\
        `user_id` int NOT NULL,\
        `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `set_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
        PRIMARY KEY (`id`) USING BTREE\
        ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;"
    )

