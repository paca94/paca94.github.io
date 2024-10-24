---
title: "Python Object 쪼개보기"
search: true
categories:
  - Python
last_modified_at: 2022-03-09T13:26:00-09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Python, Dictionary, Cpython
description: CPython을 까보고 Python Object는 어떻게 동작하는지 알아본다
article_tag1: Python
article_section: Python
meta_keywords: Python
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
Python Object 쪼개보기
```

# 찾아본 이유
이번에 이직한 회사에서 Python을 쓰고 있는데, Dictionary 자료형의 기본크기는 몇이며, 얘는 어떻게 동작하고 그리고 크기 증가 전략은 어떤것인지 궁금해서 알아보게 되었다.

# Python Dictionary는 무엇인가?
CPython Repo => Objects/dictobject.c line 1
```
Dictionary object implementation using a hash table
```


## memory Layout
```
+---------------------+
| dk_refcnt           |
| dk_log2_size        |
| dk_log2_index_bytes |
| dk_kind             |
| dk_usable           |
| dk_nentries         |
+---------------------+
| dk_indices[]        |
|                     |
+---------------------+
| dk_entries[]        |
|                     |
+---------------------+
```
dk_indices=>  엔트리에 있는 데이터의 위치값이 저장되어 있음. 배열에는 실제 데이터, DKIX_EMPTY(-1) or DKIX_DUMMY(-2) 중 하나가 들어가 있음. 가득차면 2배로 증가. 실제해시테이블 사이즈

### _dictkeysobject

dk_refcnt => gc용 레퍼카운터인듯.  
dk_log2_size => 해시테이블(indices) 크기. 2의 지수배로 증가함.  
dk_log2_index_bytes => 해시테이블 바이트사이즈  
dk_kind => 키 종류  
dk_version => 버전값. 어떤 키값이 수정되면 0으로 수정함.  
dk_usable => 사용가능한 entries 공간크기.  
dk_nentries => 실제 사용하고있는 entries 공간 크기  
dk_indices => 인덱스가 저장되는 실제 배열. 
   - 상세 > char dk_indices[];  /* char is required to avoid strict aliasing. */


### _dictvalues
/* Layout of dict values:
 *
 * The PyObject *values are preceded by an array of bytes holding
 * the insertion order and size.
 * [-1] = prefix size. [-2] = used size. size[-2-n...] = insertion order.
 */
struct _dictvalues {
    PyObject *values[1];
};


Size of indices is dk_size.  Type of each index in indices is vary on dk_size:

* int8  for          dk_size <= 128
* int16 for 256   <= dk_size <= 2**15
* int32 for 2**16 <= dk_size <= 2**31
* int64 for 2**32 <= dk_size

# 파이썬 해시함수
해시함수는 일반적으로 랜덤성이 좋아야 좋음.
하지만, 파이썬에서는 인트에대해선 규칙적임. (확인해보니, 1=>1 2=>2 이런식으로 나옴.)


# 충돌
해시값 충돌시, 아래 알고리즘을 통해 다음에 저장될 인덱스를 지정함.

만약, 선형 프로빙으로 저장한다면, 인덱스가 연속될경우, 치명적임.
```
j = ((5*j) + 1) mod 2**i
```

따라서, 연속적인 인덱스에 저장하지 않고, 아래 알고리즘을 통해 다음인덱스를 결정함.
```
perturb >>= PERTURB_SHIFT;
j = (5*j) + 1 + perturb;
use j % 2**i as the next table index;
```

# 증가 비율


/* GROWTH_RATE. Growth rate upon hitting maximum load.
 * Currently set to used*3.
 * This means that dicts double in size when growing without deletions,
 * but have more head room when the number of deletions is on a par with the
 * number of insertions.  See also bpo-17563 and bpo-33205.
 *
 * GROWTH_RATE was set to used*4 up to version 3.2.
 * GROWTH_RATE was set to used*2 in version 3.3.0
 * GROWTH_RATE was set to used*2 + capacity/2 in 3.4.0-3.6.0.
 */

 /* Number of items in the dictionary */
 #define GROWTH_RATE(d) ((d)->ma_used*3)


 # 클리어시킬때
 This immutable, empty PyDictKeysObject is used for PyDict_Clear()
 빈거가져다가씀?

 # 인덱스 룩업

index => 해당 키값이 저장된 위치 ( 충돌여부 안보고 해당위치 일단찾음)
hash => 해당 키값 해쉬돌린 결과값
비었으면 -1임. ( DKIX_EMPTY )
```C
static Py_ssize_t
lookdict_index(PyDictKeysObject *k, Py_hash_t hash, Py_ssize_t index)
{
    size_t mask = DK_MASK(k);
    size_t perturb = (size_t)hash;
    size_t i = (size_t)hash & mask;

    for (;;) {
        Py_ssize_t ix = dictkeys_get_index(k, i);
        if (ix == index) {
            return i;
        }
        if (ix == DKIX_EMPTY) {
            return DKIX_EMPTY;
        }
        perturb >>= PERTURB_SHIFT;
        i = mask & (i*5 + perturb + 1);
    }
    Py_UNREACHABLE();
}
```

딕셔너리는 키, 값, 사용하고있는 공간값, 버전정보 ( 해당값은 해시테이블 만들어지거나 값이 수정될때증가? )





insertdict
insert_to_emptydict




버전갱신이유 ? 왜 ?





/* USABLE_FRACTION is the maximum dictionary load.
 * Increasing this ratio makes dictionaries more dense resulting in more
 * collisions.  Decreasing it improves sparseness at the expense of spreading
 * indices over more cache lines and at the cost of total memory consumed.
 *
 * USABLE_FRACTION must obey the following:
 *     (0 < USABLE_FRACTION(n) < n) for all n >= 2
 *
 * USABLE_FRACTION should be quick to calculate.
 * Fractions around 1/2 to 2/3 seem to work well in practice.
 */
#define USABLE_FRACTION(n) (((n) << 1)/3)

### 딕 사이즈 계산

#### 프리사이즈
PyDict_LOG_MINSIZE == 3 ? 2 << 3 할 경우, 8임.
딕 사이즈는 기본 8 반환

max presize => 2^(17 + 1)임.
아이템 개수가 2^(17+1) * 2 / 3보다 크면, 그냥 크기를 2^17 사용
넘지않을경우, 사이즈대로 반환 => (크기 * 3 +1) / 2
(크기 아이템 미리할당)


log2_size => 지수사이즈 ? 

_Py_bit_length > 현재값보다 크고 가장 가까운 지수 구함.
(사용사이즈 * 3 + 1) / 2 < 2^x
지수를 구해야함.

ex)
1, 2 < 2^x, x = 2 => 2
2, 3.5 < 2^x, x = 2 => 2

10, 15.5 < 2^x, x = 4 => 4

entry_size => 유니코드 키값일경우, PyObject * 2 포인터
            => 그외값, PyObject * 2 포인터 + 파이썬 기본사이즈(?)

log2_bytes => 
```
    if (log2_size < 8) {
        log2_bytes = log2_size;
    }
    else if (log2_size < 16) {
        log2_bytes = log2_size + 1;
    }
