from datetime import datetime, timedelta

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

# 示例数据
set_time = "2024-09-08 10:00:00"
update_number = 110
update_days = [0, 3, 6]  # 周一、周四和周日
current_time = "2024-09-25 00:00:00"  # 周三

# 计算当前的更新集数
current_update_number = calculate_updated_episodes(set_time, update_number, update_days, current_time)
print("当前更新到了第几集:", current_update_number)