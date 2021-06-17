var store = [{
        "title": "푸시 시스템 개선",
        "excerpt":"모이고 서버 푸시 개선에 대한 포스팅 작성 이유 2019년 트위니에서 회사 시무식에서 이벤트로 모이고 그룹방에서 퀴즈에 대해 정답을 입력하는 이벤트를 진행했다. 해당 이벤트를 진행하던 도중 모이고 서버가 터지는 일이 발생했다. 심지어 모이고 서버는 Erlang으로 작성되어있다. 왜 이런 일이 발생한건지, 원인은 무엇이고 어떻게 이것을 개선했는지에 대한 글이다. 서버가 왜 터졌는가 서버가...","categories": ["MoiGo"],
        "tags": [],
        "url": "/moigo/%EB%AA%A8%EC%9D%B4%EA%B3%A0-%ED%91%B8%EC%8B%9C-%EA%B0%9C%EC%84%A0/",
        "teaser": null
      },{
        "title": "푸시 스로틀링",
        "excerpt":"모이고 푸시 스로틀링을 통한 TOPIC_RATE_EXCEEDED 에러 방지 단일 기기에 대한 최대 메시지 속도 FCM 에러 목록 모이고 기능 개발도중 FCM에 TOPIC RATE EXCEEDED 에러가 발생했다. 해당 에러의 발생 사유는 아래와 같다. 특정 주제의 구독자에게 전달되는 메시지 비율이 너무 높습니다. 이 주제로 보내는 메시지 수를 줄이세요. 바로 다시 보내도록 시도해서는 안...","categories": ["MoiGo"],
        "tags": [],
        "url": "/moigo/%ED%91%B8%EC%8B%9C-%EC%8A%A4%EB%A1%9C%ED%8B%80%EB%A7%81/",
        "teaser": null
      },{
        "title": "Twinny Helper 앱 제작기",
        "excerpt":"사내 비즈박스 도입에 따른, TwinnyHelper 앱 제작기 총 개발 소요시간 : 약 20시간 올해 초, 사내 그룹웨어가 도입되었다. 도입된 그룹웨어는 비즈박스고, 해당 그룹웨어를 통해서 출퇴근기록, 휴가신청, 회의실예약 등이 가능하다. 이전에, slack을 이용해서, 출근 기록을 기록하고, 해당 기록을 기반으로 회사 식대를 계산하는 Bot을 만들어서 사용했었는데, 해당 비즈박스의 API들을 사용하여, Bot의 기능을...","categories": ["Flutter"],
        "tags": ["Flutter"],
        "url": "/flutter/Twinny-Helper-%ED%9B%84%EA%B8%B0/",
        "teaser": null
      },{
        "title": "Auth와 User 분리",
        "excerpt":"하나의 유저 계정에 여러 로그인 방법 추가 설계 고민 요즘은 OAuth2를 이용하여 회원가입/로그인하는 서비스들이 매우 많아졌다. 해당 방법으로 로그인을 하다 보면, 동일한 계정에 대해 구글계정으로 로그인 등 여러가지 추가 로그인 방법이 있으면 좋겠다고 생각이 들 때가 있고, 기존에 사용하던 연동된 계정을 사용하지 않게 되는 경우도 발생한다. 따라서, 하나의 유저 계정에...","categories": ["Thinking"],
        "tags": [],
        "url": "/thinking/Auth%EC%99%80-User-%EB%B6%84%EB%A6%AC/",
        "teaser": null
      },{
        "title": "Redis 장애",
        "excerpt":"Redis 장애 대응 14일 오후 2시 36분 ~ 38분 사이에 서버에 장애가 발생했다. 장애 포인트는 AWS Elasticache Redis였고, 36분부터 문제가 생겨 38분에 복구되었다. 장애가 발생한 이유는 무엇이고, 어떻게 개선할 것인지에 대해 생각했던 것을 기록하는 글이다. 장애가 2분이나 유지된 이유 Redis 서비스에서 Primary 1대 Replica 1대를 사용하고 있는데, FailOver 설정을 해두지...","categories": ["MoiGo"],
        "tags": ["MoiGo, Erlang, AWS, Redis"],
        "url": "/moigo/Redis-%EC%9E%A5%EC%95%A0/",
        "teaser": null
      },{
        "title": "FCM을 사용하면서 발생한 문제들",
        "excerpt":"FCM을 사용하면서 겪은 문제와 문제를 해결했던 방법. FCM 을 사용하면서 겪은 문제와 해당 문제들을 어떻게 해결하였고, 앞으로 어떤 방식으로 사용을 해야할 지에 대해 고민했던 것들에 대한 글이다. 어디까지나 필자 개인의 경험을 기반으로 한 글이다. 1. FCM Push TOPIC_RATE_EXCEEDED error 하나의 토픽에 많은 양의 데이터를 빠르게 전송하면, 해당 에러가 발생하며, 푸시를...","categories": ["Develop"],
        "tags": ["FCM"],
        "url": "/develop/FCM-%EC%82%AC%EC%9A%A9%ED%95%98%EB%A9%B4%EC%84%9C-%EB%B0%9C%EC%83%9D%ED%95%9C-%EB%AC%B8%EC%A0%9C%EB%93%A4/",
        "teaser": null
      }]