#if SIZEOF_VOID_P > 4 ( 64비트 운영체제 기준)
    else if (log2_size >= 32) {
        log2_bytes = log2_size + 3;
    }
#endif
    else {
        log2_bytes = log2_size + 2;
    }
```
usable => USABLE_FRACTION(1<<log2_size);

최종 사이즈 ? 
        dk = PyObject_Malloc(sizeof(PyDictKeysObject)
                             + ((size_t)1 << log2_bytes)
                             + entry_size * usable);


최종.
```
    dk->dk_refcnt = 1;
    dk->dk_log2_size = log2_size;
    dk->dk_log2_index_bytes = log2_bytes;
    dk->dk_kind = unicode ? DICT_KEYS_UNICODE : DICT_KEYS_GENERAL;
    dk->dk_nentries = 0;
    dk->dk_usable = usable;
    dk->dk_version = 0;
    memset(&dk->dk_indices[0], 0xff, ((size_t)1 << log2_bytes));
    memset(&dk->dk_indices[(size_t)1 << log2_bytes], 0, entry_size * usable);
    return dk;
```


비어있을경우 기본 키 형태
```

static PyDictKeysObject empty_keys_struct = {
        1, /* dk_refcnt */
        0, /* dk_log2_size */
        0, /* dk_log2_index_bytes */
        DICT_KEYS_UNICODE, /* dk_kind */
        1, /* dk_version */
        0, /* dk_usable (immutable) */
        0, /* dk_nentries */
        {DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY,
         DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY, DKIX_EMPTY}, /* dk_indices */
};

