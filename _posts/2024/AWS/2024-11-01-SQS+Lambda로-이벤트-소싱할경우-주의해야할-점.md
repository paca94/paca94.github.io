---
title: "SQS + Lambda로 이벤트 소싱할경우 주의해야할 점"
search: true
categories:
  - AWS
last_modified_at: 2024-11-01T20:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- AWS
- SQS
- Lambda
description: 낮은 예약된 동시성 사용시 주의해야할 점
article_tag1: AWS
article_section: AWS
meta_keywords: AWS
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
낮은 예약된 동시성 사용시 주의해야할 점
```
---

### 찾아보거나 알게된 배경
비동기 시스템 구성을 위해 서치하다가 알게 되었다.

---
### 요약

1. 내부적으로 이벤트를 가져와서 람다를 호출하기 때문에, 동시성이 낮다면(1~30), SQS 메세지 타임아웃이 먼저 지나서, 해당 메세지가 다시 람다로 처리될 수 있다. ( 즉, 내부적으로 땡겨온 시간부터 타임아웃을 체크할테니 발생하는 문제로 보인다 )
   1. DLQ ( dead letter queue ) 를 사용한다면, 해당 큐로 넘어갈 수 있다.
2. 해당부분을 해결하려면, 아래의 방법중 하나를 사용하면 된다.
   1. SQS 타임아웃을 Lambda 타임아웃보다 5~6배로 지정해서 써야한다
   2. DLQ 설정시, 재시도 횟수를 5이상으로 설정해줘야 한다.

### 참고자료
[https://betterprogramming.pub/lambda-sqs-trigger-and-concurrency-87131dad9a12](https://betterprogramming.pub/lambda-sqs-trigger-and-concurrency-87131dad9a12)
