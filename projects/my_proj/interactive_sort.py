"""
交互式排序程序
允许用户输入数据并选择排序算法
"""

from sorting_algorithms import quick_sort, merge_sort, heap_sort, bubble_sort


def get_user_data():
    """获取用户输入的数据"""
    print("请输入要排序的数字，用空格分隔:")
    data_str = input().strip()
    
    try:
        # 尝试将输入解析为数字列表
        data = [int(x) for x in data_str.split()]
        return data
    except ValueError:
        print("输入格式错误，请输入用空格分隔的数字")
        return get_user_data()


def choose_algorithm():
    """让用户选择排序算法"""
    print("\n请选择排序算法:")
    print("1. 快速排序")
    print("2. 归并排序")
    print("3. 堆排序")
    print("4. 冒泡排序")
    
    choice = input("请输入选项 (1-4): ").strip()
    
    if choice not in ['1', '2', '3', '4']:
        print("无效选项，请重新选择")
        return choose_algorithm()
    
    return int(choice)


def main():
    """主程序"""
    print("欢迎使用排序程序!")
    
    # 获取用户数据
    data = get_user_data()
    print(f"\n原始数据: {data}")
    
    # 选择算法
    algorithm_choice = choose_algorithm()
    
    # 执行排序
    algorithms = {
        1: ("快速排序", quick_sort),
        2: ("归并排序", merge_sort),
        3: ("堆排序", lambda x: heap_sort(x.copy())),
        4: ("冒泡排序", bubble_sort)
    }
    
    name, func = algorithms[algorithm_choice]
    
    print(f"\n使用 {name} 进行排序...")
    sorted_data = func(data)
    print(f"排序结果: {sorted_data}")


if __name__ == "__main__":
    main()