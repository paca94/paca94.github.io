---
title: "DB Charset 비일치로 인한 풀스캔 개선"
search: true
categories:
  - Develop
last_modified_at: 2021-07-07T23:30:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
  - MySQL
description: Charset 불일치로 인한 풀스캔 수정기
article_tag1: MySQL
article_section: MySQL
meta_keywords: MySQL
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
문자열 불일치로 인한 풀스캔 수정기
```

# 문제 발견

1. AWS slowQuery 로그 상에 특정 쿼리가 오래 걸리는 것을 발견함.

# 원인 분석

1. 해당 쿼리문과 테이블을 살펴보면, 풀스캔을 하지 않도록 정상적으로 인덱스가 걸려있고, 해당 인덱스를 조건으로 사용하고 있음.
1. Expain 해본 결과, 아래와 같이 조건 비교시, 다른 charset으로 convert하고 있음.
    ![image](/assets/image/slow_query/convert.png)
1. 따라서, 아래 쿼리문을 통해 charset값이 utf8mb4가 아닌것들을 조회함.
    ```sql
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE,character_set_name,COLLATION_NAME FROM information_schema.`COLUMNS` C
    WHERE table_schema = "db"
    AND character_set_name != 'utf8mb4'
    ```
    ![image](/assets/image/slow_query/charset.png)

# 해결

1. charset이 **utf8/ascii/laten1** 인 것들을 **utf8mb4**로 변환함
1. 풀스캔을 하지 않게 되서 쿼리 동작 속도가 빨라짐
