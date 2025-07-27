"""
多种排序算法的实现
包括快速排序、归并排序和堆排序
"""

def quick_sort(arr):
    """
    快速排序算法
    时间复杂度：平均 O(n log n)，最坏 O(n^2)
    空间复杂度：O(log n)
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)


def merge_sort(arr):
    """
    归并排序算法
    时间复杂度：O(n log n)
    空间复杂度：O(n)
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)


def merge(left, right):
    """归并两个已排序的数组"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result


def heap_sort(arr):
    """
    堆排序算法
    时间复杂度：O(n log n)
    空间复杂度：O(1)
    """
    def heapify(arr, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < n and arr[left] > arr[largest]:
            largest = left
        
        if right < n and arr[right] > arr[largest]:
            largest = right
        
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            heapify(arr, n, largest)
    
    n = len(arr)
    
    # 构建最大堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # 逐个提取元素
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr


def bubble_sort(arr):
    """
    冒泡排序算法（用于对比）
    时间复杂度：O(n^2)
    空间复杂度：O(1)
    """
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr


# 测试代码
if __name__ == "__main__":
    import random
    import time
    
    # 生成测试数据
    test_data = [random.randint(1, 1000) for _ in range(20)]
    print("原始数据:", test_data)
    
    # 测试快速排序
    start_time = time.time()
    sorted_data = quick_sort(test_data.copy())
    end_time = time.time()
    print("快速排序结果:", sorted_data)
    print("快速排序耗时:", end_time - start_time, "秒")
    
    # 测试归并排序
    start_time = time.time()
    sorted_data = merge_sort(test_data.copy())
    end_time = time.time()
    print("归并排序结果:", sorted_data)
    print("归并排序耗时:", end_time - start_time, "秒")
    
    # 测试堆排序
    start_time = time.time()
    sorted_data = heap_sort(test_data.copy())
    end_time = time.time()
    print("堆排序结果:", sorted_data)
    print("堆排序耗时:", end_time - start_time, "秒")
    
    # 测试冒泡排序（仅用于小数据集）
    if len(test_data) <= 50:
        start_time = time.time()
        sorted_data = bubble_sort(test_data.copy())
        end_time = time.time()
        print("冒泡排序结果:", sorted_data)
        print("冒泡排序耗时:", end_time - start_time, "秒")