# dj_dj_pump_this_party

회사에서 사용하려고 만든 간단한 음악 재생용 웹앱

## 최초 세팅법

> 준비물: [Python](https://www.python.org/), [VLC](https://www.videolan.org/), [Git](https://git-scm.com/)

1. 리포지터리 클론

```bash
git clone https://github.com/joyfuI/dj_dj_pump_this_party.git
```

2. 파이썬 가상환경 생성

```bash
python3 -m venv .venv
```

3. 가상환경 진입

```bash
# 리눅스
. .venv/bin/activate

# 윈도우
.venv\Scripts\Activate.ps1
```

4. 패키지 설치

```bash
pip install -r requirements.txt
```

5. 유튜브 뮤직 인증토큰 생성

[이 링크](https://ytmusicapi.readthedocs.io/en/latest/setup.html#copy-authentication-headers)를 참고해서 아래 명령어가 시키는 대로 하면 `headers_auth.json` 파일이 생성됨

```bash
python3 create_auth.py
```

인증토큰이 없으면 검색 기능을 사용할 때 검색 결과가 제대로 나오지 않음. `headers_auth.json` 파일이 있는데도 검색 결과가 이상하다면 토큰이 만료된 것이므로 재생성 필요

6. 앱 실행

```bash
flask run --host=0.0.0.0

# 개발모드
python3 app.py
```

최초 세팅 이후부턴 `가상환경 진입` 후 `앱 실행`만 하면 된다.

## 환경변수

| 키             | 값             | 기본값 |
| -------------- | -------------- | ------ |
| FLASK_RUN_PORT | 서버 포트 번호 | 5000   |
| VLC_PATH       | VLC 설치경로   |

.env 파일을 생성해도 됨
