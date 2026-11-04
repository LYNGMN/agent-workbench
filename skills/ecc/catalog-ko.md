# ECC 카탈로그 한국어 색인 (v2.2.3)

ECC(affaan-m/ECC) v2.2.3에 들어 있는 스킬 293개·에이전트 68개·명령 94개를 비개발자도 알아볼 수 있게 묶은 색인입니다.
스킬은 대부분 프로그램이 아니라 **"이런 일은 이 순서로 하라"는 작업 설명서**입니다. `/ecc <이름>`으로 부르면 Claude가 그 설명서를 읽고 따라 합니다.

- ★ 웹 서비스 작업에 자주 쓸 만함
- ● 이미 설치된 비슷한 스킬이 있음(괄호 안이 기존 스킬). 특별한 이유가 없으면 기존 스킬을 먼저 씁니다.
- 위치: `~/.agents/sources/affaan-m/ECC` (커밋 `c05b2d6`)

## 1. 일하는 순서를 잡아 주는 설명서

- ★ `search-first` — 만들기 전에 이미 있는 도구·패키지·스킬부터 찾기
- ★ `click-path-audit` — 화면의 버튼 하나하나가 실제로 무엇을 바꾸는지 끝까지 따라가 숨은 오류 찾기
- `blueprint` — 한 줄 목표를 여러 세션에 걸친 단계별 작업 계획으로 풀기
- `intent-driven-development` — 애매하거나 영향이 큰 변경을 범위·확인 기준이 있는 작업으로 바꾸기
- `product-capability` — 기획 문서나 논의를 구현 가능한 기능 명세로 옮기기
- `product-lens` — 만들기 전에 "왜 필요한지"를 네 가지 질문으로 따져 보기
- ● `tdd-workflow` — 실패하는 테스트를 먼저 쓰고 통과시키는 순서 (superpowers `test-driven-development`)
- ● `verification-loop` — 빌드·형식·검사·테스트·보안·변경 검토 6단계 확인 후 통과/실패 보고 (`verification-before-completion`)
- `production-audit` — 출시 전·후 실제 증거로 운영 준비 상태 점검
- `orch-pipeline` — 아래 orch-* 묶음이 공통으로 쓰는 "조사→계획→테스트→구현→검토" 진행 엔진
- `orch-add-feature` — 새 기능을 처음부터 끝까지 그 순서로 만들기
- `orch-change-feature` — 이미 있는 기능의 동작을 바꾸기
- `orch-fix-defect` — 버그를 재현 테스트로 잡고 고치기
- `orch-refine-code` — 동작은 그대로 두고 코드 정리하기
- `orch-build-mvp` — 설계 문서에서 동작하는 시제품 만들기
- `plan-orchestrate` — 계획 문서를 단계로 쪼개 각 단계에 맞는 도구 지정
- `ralphinho-rfc-pipeline` — 큰 설계 문서를 여러 에이전트가 나눠 할 작업 순서도로 바꾸기
- `plan-canvas` — 계획이나 HTML 시안을 브라우저에 띄워 사람이 표시·메모를 달게 하기
- `contract-first` — 화면·서버가 함께 일할 때 기준이 되는 약속(데이터 형식)을 먼저 정하기
- `architecture-decision-records` — 중요한 설계 결정을 번호 붙은 기록 문서로 남기기
- `codebase-onboarding` — 처음 보는 코드 저장소의 구조 안내서 만들기
- `code-tour` — 코드 안을 단계별로 둘러보는 안내 파일 만들기
- `inherit-legacy-style` — 오래된 프로젝트의 숨은 작성 습관을 찾아 AI가 그대로 따르게 하기
- `coding-standards` — 이름 짓기·가독성 등 공통 코드 작성 기준
- `error-handling` — 오류를 안전하게 처리하는 방법
- `git-workflow` — 브랜치·커밋 규칙
- `github-ops` — GitHub 이슈·PR·자동화 관리
- `project-flow-ops` — GitHub·Linear 이슈와 PR 흐름 정리
- `jira-integration` — Jira 티켓 읽고 갱신하기
- `iterative-retrieval` — 하위 에이전트에게 필요한 맥락을 단계적으로 좁혀 주기
- `documentation-lookup` — 기억 대신 최신 공식 문서(Context7)를 찾아보고 코드 쓰기
- `terminal-ops` — 명령 실행·결과 확인을 증거 중심으로 진행
- `terminal-opener` — 프로그램을 눈에 보이는 터미널 창에서 실행

