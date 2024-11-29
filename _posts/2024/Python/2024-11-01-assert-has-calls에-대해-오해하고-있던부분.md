---
title: "assert has calls에 대해 오해하고 있던부분"
search: true
categories:
  - Python
last_modified_at: 2024-11-01T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Unittest
description: 어.. 실패해야하는데, 왜 성공하지?
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
어.. 실패해야하는데, 왜 성공하지?
```

---
### 찾아보거나 알게된 배경

호출이 분명히 달라졌는데, 테스트가 깨지지 않아서 찾아봤다.

---
### 요약
assert_has_calls() method는 순서까지만 보장해주고 호출이 인자로 넘긴것과 일치하는지에 대해서는 체크해주지 않는다.


---
### 내용
- assert_has_calls() 테스트
  ```python
  def temp_origin(v):
    return f"12345 {v}"

  @patch("temp_origin", wraps=temp_origin)
  def test_asdf(mock_temp: MagicMock):
    temp_origin(1)
    temp_origin(2)
    temp_origin(3)

    # 통과!
    mock_temp.assert_has_calls([call(1), call(2), call(3)])

    # 통과!
    mock_temp.assert_has_calls([call(1)])

    # 통과!
    mock_temp.assert_has_calls([call(2)])

    # 통과!
    mock_temp.assert_has_calls([call(3)])

    # 통과!
    mock_temp.assert_has_calls([call(1), call(3)])

    # 통과!
    mock_temp.assert_has_calls([call(2), call(3)])

    # 통과!
    mock_temp.assert_has_calls([call(1), call(2)])

    # 실패!
    mock_temp.assert_has_calls([call(3), call(2)])
  ```
- 따라서, 명확한 체크를 하려면, 아래처럼 사용해야 한다.
  ```python
  def temp_origin(v):
    return f"12345 {v}"

  @patch("temp_origin", wraps=temp_origin)
  def test_asdf(mock_temp: MagicMock):
    temp_origin(1)
    temp_origin(2)
    temp_origin(3)
    assert mock_temp.mock_calls == [call(1), call(2), call(3)]
  ```

### 참고자료
