---
title: "Python Gunicorn multiproessing 멈춤현상"
search: true
categories:
  - Python
last_modified_at: 2022-06-26T18:46:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Djnago
- Gunicorn
description: gunicorn으로 django 실행시, multiprocessing 사용해서 만든 sub process에서 에러 발생시, sub 프로세스가 멈추는 현상.
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
gunicorn으로 multiprocessing.pool을 이용할 때, sub processs에서 에러 발생시, 해당 요청이 프리징이 걸리는 현상에 대한 확인
```

# 발생환경
```
Python 3.6.15
django 2.2
gunicorn 20.x
```

# 현상
gunicorn worker에서 만든 sub process에서 http 요청이 섞여있는 함수를 실행하다가 익셉션 발생시, 만들어진 sub process가 멈춤.
정확히는 Pool에 들어간 작업이 모두 끝나서 pool.terminate() 동작에 들어갔으나, sub process(os.waitpid로 무한정 대기)가 종료되질 않아서 무한정 대기함.


# 현상 발생 조건 확인
sub process에서 `exception.__traceback__`이 반환된다면, 항상 발생한다. ( raise, return 모두 동일함 )

# 해결
sub process에서 try catch로 내부의 모든 익셉션을 잡은 뒤, 해당 익셉션에 대해 Wrapping 클래스를 만들어서 해당 정보를 넣어준 뒤, return 하도록 함.
그리고 `exception.__traceback__`에 대해서는 문자열로 변경하여 반환함.
그 뒤, pool쪽에서 반환된 인스턴스의 타입을 체크하여, 에러인 것이 왔으면, worker process에서 raise하도록 처리함.

example)
```python
import traceback

class MPExceptionWrapper():
    def __init__(self, error_type, error_args, traceback_info):
        this.error_type = error_type
        this.error_args = error_args
        this.traceback_info = traceback_info

# in multi processing function wrapper
# this function called by sub process ( created by worker )
def mp_function_wrapper(function, args):
    try:
        return function(args)
    except BaseException as e:
        return MPExceptionWrapper(type(e), e.args, traceback.format_exc())
```

# 추가 확인
이후, 별도로 확인해본 결과, Python3.6 Python3.7에서 발생함
둘 모두 지원 종료된 버전이므로 별도로 Gunicorn소스 까보며 확인하진 않음.


# 증상 확인용으로 사용했던 코드

```python
def temp(value):
    print(value)
    import requests
    URL = 'https://www.naver.com'
    response = requests.get(URL)
    print(f'{value} / {response.status_code}')
    if value == 5:
        raise Exception('hello')


def runner():
    items = []
    rs = []
    test_set = [
        (temp, (1,)),
        (temp, (2,)),
        (temp, (5,)),
        (temp, (3,)),
        (temp, (4,)),
    ]
    with Pool(2) as pools:
        for (fn, args) in test_set:
            items.append(pools.apply_async(fn, args=args))

        for item in items:
            rs.append(item.get())
```