## 2. 출시 후 확인·속도

- ★ `canary-watch` — 배포 직후 사이트·자원·콘솔 오류·속도 감시 (● gstack `canary`와 비슷)
- ★ `browser-qa` — 브라우저 자동 조작으로 배포 후 화면 점검
- `e2e-testing` — Playwright로 사용자 흐름 전체 자동 테스트
- ● `benchmark` — 화면 속도·서버 응답 기준값 측정과 느려짐 감지 (gstack `benchmark`)
- `benchmark-optimization-loop` — "빠르게 해 줘"를 측정→개선→재측정 반복으로 바꾸기
- `latency-critical-systems` — 실시간 화면처럼 지연에 민감한 시스템 최적화
- `ui-demo` — 화면 시연 영상을 Playwright로 녹화
- `windows-desktop-e2e` — 윈도우 프로그램 자동 테스트

## 3. 웹 화면·디자인

- ★ `make-interfaces-feel-better` — 화면을 더 다듬어 보이게 하는 세부 요령
- ★ `motion-foundations` — 애니메이션 기본값·성능·접근성 규칙
- ★ `motion-patterns` — 버튼·창·토스트 등 자주 쓰는 애니메이션
- `motion-advanced` — 끌어 놓기·제스처·글자 애니메이션 등 고급 움직임
- ★ `react-performance` — React 화면 속도 개선
- ★ `seo` — 검색 노출 점검과 개선
- ★ `i18n-sync` — 다국어 문구 파일 맞추기 (JSON 기준이라 다른 형식의 문구 파일이면 조정 필요)
- ● `accessibility` — WCAG 2.2 AA 접근성 설계·점검 (`wcag22-vibe-coding`)
- ● `frontend-a11y` — React 접근성 요령 (`wcag22-vibe-coding`)
- ● `frontend-design-direction` — 화면 디자인 방향 정하기 (`designing-distinctive-ui`)
- ● `design-system` — 기존 코드에서 디자인 규칙 뽑기·일관성 점검 (`designing-distinctive-ui`)
- `frontend-patterns` — React·Next.js 화면 개발 일반 요령
- `react-patterns` — React 18·19 사용 규칙
- `react-testing` — React 화면 테스트
- `nextjs-turbopack` — Next.js 16 빌드 도구
- `vite-patterns` — Vite 빌드 설정
- `vue-patterns` — Vue 3
- `ui-to-vue` — 화면 캡처를 Vue 코드로 일괄 변환
- `nuxt4-patterns` — Nuxt 4
- `angular-developer` — Angular
- `liquid-glass-design` — iOS 26 유리 질감 디자인
- `frontend-slides` — 애니메이션이 있는 HTML 발표 자료 만들기

## 4. 서버·데이터베이스·비용

- ★ `database-migrations` — DB 구조를 되돌릴 수 있게 안전하게 바꾸기 (D1 규칙은 기존 메모리가 우선)
- ★ `content-hash-cache-pattern` — 같은 내용이면 비싼 처리 결과를 다시 계산하지 않고 재사용
- ★ `cost-aware-llm-pipeline` — AI 호출 비용 줄이기(쉬운 일은 싼 모델, 예산 관리, 캐시) (● `cloud-cost-guard`와 함께)
- `api-design` — REST API 이름·상태 코드·페이지 나누기 규칙
- `api-connector-builder` — 저장소에 이미 있는 연동 방식을 따라 새 외부 API 연결 만들기
- `backend-patterns` — 서버 구조·DB 최적화 일반 요령
- `postgres-patterns` — PostgreSQL
- `mysql-patterns` — MySQL·MariaDB
- `redis-patterns` — Redis 캐시·잠금·호출 제한
- `clickhouse-io` — ClickHouse 분석 DB
- `prisma-patterns` — Prisma ORM
- `data-throughput-accelerator` — 대량 데이터 옮기기(가져오기·채워 넣기·내보내기) 진단과 가속
- `deployment-patterns` — 배포 흐름·CI/CD·상태 확인
- `docker-patterns` — Docker
- `kubernetes-patterns` — Kubernetes
- `uncloud` — Uncloud 클러스터 운영
- `flox-environments` — 맥·리눅스에서 똑같이 재현되는 개발 환경
- `bun-runtime` — Bun 실행기
- `dashboard-builder` — 운영자가 실제로 묻는 질문에 답하는 모니터링 대시보드
- `mcp-server-patterns` — MCP 서버 만들기
- `recsys-pipeline-architect` — 추천·피드 순위 파이프라인 설계 (피드 순위 설계 참고용)
- `mailtrap-email-integration` — Mailtrap으로 메일 발송 연동
- `generating-python-installer` — 윈도우용 파이썬 설치 프로그램 만들기
- `regex-vs-llm-structured-text` — 정형 글자 처리를 단순 규칙으로 할지 AI로 할지 판단

