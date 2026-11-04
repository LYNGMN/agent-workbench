# brave-search

DeepSeek Harness(DSH)의 `web_search` 도구가 Brave Search API로 검색하게 하는 로컬 플러그인입니다.

## API 키

이 플러그인에는 키가 들어 있지 않습니다. [Brave Search API](https://brave.com/search/api/)에서 자기 키를 받아 아래 셋 중 한 곳에 둡니다. 위에서부터 먼저 찾습니다.

1. DSH Plugins 페이지의 Brave Search 카드(DSH 자격 증명 저장소에 `BRAVE_API_KEY`로 저장)
2. 실행 환경 변수 `BRAVE_API_KEY` 또는 `~/.dsh/.env`
3. 파일 `~/.dsh/brave-api-key` (한 줄, `chmod 600 ~/.dsh/brave-api-key`)

키는 저장소에 넣거나 다른 사람에게 보내지 마세요.

## 설치

저장소 맨 위에서 `./install.sh --apply --with dsh-plugins`. 손으로 넣는 방법은 [skill-hints/README.md](../skill-hints/README.md)의 "설치"와 같고 이름만 `brave-search`로 바꿉니다. 넣은 뒤 DSH를 다시 시작합니다.

## 롤백

Plugins 페이지에서 끄거나, 저장소 맨 위에서 `./uninstall.sh --apply`.
