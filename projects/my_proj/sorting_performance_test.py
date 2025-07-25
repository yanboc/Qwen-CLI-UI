"""
排序算法性能比较
"""

import random
import time
from sorting_algorithms import quick_sort, merge_sort, heap_sort, bubble_sort


def performance_test():
    """测试不同数据规模下各排序算法的性能"""
    sizes = [100, 500, 1000, 2000]
    
    print("排序算法性能比较")
    print("=" * 50)
    print(f"{'数据规模':<10} {'快速排序':<15} {'归并排序':<15} {'堆排序':<15} {'冒泡排序':<15}")
    print("-" * 50)
    
    for size in sizes:
        # 生成随机测试数据
        test_data = [random.randint(1, 10000) for _ in range(size)]
        
        # 测试快速排序
        start_time = time.time()
        quick_sort(test_data.copy())
        quick_time = time.time() - start_time
        
        # 测试归并排序
        start_time = time.time()
        merge_sort(test_data.copy())
        merge_time = time.time() - start_time
        
        # 测试堆排序
        start_time = time.time()
        heap_sort(test_data.copy())
        heap_time = time.time() - start_time
        
        # 测试冒泡排序（只在小数据集上测试）
        bubble_time = "N/A"
        if size <= 1000:
            start_time = time.time()
            bubble_sort(test_data.copy())
            bubble_time = time.time() - start_time
        
        print(f"{size:<10} {quick_time:<15.6f} {merge_time:<15.6f} {heap_time:<15.6f} {bubble_time:<15}")
        

def correctness_test():
    """验证排序算法的正确性"""
    print("\n排序算法正确性测试")
    print("=" * 30)
    
    # 测试用例
    test_cases = [
        [],  # 空数组
        [1],  # 单元素数组
        [3, 1, 4, 1, 5, 9, 2, 6, 5, 3],  # 有重复元素
        [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],  # 逆序数组
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  # 已排序数组
        [-3, -1, -4, -1, -5, 9, 2, 6, -5, 3]  # 包含负数
    ]
    
    algorithms = [
        ("快速排序", quick_sort),
        ("归并排序", merge_sort),
        ("堆排序", lambda x: heap_sort(x.copy())),
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"测试用例 {i+1}: {test_case}")
        expected = sorted(test_case)
        
        for name, func in algorithms:
            result = func(test_case.copy())
            status = "✓" if result == expected else "✗"
            print(f"  {name}: {result} {status}")
        print()


if __name__ == "__main__":
    correctness_test()
    performance_test()