## 5. 프로그래밍 언어별 설명서

JavaScript 프로젝트라면 대부분 해당이 없습니다. 쓰는 언어를 고를 때 참고합니다.

- Python: `python-patterns`, `python-testing`
- Django: `django-patterns`, `django-security`, `django-tdd`, `django-verification`, `django-celery`
- FastAPI: `fastapi-patterns`
- Go: `golang-patterns`, `golang-testing`
- Rust: `rust-patterns`, `rust-testing`
- Java: `java-coding-standards`, `jpa-patterns`, `tinystruct-patterns`
- Spring Boot: `springboot-patterns`, `springboot-security`, `springboot-tdd`, `springboot-verification`
- Quarkus: `quarkus-patterns`, `quarkus-security`, `quarkus-tdd`, `quarkus-verification`
- Kotlin·Android: `kotlin-patterns`, `kotlin-testing`, `kotlin-coroutines-flows`, `kotlin-ktor-patterns`, `kotlin-exposed-patterns`, `android-clean-architecture`, `compose-multiplatform-patterns`
- Swift·iOS: `swiftui-patterns`, `swift-concurrency-6-2`, `swift-actor-persistence`, `swift-protocol-di-testing`, `foundation-models-on-device`(기기 안 AI), `ios-icon-gen`(앱 아이콘 생성)
- Flutter·Dart: `dart-flutter-patterns`, `flutter-dart-code-review`
- React Native: `react-native-patterns`
- C++: `cpp-coding-standards`, `cpp-testing`
- C#·.NET·F#: `dotnet-patterns`, `csharp-testing`, `fsharp-testing`
- Perl: `perl-patterns`, `perl-security`, `perl-testing`
- PHP Laravel: `laravel-patterns`, `laravel-security`, `laravel-tdd`, `laravel-verification`, `laravel-plugin-discovery`
- Ruby on Rails: `rails-patterns`
- NestJS: `nestjs-patterns`
- 구조 설계: `hexagonal-architecture`(안쪽 규칙과 바깥 연결을 나누는 설계)
- AI·머신러닝: `pytorch-patterns`, `ml-adoption-playbook`, `mle-workflow`
- 블록체인 실수 방지: `evm-token-decimals`, `nodejs-keccak256`

## 6. AI 에이전트를 만들고 굴리는 법

"Claude 여러 개를 팀처럼 돌리기" 같은 고급 운영 기법입니다. 평소엔 쓸 일이 드뭅니다.

