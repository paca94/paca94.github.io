---
title: "instance Mock method 모킹"
search: true
categories:
  - Python
last_modified_at: 2024-11-02T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Django
- Unittest
description: 객체 method 모킹하기
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
객체 method 모킹하기
```
### 찾아보거나 알게된 배경

테스트 작성하다가 알게되었다.

---
### 요약
아래처럼 instance에 대해 mock으로 만들고, 테스트 인라인에서 method를 patch해주려면 아래처럼 해야한다.

---
### 내용

- split_temp.py
  ```python

  class OriginAny:
    def running(self):
      return "origin_run!"

  class CallingAny:
    def work(self):
      org = OriginAny()
      return org.running()
  ```
- test.py
  ```python
  class AnyMock(MagicMock):
    def __init__(self, *args: any, **kw: any):
      super().__init__(*args, **kw)
      self.mock_add_spec(spec=OriginAny)

  class TestCallingAny_work_메서드_호출시:
    @patch("split_temp.OriginAny", new_callable=AnyMock)
    def test_any(self, mock_origin_any: AnyMock):
      instance = mock_origin_any.return_value
      instance.running.return_value = "mock_run!"
      calling_any = CallingAny()
      result = calling_any.work()

      assert mock_origin_any.mock_calls == [call(), call().running()]
      assert result == "mock_run!"
  ```
