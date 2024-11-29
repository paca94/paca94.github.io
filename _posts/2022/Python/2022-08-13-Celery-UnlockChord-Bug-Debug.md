---
title: "Celery UnlockChord Bug Debug"
search: true
categories:
  - Python
last_modified_at: 2022-08-13T16:22:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python
- Celery
description: Celery 5.2.7에서 db를 redis가 아닌 것을 사용할 경우, unlock_chord 에러가 무한루프로 발생하는 버그 디버그
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
Celery 5.2.7에서 db를 redis가 아닌 것을 사용할 경우, unlock_chord 에러가 무한루프로 발생하는 버그 디버그
```


# 서문
celery에서 db를 redis가 아닌 다른 것으로 지정하고 (mysql), chord를 호출할 경우, 2개가 초과되는 task들이 사라지는 현상이 발생했다.
( 결과를 받는 부분에선 모두 가지고 있는데, 실제로 task가 실행되는 것은 2개다. )

> 해당 버그는 5.3.0에서 수정되었다.

# ENV
```
python 3.10
celery 5.2.7
```

# celery - chain, group, chord 란?
## chain
함수 합성같은 거라고 보면 된다. ( method chaining 해서 사용 )
```python
def a(input):
    return input
def b(input_a, input_b):
    return input_a, input_b
chain(a.s(1), b.s(2)).apply_async()
# result -> (1, 2)

```
위를 실행한다면, a method가 실행된 결과가 b method의 args의 앞으로 붙는다.
즉,b(a(1), 2)처럼 실행이 된다.
( 위에서 chain 부분은 (a.s(1) | b.s(2)).apply_async() 와 같다. `|` 는 chain을 의미한다. )

## group
여러가지 작업을 병렬로 돌릴 수 있게 해주는 것이라고 보면 된다.
```python
def a(input):
    return input
(group(a.s(current_input)) for current_input in range(10)).apply_async()
```
위를 실행한다면, a method가 celery의 task로 생성되어 각 celery에서 실행되게 된다. ( 정확히는 메세지가 메세지 큐로 던져진다. )
만약, 3대의 celery worker가 실행중이라면, 어디서 실행될지 모르지만, 나눠서 a(0), a(1), a(2), a(3) ... a(9) 까지 각각의 워커에서 실행되게 된다.

## chord
group과 chain을 합성시킨 것이라고 보면 된다. 만약, group + chain으로 쓴다면, 자동으로 chord로 승격시킨다.
```python
def a(input):
    return input
def after_run(results, input):
    reutrn results, input
chord(
    group(a.s(idx) for idx in range(10)), after_run.s("hello?")
).apply_async()
```
만약, 위의 코드를 실행하게 된다면, celery는 group에 대한 task를 실행시켜서, 메세지를 메세지 큐에 던진다. ( 10개의 메세지 전달 )
이후, 만약 backend 를 db로 쓴다면, chord가 끝났을 때를 위한 unlock_chord 메세지를 큐에 던진다. ( 1개의 메세지 전달 ) ( redis 를 썼을 때랑 동작이 조금 다르다. 해당부분은 별도로 체크 안했다. )
앞의 10개의 메세지가 모두 처리된다면, unlock_chord가 처리되면서 after_run이 실행된다.
after_run은 `after_run([0,1,2,3,4,5,6,7,8,9], "hello?")` 로 실행된다.

group + chain은 chord로 승격되며, 아래의 두개 코드는 위의 예제와 동일한 의미를 지닌다.
```python
(
    group(a.s(idx) for idx in range(10)) | after_run.s("hello?")
).apply_async()
```

# 왜 이런 문제가 발생했는가?
## in python ( normal case )
결과를 먼저 이야기하자면, zip method가 lazy_evaluation 때문이라서 발생한 일이다.
만약, 아래의 python 코드를 실행했을 때 결과가 어떨것같은가 ?
```python
>>> t = [1,2,3]
>>> t1 = [4,5,6]
>>> zt = zip(t, t1)
>>> t1.pop()
6
>>> list(t1)
```

위 코드의 결과값은 `[(1,4), (2,5)]` 로 나온다. 즉, zip하는 두개의 리스트에 대한 길이가 맞지 않아도 아무런 에러를 일으키지 않고, lazy evaluation 이기 때문에, 평가되기 전에 해당 변수로 다른 처리를 한다면, 영향을 끼친다.

## in celery
아래는 canvas.py -> _chord.run 메서드이다.
아래의 코드는 chord 가 실행되면, 몇가지 method를 거쳐 실행되게 된다.
```python
def run(self, header, body, partial_args, app=None, interval=None,
        countdown=1, max_retries=None, eager=False,
        task_id=None, **options):
    app = app or self._get_app(body)
    group_id = header.options.get('task_id') or uuid()
    root_id = body.options.get('root_id')
    options = dict(self.options, **options) if options else self.options
    if options:
        options.pop('task_id', None)
        body.options.update(options)

    bodyres = body.freeze(task_id, root_id=root_id)

    # Chains should not be passed to the header tasks. See #3771
    options.pop('chain', None)
    # Neither should chords, for deeply nested chords to work
    options.pop('chord', None)
    options.pop('task_id', None)

    header_result_args = header._freeze_group_tasks(group_id=group_id, chord=body, root_id=root_id)

    if header.tasks:
        app.backend.apply_chord(
            header_result_args,
            body,
            interval=interval,
            countdown=countdown,
            max_retries=max_retries,
        )
        header_result = header(*partial_args, task_id=group_id, **options)
    # The execution of a chord body is normally triggered by its header's
    # tasks completing. If the header is empty this will never happen, so
    # we execute the body manually here.
    else:
        body.delay([])
        header_result = self.app.GroupResult(*header_result_args)

    bodyres.parent = header_result
    return bodyres