```




파이썬 메모리 할당시, 오브젝트 기본 사이즈 + 타입을 위한 사이즈 만큼 잡고, gc에는 타입을 위한 사이즈 위치에 대해 링크를 검(?)


gc head
```
typedef struct {
    // Pointer to next object in the list.
    // 0 means the object is not tracked
    uintptr_t _gc_next;

    // Pointer to previous object in the list.
    // Lowest two bits are used for flags documented later.
    uintptr_t _gc_prev;
} PyGC_Head;
```

gc가 안돌고 있다면, young 세대의 한계점의 개수가 현재 개수보다 많다면, gc돔. 대충이정도만 알면될듯?
```
void
_PyObject_GC_Link(PyObject *op)
{
    PyGC_Head *g = AS_GC(op);
    assert(((uintptr_t)g & (sizeof(uintptr_t)-1)) == 0);  // g must be correctly aligned

    PyThreadState *tstate = _PyThreadState_GET();
    GCState *gcstate = &tstate->interp->gc;
    g->_gc_next = 0;
    g->_gc_prev = 0;
    gcstate->generations[0].count++; /* number of allocated GC objects */
    if (gcstate->generations[0].count > gcstate->generations[0].threshold &&
        gcstate->enabled &&
        gcstate->generations[0].threshold &&
        !gcstate->collecting &&
        !_PyErr_Occurred(tstate))
    {
        gcstate->collecting = 1;
        gc_collect_generations(tstate);
        gcstate->collecting = 0;
    }
}
```

오브젝트를 만들때마다 gc를 돌릴지 체크함.
즉, 주기적으로 도는게아니란뜻.


메모리 할당 실패했을경우, 할당해둔 key들 밀어버림.


파이썬에서 dict은 삭제하면 현재 프리갯수가 80개 이하라면, 그곳에 저장하고, 80개가 넘어가면 free해버림.

배열로서, 스택형태로 되어있음.


```python
>>> id(d)
4379980224
>>> del d
>>> d = {}
>>> id(d)
4379980224
>>> del d
>>> d1 = {}
>>> id(d1)
4379980224
>>> del d1
>>> d1
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'd1' is not defined
>>> d2 = {'a':1, 'b':2,'c':3,'d':4,'e':5,'f':6,'g':7,'h':8,'i':9}
>>> id(d2)
4379980224
>>> len(d2)
9
>>> id(d2)
4379980224
>>> del d2
>>> d3 = {}
>>> id(d3)
4379980224
>>> d4 = {}
>>> id(d4)
4379980352
>>> del d4
>>> del d3
>>> d5 = {}
>>> id(d5)
4379980224
>>> d6 = {}
>>> id(d6)
4379980352


