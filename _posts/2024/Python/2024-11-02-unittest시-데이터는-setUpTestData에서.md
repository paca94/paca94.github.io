---
title: "unittest 시, 데이터는 setUpTestData에서!"
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
description: 유닛테스트 퍼포먼스 약간 향상
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
유닛테스트 퍼포먼스 약간 향상
```

---
### 찾아보거나 알게된 배경


테스트 러닝타임이 너무 오래걸려서, 해당 시간을 줄일 방법이 없을까 하다가 데이터를 각 테스트 method가 아닌 setUpTestData에서 만들면 되겠다 싶어서 진행해봤다.

---
### 요약
**공통되는 데이터를 만들 때는 setUpTestData에서 데이터를 만들어주는게 훨씬 낫다**

---
### 내용
1. 기존에 setup이나 테스트 안에서 데이터 만들어주는 부분이 있으면, 쿼리시간때문에 테스트시간이 길어진다 가정하고 있었음
2. 하나는 기존대로 test 내에서 각 데이터들을 만들어주게 유지
3. 하나는 기존에서 데이터를 만들어주는 부분에 대해서 setupTestData로 빼도록 함
4. 각 동일한 테스트에 대해 10개까지 늘린 후(복붙), 테스트 속도 비교 진행
  > 로컬에서 실행시, 2.9s -> 1.9s 로 감소

- before code:
  ```python
    def test_asdf(self):
      item = generate_any_item()
  ```
- after code:
  ```python
    @classmethod
    def setUpTestData(cls):
      cls.item = generate_any_item()

    def test_asdf(self):
      ...
  ```

### 참고자료

---

직접해봄
