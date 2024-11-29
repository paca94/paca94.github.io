---
title: "Args + Kwargs 섞어쓰기"
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
description: 될까? 되네!
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
될까? 되네!
```

---
### 찾아보거나 알게된 배경
되나 싶어서 해봤는데 됐다!

---
### 요약

```python
def hello_world(name: str, *, echo_size: int = 4):
	for _ in range(echo_size):
		print(f"hello world! {name}")

hello_word("JihwanKim")
hello_word("JihwanKim", echo_size=1)
```

---
### 참고자료
해봤습니다
