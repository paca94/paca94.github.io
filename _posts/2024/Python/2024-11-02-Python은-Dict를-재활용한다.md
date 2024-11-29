---
title: "Python은 Dict를 재활용한다"
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
- CPython
description:
article_tag1: CPython
article_section: CPython
meta_keywords: CPython
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

<!-- ```yaml
환경변수 설정
``` -->

---
### 찾아보거나 알게된 배경
[dict는 언제 리사이즈될까](/python/dict는-언제-리사이즈될까/) 를 찾아보다가 함꼐 알게된 부분

---

### 요약
1. python 에서 dict(`PyDictObject`)가 삭제된다면, 해당 dict는 파이썬 내부의 free_list로 이동한다
2. free_list에는 최대 80(`PyDict_MAXFREELIST`)개까지 저장이 가능하며, 그 개수를 넘어가면 메모리를 해제한다
3. PyDictObject 내부의 PyDictKeysObject는 삭제된다면, 해당 데이터의 크기가 기본 사이즈일 경우, 파이썬 내부의 keys_free_list로 동한다
4. 해당 리스트 또한 최대 80(`PyDict_MAXFREELIST`)개까지 저장 가능하며, 그 개수를 넘어가면 메모리를 해제한다.
5. free_list / keys_free_list의 경우 old gc가 돌 때 메모리에서 해제된다.

```python
>>> d = {}
>>> id(d)
4315419008
>>> del d
>>> d2 = {}
>>> id(d2)
4315419008
>>> d3 = {}
>>> del d2
>>> del d3
>>> d4 = {}
>>> id(d4)
4315419136
>>> d5 = {}
>>> id(d5)
4315419008
```
