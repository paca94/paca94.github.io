---
title: "AWS Lambda!"
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
- Lambda
description: 람다에 대해 알아보자
article_tag1: AWS
article_section: AWS
meta_keywords: AWS
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
람다에 대해 알아보자
```
---

---
### 찾아보거나 알게된 배경


Lambda가 어떻게 동작하는지 그리고 동시성이 무엇을 의미하는지 궁금해서 찾아봤다.


---
### 요약

1. 람다 동시성
   1. 람다의 동시성 계산법은 요청당 걸리는 평균 시간이 0.1초라고 했을 때, 초당 20회가 요청되면, 필요한 동시성이 2가 된다. ( 0.1 * 20 = 2)
   2. 동일한 순간에 여러개의 요청을 하는것보다, 약간의 텀을 두고 요청하는게 기존에 실행된 것들을 재활용하기 때문에 더 좋다고 한다.
   3. 기본적으로 람다 최대 동시성은 1000이다. 만약 동시성이 최대가 된다면, 1분마다 버스트 동시성이 500개씩 선형적으로 추가할당된다. (서울리전은 최대 버스트 동시성이 1000이다 )
   4. 최대 동시성을 프로비저닝(미리 띄워놓음)을 하거나 제한할 수 있다.
      1. [Provisioned Concurrency / Reserved Concurrency](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/configuration-concurrency.html) 설명
      2. [프로비저닝된 람다 AWS 블로그 설명](https://aws.amazon.com/ko/blogs/korea/new-provisioned-concurrency-for-lambda-functions/)
2. 람다 요청시 실행되는 인스턴스는 한번에 하나의 요청만 처리한다. 해당 요청 처리가 완료되면, 그 뒤에 새로운 요청을 받는다
3. 람다는 콜드스타트가 존재한다.
  1. 현재는 과거와 다르게 클라우드 왓치에 로그가 남을 때, 콜드스타트라면 콜드스타트에 걸린 시간(Init Duration)이 함께 기록된다.
4.  람다 동작방식은 아래 영상 시작구간부터 확인하면, 잘 설명해준다. 요약: 요청시, 사용가능한 람다 인스턴스(?)가 없으면 새로띄우고 놀고있는 인스턴스가 있으면 기존에 돌던곳에 요청함. 만약, 그렇지 않다면 새로운 람다 인스턴스가 실행되며, 동시성이 증가함.
  [https://youtu.be/0PRjqEQ2J3g?t=298](https://youtu.be/0PRjqEQ2J3g?t=298)
1. 람다에서 DB 커넥션을 맺어 사용할 경우, connection pool을 1로 해야한다. 아래영상 참고!
  - [RDS Reverse Proxy](https://docs.aws.amazon.com/ko_kr/AmazonRDS/latest/UserGuide/rds-proxy.html)를 사용해도 된다!
  - [https://youtu.be/0PRjqEQ2J3g?t=1568](https://youtu.be/0PRjqEQ2J3g?t=1568)

### 생각
- 인증 Lambda를 보고 해본 생각
  - AS IS
    - 람다 핸들러 함수에서 요청마다 커넥션을 새로 맺고, 종료시 끊는다.
  - TO BE
    - 함수 영역 밖에서 커센션을 만들어놓고 해당 커넥션을 사용한다.
  - 차이점
    - 기존 요청시마다 커넥션 맺기 / 정보요청 / 끊기 순으로 이루어져있다.
    - 변경한다면, 커넥션 맺기에 대한 동작이 해당 람다 초기화가 이루어질때만 발생하며, 요청시 정보요청만 일어나게 된다.

---
### 참고자료

- [AWS Lambda 내부 동작 방식 및 활용 방법 자세히 살펴보기- 김일호 솔루션즈 아키텍트 매니저(AWS)](https://www.youtube.com/watch?v=0PRjqEQ2J3g&ab_channel=AmazonWebServicesKorea)
- [Lambda 개념](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/gettingstarted-concepts.html)
