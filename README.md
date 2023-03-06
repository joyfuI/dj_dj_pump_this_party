# DJ DJ pump this party

회사에서 사용하려고 만든 간단한 음악 재생용 웹앱

## 기능

- 유튜브 동영상/플레이리스트 재생
- 유튜브 뮤직 검색
- 유튜브 뮤직 차트 (인기곡, 인기 뮤직비디오, 인기 급상승 동영상)
- 자동재생 (마지막 곡 기준 유튜브 뮤직 알고리즘 중 현재 플레이리스트에 없는 곡 자동 추가. on/off 가능)

## 최초 세팅법

> 준비물: [Python](https://www.python.org/), [VLC](https://www.videolan.org/), [Git](https://git-scm.com/)

1. 리포지터리 클론

```bash
git clone https://github.com/joyfuI/dj_dj_pump_this_party.git
```

2. 파이썬 가상환경 생성

```bash
python -m venv .venv
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
python create_auth.py
```

인증토큰이 없으면 유튜브 뮤직 관련 기능(검색, 차트 등)을 사용할 때 제대로 작동하지 않음. 어느 날 갑자기 `headers_auth.json` 파일이 있는데도 작동이 이상하다면 토큰이 만료된 것이므로 재생성 필요

6. 앱 실행

```bash
flask run --host=0.0.0.0

# 개발모드
python app.py
```

최초 세팅 이후부턴 `가상환경 진입` 후 `앱 실행`만 하면 된다.

## 환경변수

| 키             | 값             | 기본값 |
| -------------- | -------------- | ------ |
| FLASK_RUN_PORT | 서버 포트 번호 | 5000   |
| VLC_PATH       | VLC 설치경로   |

.env 파일을 생성해도 됨

## 꿀팁

- 메뉴 버튼의 지난 목록 정리 기능을 사용하면 현재 재생 중인 곡 이전에 있는 목록을 한번에 정리할 수 있다.
- 좌측 하단에 있는 과녁 버튼을 누르면 현재 재생 중인 곡이 있는 곳으로 스크롤 한다.
- **https://www.youtube.com/watch?v=${videoId}&list=RDAMVM${videoId} 꼴의 URL은 유튜브에서 자동으로 생성해주는 해당 videoId의 믹스 재생 목록이다. 이걸로 비슷한 여러 곡을 한꺼번에 추가할 수 있다. 단, 재생 목록의 영상의 200여 개나 되므로 추가하는 데 오래 걸림**