```
위 메서드에서 해당 task들이 2개만 남고 나머지는 사라지는 현상이 어디서 생기는지에 대해 디버깅해봤는데, 해당 지점이 `app.backend.apply_chord` method를 호출하는 시점이었다.

아래는 해당 부분에서 호출되는 celery/backends/base.py 에서 Backend class의 apply_chord 메서드이다.
```python
def apply_chord(self, header_result_args, body, **kwargs):
    self.ensure_chords_allowed()
    header_result = self.app.GroupResult(*header_result_args)
    self.fallback_chord_unlock(header_result, body, **kwargs)
```
위 method를 보면, 이상할 부분은 없지만, 실제로 문제가 되었던 부분은 `header_result = self.app.GroupResult(*header_result_args)` 호출이었다.
해당 부분에서 내부적으로 lazy evaluation으로 묶어놓은 것이 `GroupResult`에서 평가되며 task들이 모두 사라져버렸다.
왜 이런일이 발생했는가는 다른 코드에서 확인 할 수 있었다.

아래는 run method에서 header._freeze_group_tasks가 호출되었을 때 실행되는 method이다.
canvas.py -> group._freeze_group_tasks
```python
def _freeze_group_tasks(self, _id=None, group_id=None, chord=None,
                        root_id=None, parent_id=None, group_index=None):
    # pylint: disable=redefined-outer-name
    #  XXX chord is also a class in outer scope.
    opts = self.options
    try:
        gid = opts['task_id']
    except KeyError:
        gid = opts['task_id'] = group_id or uuid()
    if group_id:
        opts['group_id'] = group_id
    if chord:
        opts['chord'] = chord
    if group_index is not None:
        opts['group_index'] = group_index
    root_id = opts.setdefault('root_id', root_id)
    parent_id = opts.setdefault('parent_id', parent_id)
    if isinstance(self.tasks, _regen):
        # We are draining from a generator here.
        # tasks1, tasks2 are each a clone of self.tasks
        tasks1, tasks2 = itertools.tee(self._unroll_tasks(self.tasks))
        # freeze each task in tasks1, results now holds AsyncResult for each task
        results = regen(self._freeze_tasks(tasks1, group_id, chord, root_id, parent_id))
        # TODO figure out why this makes sense -
        # we freeze all tasks in the clone tㅌasks1, and then zip the results
        # with the IDs of tasks in the second clone, tasks2. and then, we build
        # a generator that takes only the task IDs from tasks2.
        self.tasks = regen(x[0] for x in zip(tasks2, results))
    else:
        new_tasks = []
        # Need to unroll subgroups early so that chord gets the
        # right result instance for chord_unlock etc.
        results = list(self._freeze_unroll(
            new_tasks, group_id, chord, root_id, parent_id,
        ))
        if isinstance(self.tasks, MutableSequence):
            self.tasks[:] = new_tasks
        else:
            self.tasks = new_tasks
    return gid, results
```
실제로 동작시켜보면, `if isinstance(self.tasks, _regen):` 부분에서 true가 되어, 해당 부분에 있는 코드가 실행된다.
results는 결과정보를 추적하기 위해 만들어놓은것으로 추정되었고, `self.tasks`에는 실행해야할 task 정보가 담겨있다.
여기서 문제가 되는 부분은 `self.tasks = regen(x[0] for x in zip(tasks2, results))` 였다.
`Backend.apply_chord` method에서 `GroupResult` 인스턴스가 만들어 질 때, results가 평가되며, `zip(tasks2, results)` 에 영향을 준 것이다.
따라서, 해당 시점에 만약, `zip([0,1,2,3], [0,1,2,3])` 이라면, 실제로 task들이 message 큐를 전송할 때 즈음엔, `zip([0,1,2,3],[0,1])` 이 되면서 앞의 2개를 빼고 나머지 task들이 모두 사라지는 것이었다.

### 왜 2개만 남기고 나머지만 사라졌는가?
`run` method에서 `if header.tasks` 가 실행될 때, 앞의 2개에 대해선 이미 실행이 되었기 때문으로 추측된다.
실제로, stack을 일일히 찍어보면, 해당 지점에서 2개가 미리 평가된다.
