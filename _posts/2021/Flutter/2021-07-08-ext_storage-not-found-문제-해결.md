---
title: "ext_storage not found 문제 해결"
search: true
categories:
  - Flutter
last_modified_at: 2021-07-08T08:01:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Flutter
description: module 'ext_storage' not found 해결
article_tag1: Flutter
article_section: Flutter
meta_keywords: Flutter
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
module 'ext_storage' not found 해결
```

# 문제 발생

CS용 어플리케이션 개발 이후, 내부 배포를 위해 TestFlight에 올리려고 헀는데, Archive를 돌릴 때마다, module 'ext_storage' not found에러가 발생했음.  
(해당 에러는 개발모드를 빌드할 때는 발생하지 않았음.)

해당 에러를 검색하고 적용해보니 정상적으로 동작했다.

# 해결방법
xcode에서 `TARGETS->Runner->Deployment Info` 를 보면, IOS 9.0 으로 되어있는데, 11.0으로 변경하면 문제가해결된다.