- `council` — 네 가지 관점으로 애매한 결정을 토론해 결론 내기
- `council-multi-model` — 위 토론 결과에 Codex 의견을 한 번 더 받기
- `santa-method` — 검토자 둘이 같은 기준으로 따로 확인해 둘 다 통과해야 인정
- `dev-team` — PM·설계자 등 역할을 나눈 가상 팀 회의
- `team-agent-orchestration` — 담당자·범위가 있는 에이전트 팀 운영
- `team-builder` — 쓸 에이전트 역할을 골라 팀 구성
- `claude-devfleet` — 여러 코딩 에이전트에 작업 배분
- `dmux-workflows` — tmux 창마다 에이전트를 띄워 동시 작업
- `parallel-execution-optimizer` — 작업을 동시에 돌릴 수 있는 갈래로 나눠 빠르게
- `autonomous-loops` — 사람 없이 반복 실행하는 구조들
- `continuous-agent-loop` — 품질 관문이 있는 지속 반복 실행
- `loop-design-check` — 반복 실행이 헛돌거나 엉뚱한 목표를 쫓는 함정 점검
- `agentic-os` — Claude Code 위에 여러 에이전트 운영 체계 만들기
- `autonomous-agent-harness` — 기억·일정이 있는 완전 자율 에이전트로 만들기
- `agentic-engineering` — 평가 먼저, 잘게 나누기, 비용을 따지는 에이전트식 개발
- `ai-first-engineering` — AI가 코드 대부분을 쓰는 팀의 일하는 방식
- `agent-eval` — 코딩 에이전트끼리 같은 과제로 비교
- `eval-harness` — 기능·회귀 평가를 먼저 정하고 개발
- `agent-self-evaluation` — 작업 후 AI가 스스로 5개 기준으로 채점
- `ai-regression-testing` — AI 도움으로 만든 코드의 회귀 테스트
- `agent-architecture-audit` — AI 앱의 12개 층 전체 진단
- `agent-harness-construction` — 에이전트의 도구·입출력 형식 설계
- `agent-introspection-debugging` — 에이전트 실패를 재시도 대신 기록·진단·복구
- `enterprise-agent-ops` — 오래 도는 클라우드 에이전트 운영 통제
- `gan-style-harness` — 만드는 쪽·평가하는 쪽을 나눠 품질 끌어올리기
- `dynamic-workflow-mode` — 작업별 임시 평가 관문과 재사용 스킬 추출
- `recursive-decision-ledger` — 반복 시도와 판단을 장부에 남기되 위험한 실행은 자동 승인 안 함
- `prompt-optimizer` — 요청문을 분석해 빠진 맥락 보완·맞는 도구 추천
- `token-budget-advisor` — 답변 길이(25~100%)와 예상 사용량을 먼저 고르게 하기
- `agent-payment-x402` — AI가 예산 한도 안에서 결제하게 하기

## 7. 기억·대화 분량 관리

- `strategic-compact` — 대화가 길어질 때 단계가 끝나는 알맞은 시점에 요약하기
- `context-budget` — 남은 대화 분량 확인
- `continuous-learning-v2` — 작업을 지켜보며 습관을 자동으로 배우기 (훅이 필요해 사용 안 함)
- `continuous-learning` — 위의 옛 버전(폐기 예정)
- ● `ck` — 프로젝트별 기억 저장 (자동 메모리·`docs/HANDOFF.md`)
- ● `unified-memory` — Claude·Codex 등 여러 도구가 기억 공유 (`docs/HANDOFF.md`)
- `growth-log` — 끝난 작업에서 재사용할 교훈 기록
- `rules-distill` — 여러 스킬에서 공통 원칙을 뽑아 규칙으로 정리
- `living-docs-governance` — 오래된 프로젝트 문서가 낡지 않게 역할 나누기
- `knowledge-ops` — 여러 저장소에 흩어진 지식 정리·동기화
- `cost-tracking` — 사용량·비용 기록 확인 (ECC 훅 기록이 있어야 함)

## 8. 내 설정·스킬 점검

- ★ `skill-stocktake` — 설치된 스킬·명령의 품질 점검
- ★ `config-gc` — `~/.claude` 안의 겹치거나 낡은 설정 찾기, 지울 때마다 확인
- ★ `hookify-rules` — 금지 규칙을 문서로 써서 경고·차단에 쓰기 (ECC 훅 실행기가 필요해, 같은 생각을 기본 훅으로 구현함)
- `skill-comply` — 스킬·규칙을 실제로 지키는지 시나리오로 측정
- `skill-scout` — 새 스킬 만들기 전에 기존 것 찾기
- `gateguard` — 파일을 처음 고칠 때 근거를 먼저 대게 하는 관문 (훅)
- `safety-guard` — 위험한 명령을 막는 세 가지 모드
- `delivery-gate` — 품질 검사를 통과해야 끝낼 수 있게 하는 관문 (훅)
- `plankton-code-quality` — 저장할 때마다 형식·검사 강제
- `codehealth-mcp` — CodeScene으로 코드 건강도 확인
- `security-scan` — `.claude` 설정·훅·MCP 보안 점검 (외부 도구 `ecc-agentshield` 필요, 실행 전에 물음)
- `workspace-surface-audit` — 저장소·MCP·플러그인 등을 훑어 맞는 도구 추천
- `automation-audit-ops` — 자동화가 겹치는지 증거로 조사

## 9. ECC 자체 관리

카탈로그 방식에서는 설치·설정 기능은 쓰지 않습니다.

