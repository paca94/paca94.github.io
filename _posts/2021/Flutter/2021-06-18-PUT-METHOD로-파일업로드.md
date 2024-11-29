---
title: "PUT Method로 파일 업로드"
search: true
categories:
  - Flutter
last_modified_at: 2021-06-18T08:01:00+09:00
layout: single
author_profile: true
read_time: true
comments: true
share: true
related: true
tag:
- Flutter
- AWS
description: Put Method를 통한 파일 업로드
article_tag1: Flutter
article_section: Flutter
meta_keywords: Flutter
toc: true
toc_sticky: true
toc_label: 목차
popular: true
---

```yaml
Put Method를 통한 파일 업로드
```

Flutter 작업도중, 서버단에서 S3에 파일을 업로드를 할 때, SignedURL로 직접 올리도록 구현해놔서, PUT METHOD로 파일을 직접 올려야 할 일이 있었다.
하지만, 찾아보니, 대부분 Multipart로 업로드하는 방법에 대해서만 기술해놔서, 해당 코드를 블로그에 기록한다.

```Dart
Future<bool> uploadImage(File file, String uploadURL) async {
  final dio = new Dio();
  final option = Options();
  option.headers = {
    'Content-Type': "image/${file.path.split(".").last}",
    'Accept': "*/*",
    'Content-Length': file.lengthSync().toString(),
    'Connection': 'keep-alive',
  };
  final fileBytes = file.readAsBytesSync();

  await dio.put(
    uploadURL,
    data: Stream.fromIterable(fileBytes.map((e) => [e])),
    options: option,
  );
}
```
