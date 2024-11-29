---
title: "Github Action에 run에서 환경변수 설정하기"
search: true
categories:
  - Github
last_modified_at: 2024-11-01T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Github
- GithubAction
description: 환경변수 설정
article_tag1: GithubAction
article_section: GithubAction
meta_keywords: GithubAction
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
환경변수 설정
```

---

### 찾아보거나 알게된 배경
일부 환경변수 값을 action run 스크립트 돌리는 도중에 추가하고 싶어서 찾아봤다.

---

### 요약

아래처럼 하면 된다.

```python
ANY_VAR="hello_world!"
echo "any_var=$ANY_VAR" >> "$GITHUB_ENV"
```