- `ecc-guide` — "ECC에 이런 거 있어?"에 답하기 (참고용)
- `ecc-recipes` — 하려는 일에 맞는 ECC 명령 순서 안내
- `agent-sort` — 저장소에 맞는 ECC 구성 고르기
- `configure-ecc` — ECC 설치 마법사 (사용 안 함)
- `ecc-tools-cost-audit` — ECC 유료 서비스 비용 점검
- `repo-scan` — 외부 repo-scan 도구 설치 안내 (외부 코드라 실행 전에 물음)
- `hermes-imports` — Hermes 작업 흐름을 ECC 스킬로 변환
- `nanoclaw-repl` — ECC 전용 대화형 실행기
- `nasiko-control-plane` — Nasiko CLI 관리

## 10. 보안

- ★ `security-review` — 로그인·입력값·비밀키·결제 기능을 다룰 때 점검표
- `security-bounty-hunter` — 실제로 악용 가능한 취약점 찾기 (자기 소유 저장소에만)
- `defi-amm-security` — 코인 거래소 스마트 계약 점검
- `llm-trading-agent-security` — 지갑 권한이 있는 자동매매 에이전트 보안
- `hipaa-compliance` — 미국 의료 개인정보 규정
- `healthcare-phi-compliance` — 의료 개인정보 처리

## 11. 글·SNS·마케팅·영상

- ★ `article-writing` — 블로그·안내서·뉴스레터 같은 긴 글 쓰기 (한국어 다듬기는 `korean-natural-writing` 우선)
- ★ `brand-voice` — 실제 게시물에서 말투 특징 뽑기
- ★ `content-engine` — X·링크드인·틱톡·유튜브 등 채널별 콘텐츠 체계
- ★ `crosspost` — 같은 글을 X·링크드인·스레드·블루스카이에 맞게 바꿔 올리기
- ★ `social-publisher` — 13개 SNS 예약 게시
- `x-api` — X(트위터) 글쓰기·읽기 API
- `marketing-campaign` — 캠페인 기획부터 실행까지
- `market-research` — 시장 조사·경쟁 분석
- `competitive-platform-analysis` — 경쟁 서비스 찾아 분류하기
- `benchmark-methodology` — 경쟁사를 9개 기준으로 점수화
- `competitive-report-structure` — 경쟁사 점수표를 의사 결정용 보고서로
- `brand-discovery` — 여러 번에 나눠 하는 브랜드 정체성 인터뷰
- `lead-intelligence` — 영업 대상 찾기와 연락 흐름
- `connections-optimizer` — X·링크드인 인맥 정리
- `social-graph-ranker` — 소개받을 만한 인맥 순위 매기기
- `investor-materials` — 투자 제안서·한 장 요약
- `investor-outreach` — 투자자 연락 메일
- `video-editing` — 실제 촬영 영상 편집 흐름
- `videodb` — 영상·음성 색인·검색·편집
- `remotion-video-creation` — React로 영상 만들기
- `manim-video` — 개념 설명 애니메이션 영상
- `fal-ai-media` — 이미지·영상·음성 생성
- `taste` — 뮤직비디오·짧은 영상의 연출 방향
- `taste-distillation` — 참고 영상에서 색감·편집 스타일 추출
- `taste-application` — 추출한 스타일로 새 영상 만들기
- `tasteforge-video` — 이미지·영상·3D 자료 찾기와 취향 인터뷰
- `blender-motion-state-inspection` — Blender 캐릭터 동작 점검
- `openclaw-persona-forge` — OpenClaw 에이전트 성격 설정 (중국어)
- ● `deep-research` — 여러 웹 출처를 인용한 조사 보고서 (`anthropic-skills:deep-research`)
- `exa-search` — Exa로 웹·코드·회사 검색
- `research-ops` — 최신 상태를 증거 중심으로 조사

## 12. 업무 자동화

- `email-ops` — 메일함 분류·답장 초안·발송 확인 (보내기 전 항상 확인)
- `messages-ops` — 문자·메신저 읽고 정리
- `google-workspace-ops` — 구글 드라이브·문서·시트·슬라이드 함께 다루기
- `unified-notifications-ops` — GitHub·Linear·데스크톱 알림을 하나로
- `operator-approval-loop` — AI가 쓴 외부 발송물을 사람이 승인하는 절차
- `counterparty-channel-discipline` — 채널별 응대 규칙과 기록
- `customer-billing-ops` — 구독·환불·결제 문의 처리
- `finance-billing-ops` — 매출·가격·환불 사실 확인
- `data-scraper-agent` — 공개 자료 자동 수집 에이전트
- `nutrient-document-processing` — 문서 변환·문자 인식·가리기·서명
- `esign-field-placement` — 전자서명 칸 위치 정하기
- `master-agreement-generator` — 계약서 초안 만들기
- `visa-doc-translate` — 비자 서류 사진 번역
- `opensource-pipeline` — 비공개 프로젝트를 비밀값을 빼고 공개용으로 복사·정리·포장

