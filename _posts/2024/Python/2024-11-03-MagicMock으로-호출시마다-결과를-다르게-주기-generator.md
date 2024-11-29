---
title: "MagicMock으로 호출시마다 결과를 다르게 주기 (with generator)"
search: true
categories:
  - Python
last_modified_at: 2024-11-03T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Unittest
description: generator 활용하기
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
generator 활용하기
```
### 찾아보거나 알게된 배경

테스트 작성하다가 알게되었다.

---
### 요약
`~.side_effect`에 리스트로 반환할 값들을 할당해주면 된다.

---
### 내용
- 만약, side_effect에 크기 2를 가진 iterator를 썼다면, 그 이후 요청부터는 StopIteration이 발생한다.
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
  # 위 예제 수정

  class TestCallingAny_work_메서드_호출시:
      @patch("split_temp.OriginAny", new_callable=AnyMock)
      def test_any(self, mock_origin_any: AnyMock):
          instance = mock_origin_any.return_value
          instance.running.side_effect = ["mock_run!", "mock_run2!"]
          calling_any = CallingAny()
          result = calling_any.work()
          result2 = calling_any.work()

          assert mock_origin_any.mock_calls == [call(), call().running(), call(), call().running()]
          assert result == "mock_run!"
          assert result == "mock_run2!"
  ```