```




```
* There are no strict guarantee that returned dict can contain minused
* items without resize.  So we create medium size dict instead of very
* large dict or MemoryError.
```

## PyDict_GetItem
```
Note that, for historical reasons, PyDict_GetItem() suppresses all errors that may occur (originally dicts supported only string keys, and exceptions weren't possible).  So, while the original intent was that a NULL return meant the key wasn't present, in reality it can mean that, or that an error (suppressed) occurred while computing the key's hash, or that some error (suppressed) occurred when comparing keys in the dict's internal probe sequence.  A nasty example of the latter is when a Python-coded comparison function hits a stack-depth error, which can cause this to return NULL even if the key is present.


역사적 이유로 PyDict_GetItem()은 발생할 수 있는 모든 오류를 억제합니다(원래 dicts는 문자열 키만 지원했으며 예외는 불가능했습니다). 따라서 원래 의도는 NULL 반환이 키가 없음을 의미하는 것이지만 실제로는 키의 해시를 계산하는 동안 오류(억제됨)가 발생했거나 비교할 때 일부 오류(억제됨)가 발생했음을 의미할 수 있습니다. dict의 내부 프로브 시퀀스에 있는 키. 후자의 불쾌한 예는 Python으로 코딩된 비교 함수가 스택 깊이 오류에 도달했을 때입니다. 이로 인해 키가 있더라도 NULL이 반환될 수 있습니다.


```

키는 기본사이즈일경우에만 reuse
만약, 프리 키배열이 있다며 가져다가 ㅏㅅ용. 없으면 새로만듬.



유니코드뿐인 테이블에, 유니코드가 아닌 데이터가 추가된다면, resize


# resize

/*
Restructure the table by allocating a new table and reinserting all
items again.  When entries have been deleted, the new table may
actually be smaller than the old one.
If a table is split (its keys and hashes are shared, its values are not),
then the values are temporarily copied into the table, it is resized as
a combined table, then the me_value slots in the old table are NULLed out.
After resizing a table is always combined.

This function supports:
 - Unicode split -> Unicode combined or Generic
 - Unicode combined -> Unicode combined or Generic
 - Generic -> Generic
*/



키값이 

631



```c
    usable = USABLE_FRACTION(1<<log2_size);
    if (log2_size < 8) {
        log2_bytes = log2_size;
    }
    else if (log2_size < 16) {
        log2_bytes = log2_size + 1;
    }
#if SIZEOF_VOID_P > 4
    else if (log2_size >= 32) {
        log2_bytes = log2_size + 3;
    }
#endif
    else {
        log2_bytes = log2_size + 2;
    }
```

1~7 ( min 3 )
보면, log2_size가 2^7(128) 이하라면,  indices와 entries 할당량이 동일함. 즉, 변경전과 동일함. 지수값이 7일 때, 실제 사용 가능한 크기는 85.3
* 8~15
2^15 (32768) 이하라면, indices가 entires의 2배임.

16~31

32~

지수값별 사용가능한 크기
| 지수 | indices 크기 | 사용가능 크기 / entries 크기 (2 ^ 지수 * 2 / 3) |
| - | -|  - |
| - | -(2^지수)- |  - |
| 3  | 8  | 5.3 |
| 4  | 16 | 10.6 |
| 5  | 32  | 21.3 |
| 6  | 64 |42.6 |
| 7  | 128 |85.3 |
| - | -(2^(지수+1))- |  - |
| 8  | 512 | 170.6 |
| 9  | 1024 | 341.3 |
| 10  | 2048 | 682.6  |
| 11  | 4096 | 1365.3  |
| 12  |  8192 | 2730.6  |
| 13  | 16384 | 5461.3  |
| 14 | 32768 | 10922.6 |
| 15|65536 | 21845.3 |
| - | -(2^(지수+2))- |  - |
| 16 | 262144 |  43690.6 |
| 17 | 524288  | 87381.3  |
| 18 | 1048576 | 174762.6  |
| 19 |2097152 | 349525.3  |
| 20 |4194304  | 699050.6  |
| 21 |8388608  | 1398101.3  |
| 22 | 16777216 | 2796202.6  |
| 23 |33554432  |  5592405.3 |
| 24 | 67108864 |  11184810.6 |
| 25 | 134217728 | 22369621.3  |
| 26 | 268435456 | 44739242.6  |
| 27 | 536870912 | 89478485.3  |
| 28 | 1073741824 | 178956970.6  |
| 29 | 2147483648 | 357913941.3  |
| 30 | 4294967296 | 715827882.6  |
| 31 | 8589934592 |  1431655765.3 |
| - | -|  - |
| 32 | 34359738368 | 2863311530.6  |
| ... | ... | ...  |
| - | -|  - |

리사이즈시 사용중인 양의 3배로 늘어남. 그리고 큰값중 가장 가까운 2의 지수중에 선택.
```

        dk = PyObject_Malloc(sizeof(PyDictKeysObject)
                             + ((size_t)1 << log2_bytes)
                             + entry_size * usable);
```


young normal old ( 프리는 2세대에서만 비움 )

usable = log2_size * 2 / 3 


아이템을 삭제해도 usable 카운트는 줄지않음. 
계속해서 늘려가면서 데이터를 할당.\

키값 유니코드만쓰다가 다른종류 쓰면, resize일어남. combine으로 변경!