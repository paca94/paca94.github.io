---
title: "Django Unittest에서 wraps 옵션을 써보자!"
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
- Django
- Unittest
description: spy 써보기!
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
spy 써보기!
```

---

### 찾아보거나 알게된 배경

테스트 작성시, mock patch를 사용할경우, autospec 옵션을 별도로 설정을 안한다면, 해당 함수 인자가 바뀌어도 테스트 코드 상에서는 문제가 없는 것으로 체크되는 문제가 있어서 해당 옵션을 쓰자고 팀원분과 이야기 하셨었는데, 혼자 잘못 알아듣고 딴거찾다가 우연히 알게 되었다!

전부터 이런식으로 모킹해서 호출여부만 체크하고 싶었는데 있었다.


---
### 요약

> django unittest 기준입니다. pytest의 경우, pytest-mock의 spy를 쓰면 된다! ([Doc](https://pytest-mock.readthedocs.io/en/latest/usage.html#spy))

- patch option에 보면, wraps라는 옵션이 있는데, 모킹된 메서드가 호출될 경우, wraps를 호출하게 해준다고 한다.
- 즉, 호출 여부를 체크하기 위해 모킹할 때, return_value 설정이나, side_effect 설정없이 호출만 체크 할 수 있다.
- 주의사항 : return_value를 지정시, wraps가 동작하지 않는다.
- example
  ```python
  class Simple:
      @staticmethod
      def mock_for(a):
          return a * 100

  class SimpleTest(ServiceTestCase):
      @patch.object(Simple, 'mock_for', wraps=Simple.mock_for)
      def test_wraps는_최고야(self, mock_for: MagicMock):
          rs = Simple.mock_for(1)
          mock_for.assert_called_once_with(1)

          self.assertEqual(rs, 100)
  ```

- wraps가 너무 반복적이다! 따라서, 추상화를 시켜서 더 간단하게 쓰자!
  ```python
  def patch_object_wraps(obj: Type, method_name: str):
      return patch.object(obj, method_name, wraps=getattr(obj, method_name))

  class Simple:
      @staticmethod
      def mock_for(a):
          return a * 100

  class SimpleTest(ServiceTestCase):
      @patch_object_wraps(Simple, 'mock_for')
      def test_wraps는_최고야(self, mock_for: MagicMock):
          rs = Simple.mock_for(1)
          mock_for.assert_called_once_with(1)

          self.assertEqual(rs, 100)
  ```
