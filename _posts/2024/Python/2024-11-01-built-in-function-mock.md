---
title: "built in function mock (with.open method)"
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
description: 빌트인 함수 mock
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
빌트인 함수 mock
```

---


### 찾아보거나 알게된 배경

배치 시스템을 작성하던 도중 이메일을 전송한다 했을 때 이메일 템플릿 파일을 열어야 하는데, 굳이 열지 않아도 될 방법이 있을까 해서 찾아봤다.

---
### 요약

- with open(~): 에서 파일을 읽으면 read_data에 해당하는 데이터들이 반환된다!
```python
with patch(
      "template_opener.open",
      mock_open(read_data="hello world!"),
    ) as mock_file:
  result = template_opener()

  mock_file.assert_called_once_with(
              f"assets/templates/email.html", encoding="utf8"
          )
  assert result == "hello world!"

def template_opener():
	with open("assets/templates/email.html", encoding="utf8") as file:
    return "".join(f.readlines())

```
