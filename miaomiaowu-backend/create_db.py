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

    dbcursor.execute("CREATE TABLE IF NOT EXISTS `user_level`  (\
        `id` int NOT NULL AUTO_INCREMENT,\
        `user_id` int NOT NULL,\
        `experience` int NOT NULL DEFAULT 0 COMMENT '经验值',\
        `ikun_level` int NOT NULL DEFAULT 1 COMMENT '1 初级小黑子，2 中级小黑子，3 高级小黑子， 4 哎呦你干嘛',\
        PRIMARY KEY (`id`) USING BTREE\
        ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;"
    )

    # platformList: ['腾讯视频', '哔哩哔哩', '爱奇艺', '优酷视频', '其它']
    # updateModes: ['连载中', '已完结', '未更新']
    # updateTime: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    # 需要根据 update_number 和 set_time 以及 update_time 进行判断当前时间更新到哪一集
    dbcursor.execute("CREATE TABLE IF NOT EXISTS `drama`  (\
        `id` int NOT NULL AUTO_INCREMENT,\
        `user_id` int NOT NULL,\
        `drama_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,\
        `made_company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,\
        `playing_platform` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '2' COMMENT '存数组，例[0, 3] 于腾讯视频和优酷视频播放',\
        `is_update` int NOT NULL COMMENT '0 已完结，1 连载中，2未更新',\
        `total_number` int NOT NULL DEFAULT 0,\
        `update_number` int NOT NULL DEFAULT 0,\
        `set_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\
        `update_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '存数组， 例[1, 6] 每周二周日更新',\
        `love` float NOT NULL DEFAULT 0,\
        `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,\
        PRIMARY KEY (`id`) USING BTREE\
        ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;"
    )