## 13. 특정 산업 전문 지식

- 의료: `healthcare-cdss-patterns`(처방 판단 지원), `healthcare-emr-patterns`(전자 의무기록), `healthcare-eval-harness`(환자 안전 평가)
- 물류·유통·제조: `carrier-relationship-management`(운송사 관리), `customs-trade-compliance`(통관), `inventory-demand-planning`(수요 예측), `logistics-exception-management`(배송 사고), `returns-reverse-logistics`(반품), `production-scheduling`(생산 일정), `quality-nonconformance`(품질 부적합)
- 에너지: `energy-procurement`(전기·가스 구매)
- 예측시장: `prediction-market-oracle-research`, `prediction-market-risk-review`
- GPU 임대(Itô): `ito-baskets`, `ito-compute`, `ito-inference`, `ito-training`
- 과학·특허: `scientific-db-pubmed-database`(의학 논문), `scientific-db-uspto-database`(미국 특허), `scientific-pkg-gget`(유전체), `scientific-thinking-literature-review`(문헌 조사), `scientific-thinking-scholar-evaluation`(논문 평가)
- 집 네트워크: `homelab-network-setup`, `homelab-network-readiness`, `homelab-pihole-dns`, `homelab-vlan-segmentation`, `homelab-wireguard-vpn`
- 네트워크 장비: `cisco-ios-patterns`, `netmiko-ssh-automation`, `network-bgp-diagnostics`, `network-config-validation`, `network-interface-health`

## 에이전트 68개 (`/ecc agent <이름>`)

특정 역할을 맡은 하위 Claude입니다. 부르면 그 역할 지침으로 별도 작업을 맡깁니다.

- 계획·설계: `planner`(복잡한 기능 계획), `architect`(시스템 설계), `code-architect`(기존 패턴에 맞춘 기능 설계), `code-explorer`(기존 기능 실행 흐름 추적), `spec-miner`(기존 코드에서 동작 명세 뽑기), `type-design-analyzer`(타입 설계 평가)
- 검토: ★ `code-reviewer`(품질·보안 검토), ★ `security-reviewer`(보안 취약점), ★ `silent-failure-hunter`(삼켜진 오류·조용한 실패 찾기), `pr-test-analyzer`(PR 테스트 충분성), `comment-analyzer`(주석 정확성), `code-simplifier`(코드 단순화), `refactor-cleaner`(안 쓰는 코드 정리), `database-reviewer`(PostgreSQL), `rag-pipeline-reviewer`(검색 기반 AI), `mle-reviewer`(머신러닝), `healthcare-reviewer`(의료), `agent-evaluator`(AI 결과 5개 기준 채점)
- 언어별 검토: `typescript-reviewer`, `react-reviewer`, `vue-reviewer`, `python-reviewer`, `django-reviewer`, `fastapi-reviewer`, `go-reviewer`, `rust-reviewer`, `java-reviewer`, `kotlin-reviewer`, `swift-reviewer`, `flutter-reviewer`, `cpp-reviewer`, `csharp-reviewer`, `fsharp-reviewer`, `php-reviewer`
- 빌드 오류 고치기: `build-error-resolver`(TypeScript), `react-build-resolver`, `django-build-resolver`, `go-build-resolver`, `rust-build-resolver`, `java-build-resolver`, `kotlin-build-resolver`, `swift-build-resolver`, `dart-build-resolver`, `cpp-build-resolver`, `pytorch-build-resolver`, `harmonyos-app-resolver`
- 테스트·성능: `tdd-guide`(테스트 먼저 쓰기), `e2e-runner`(브라우저 전체 흐름 테스트), `performance-optimizer`(성능 병목)
- 문서·조사: `doc-updater`(문서·코드 지도 갱신), `docs-lookup`(최신 공식 문서 찾기), `conversation-analyzer`(대화 기록에서 반복 행동 찾기)
- 운영·자동화: `loop-operator`(자율 반복 실행 감시), `harness-optimizer`(에이전트 설정 신뢰성·비용 개선), `chief-of-staff`(메일·메신저 분류)
- GAN 방식 3인조: `gan-planner`(명세 확장), `gan-generator`(구현), `gan-evaluator`(실제 앱으로 평가)
- 공개 저장소 만들기: `opensource-forker`(비밀값 빼고 복사), `opensource-sanitizer`(유출 점검), `opensource-packager`(공개 패키지 문서)
- 기타: `marketing-agent`(마케팅 기획·문구), `seo-specialist`(검색 노출), `a11y-architect`(● 접근성, `wcag22-vibe-coding`), `homelab-architect`, `network-architect`, `network-config-reviewer`, `network-troubleshooter`

