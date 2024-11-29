---
title: "Python Unittest Performance 개선 (with. hashlib)"
search: true
categories:
  - Python
last_modified_at: 2024-11-29T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python, Unittest
description: Pycharm Profile 기능을 활용하여, 유닛테스트 속도 개선
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
Pycharm Profile 기능을 활용하여, 유닛테스트 속도 개선
```

### 찾아보거나 알게된 배경

---

faker사용시, 도메인을 동일하게 설정하고, email 호출하여 랜덤 생성시, 중복되는 문제가 있어서 관련 메서드를 작성하고 있었는데, 너무 느려서 확인해봤다.

### 요약

---

- 테스트 데이터를 만들기 위해 UserFactory를 호출하는데, 비밀번호 생성을 위해 `django.contrib.auth.hashers.make_password`를 호출하고 있음.
- `django.contrib.auth.hashers.make_password`는 내부적으로 `hashlib.pbkdf2_hmac`를 호출하고 있었고, 해당 메서드가 사용시간의 80%를 점유함
- factory에서 필요한 상황이 아니라면, make_password를 호출하지 않도록 개선.
- 프로파일 결과에서 해당 메서드가 오래걸리는것을 확인


---



- Pycharm Profile
![profile](/assets/image/2024/1129/profile.png)


- UserFactory 에서 옵션을 통해, make_password 호출 여부를 결정할 수 있도록 개선
- 개선 결과
  | stage   | before  | after     |
  | ------- | ------- | --------- |
  | local   | 1m33sec | 23sec     |
  | jenkins | 11min   | 8min 7sec |
