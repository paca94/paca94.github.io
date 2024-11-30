---
title: "Python(Django) Unittest Performance 개선 (with. seeds)"
search: true
categories:
  - Python
last_modified_at: 2024-11-30T00:00:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Django
- Unittest
description: 테스트가 계속해서 느려진다! 왜그럴까? (600s -> 70s)
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
테스트가 계속해서 느려진다! 왜그럴까? (600s -> 70s)
```

### 찾아보거나 알게된 배경

테스트 개수가 더 늘어나고 있고, 테스트시간이 다시 10분씩 걸리게 되어서 개선방법을 찾아봤다.

---

### 요약

- 느렸던 이유는 각 테스트가 돌 때마다 고정데이터(seed data)를 insert 해서 였음. (500개의 테스트라면 500번 데이터를 삽입함)
- 고정 데이터의 경우, unittest fixtures 에 명시하는것이 아닌, test_runner에서 데이터베이스 초기화(setup_databases) 이후 넣으면 된다. ( db 연결을 끊기 전에 데이터를 지워줄 수 있지만, 고정데이터 이므로, 따로 설정하진 않음 )
  ```python
  # Example

  class TestRunnerBase:
      def __init__(self, *args, **kwargs):
          super().__init__(*args, **kwargs)
          # test db는 항상 존재하는 상황에서 테스트가 진행되므로, keepdb는 항상 True로 해놓는다.
          self.keepdb = True

  class CustomTestRunner(TestRunnerBase, runner.DiscoverRunner):
      # 아래 메서드를 override 해줬음
      def setup_databases(self, **kwargs) -> list[tuple]:
          result: list[tuple] = super().setup_databases(**kwargs)
          GlobalTestSetUpManager.run()
          return result

  class CustomXMLTestRunner(TestRunnerBase, XMLTestRunner):
      # 아래 메서드를 override 해줬음
      def setup_databases(self, **kwargs) -> list[tuple]:
          result: list[tuple] = super().setup_databases(**kwargs)
          GlobalTestSetUpManager.run()
          return result

  class GlobalTestSetUpManager:
      _is_seed_setup: bool = False

      # seeds 파일 내의 데이터를 불러옴
      @classmethod
      def setup_seeds(cls):
          if cls._is_seed_setup:
              return
          cls._is_seed_setup = True
          call_command(
              "loaddata",
              settings.SEEDS,
              format="json",
          )

      @classmethod
      def run(cls):
          cls.setup_seeds()
  ```
- 해당 개선으로 jenkins 에서 환경세팅을 제외한 테스트시간이 70초로 줄었다.

---

### 테스트 해봤던 가설
- 첫번째 가설: 데이터를 넣는데 시간이 오래걸린다
  - setUpTestData ~ TearDown까지 걸리는 시간을 측정해봄
    - 실험을 잘못하긴 했었는데, 시간 차이가 거의 없었음
  - 결론: 아님. 시간 차이가 거의 나질 않음
- 두번째 가설: 커넥션을 너무 자주맺어서 해당 시간이 오래걸린다
  - django에서 db connection/close 를 하는 부분을 찾아서 걸린시간을 측정해봄
  - 약 500회정도 커넥션을 맺고 끊었지만, 총시간은 10초도 걸리지 않았다