## 명령 94개 (`/ecc command <이름>`)

대부분 위 스킬·에이전트를 순서대로 부르는 바로가기입니다.

- 계획·개발: `plan`, `plan-prd`, `plan-canvas`, `feature-dev`, `project-init`, `multi-plan`, `multi-execute`, `multi-workflow`, `multi-frontend`, `multi-backend`, `model-route`, `aside`
- orch 묶음: `orch-add-feature`, `orch-change-feature`, `orch-fix-defect`, `orch-refine-code`, `orch-build-mvp`, `orch-review`
- PRP 묶음(요구서→계획→구현→커밋→PR): `prp-prd`, `prp-plan`, `prp-implement`, `prp-commit`, `prp-pr`
- 에픽 관리: `epic-decompose`, `epic-claim`, `epic-review`, `epic-validate`, `epic-sync`, `epic-publish`, `epic-unblock`
- 검토·품질: `code-review`, `review-pr`, `pr`, `quality-gate`, `test-coverage`, `security-scan`, `santa-loop`, `refactor-clean`, `build-fix`
- 언어별 빌드·검토·테스트: `go-build`, `go-review`, `go-test`, `rust-build`, `rust-review`, `rust-test`, `kotlin-build`, `kotlin-review`, `kotlin-test`, `gradle-build`, `cpp-build`, `cpp-review`, `cpp-test`, `flutter-build`, `flutter-review`, `flutter-test`, `react-build`, `react-review`, `react-test`, `vue-review`, `python-review`, `fastapi-review`
- 문서: `update-docs`, `update-codemaps`
- 세션·기억: `save-session`, `resume-session`, `sessions`, `checkpoint`, `projects`, `promote`, `prune`
- 학습(ECC 훅 필요, 사용 안 함): `learn`, `learn-eval`, `evolve`, `instinct-status`, `instinct-export`, `instinct-import`
- 반복 실행: `loop-start`, `loop-status`
- 훅 규칙(ECC 훅 필요): `hookify`, `hookify-configure`, `hookify-help`, `hookify-list`
- 스킬: `skill-create`, `skill-health`
- 기타: `gan-build`, `gan-design`, `marketing-campaign`, `jira`, `cost-report`, `harness-audit`, `pm2`, `setup-pm`, `ecc-guide`, `auto-update`(사용 안 함)

## 부록: 최신 main에만 있는 스킬 18개

v2.2.3 이후에 추가돼 아직 카탈로그에 없습니다. 쓰려면 카탈로그를 새 태그로 업데이트해야 합니다.

★ `change-impact`(바꾸기 전 영향 범위 조사), ★ `prompt-caching-strategy`(AI 호출 캐시로 비용 절감), `mcp-dependency-review`(MCP 설정의 버전 미고정 점검), `conventional-commit-review`(커밋 메시지 초안), `module-regression`(큰 저장소 회귀 장부), `test-collaboration`(테스트 자산 정리), `story-lifecycle`(에픽→스토리→스프린트 흐름), `brownfield-retrospective`(기존 프로젝트에 절차 소급 적용), `context-and-decisions`(맥락·결정 문서 관리), `docs-governance`(문서 관리 요청 안내), `agent-security-hardening`(에이전트 보안 강화), `agent-runtime-gateway-smoke-test`(에이전트 연결 점검), `osint-investigation`(공개 정보 추적), `skill-host-compat`(스킬 호환성 검사), `token-card`(사용량 카드), `deepseek-harness-setup`(DeepSeek용 설치), `mybatis-patterns`(MyBatis), `bengali-nlp`(벵골어 처리)
