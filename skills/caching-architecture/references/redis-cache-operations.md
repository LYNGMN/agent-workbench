# Redis 캐시 운영

Redis의 실제 버전, 배포 형태(standalone/cluster/managed), 공급자 제한을 먼저 확인한다. 캐시 데이터와 유실되면 안 되는 durable workload는 메모리·eviction·복구 요구가 다르므로 가능하면 분리한다.

## 메모리와 eviction

- `maxmemory`가 없거나 너무 크면 호스트 메모리 압박이 Redis 장애로 번질 수 있다.
- eviction policy는 접근 분포와 누락 허용 여부에 맞춘다. 정책 이름과 동작은 설치된 Redis 버전의 공식 문서를 확인한다.
- `INFO stats`의 `keyspace_hits`, `keyspace_misses`, `evicted_keys`와 `INFO memory`의 사용량·단편화를 함께 본다.
- hit ratio 하나만 높여도 큰 값 전송, 느린 명령, hot shard 문제는 남을 수 있다.

## 안전한 관찰 순서

1. `INFO stats`, `INFO memory`, `INFO commandstats`로 추세와 특정 명령 비용을 확인한다.
2. `SLOWLOG GET`과 latency monitoring 도구로 서버 내부 지연을 확인한다.
3. 복제본이나 부하가 낮은 창에서 `redis-cli --keystats`를 우선 검토한다. `--keystats`, `--bigkeys`, `--memkeys` 중 실제 버전이 지원하는 도구를 확인하고, 사용하지 않은 도구도 그 이유를 기록한다.
4. `redis-cli --hotkeys`는 LFU 계열 eviction 정책에서만 유효하다. LFU가 아니면 실행하지 않았다고 명시한다.
5. 도구의 스캔 부하와 관리형 서비스 지원 여부를 먼저 확인한다.

운영에서 `KEYS *`로 전체 키를 훑지 않는다. `MONITOR`는 모든 명령을 스트리밍해 성능을 크게 떨어뜨릴 수 있으므로 기본 진단 수단으로 쓰지 않는다. 키 이름이나 명령 인자에 개인정보·토큰이 있으면 출력과 저장도 제한한다.

## HotKey와 BigKey

| 구분 | 본질 | 증거 | 완화 |
|---|---|---|---|
| HotKey | 작은 키라도 요청이 한 키·한 shard에 집중 | 키별 접근 빈도, 노드별 CPU·네트워크 불균형 | 짧은 L1 로컬 캐시, request coalescing, 읽기 복제·안전한 키 복제/분산, 클라이언트 rate limit |
| BigKey | 한 키의 값·원소 수가 커 단일 명령이 무거움 | 타입별 크기·원소 수, 응답 크기, slowlog | 시간·사용자 범위로 분할, 범위 조회/SCAN 계열, 큰 전체 반환 금지, 점진적 마이그레이션 |

- 큰 hash/list/set에 `HGETALL` 같은 전체 조회를 피하고 필요한 필드나 범위만 읽는다.
- 큰 키를 동기 `DEL`하면 메인 실행 경로를 오래 막을 수 있다. 실제 버전과 복제·메모리 여유를 확인한 뒤 `UNLINK` 같은 비동기 삭제를 검토한다.
- 분할 전에 새 키 쓰기와 구 키 읽기의 전환 순서, 롤백, 메모리 일시 증가를 계산한다.

## stampede 진단

DB QPS가 TTL 주기와 같은 간격으로 치솟으면 HotKey나 BigKey와 별개로 동시 만료를 의심한다. 만료 시각 분포, miss 증가, 동일 키 원본 호출 수를 맞춰 본다. 완화는 freshness 예산 안의 TTL jitter, single-flight/제한된 lock, refresh-ahead이며, 원본 fallback에도 동시성 한도를 둔다.

## 검증

- 노드별 CPU, 네트워크, ops/sec, p95/p99, hit/miss, eviction, slowlog, 메모리·단편화 추세를 전후 비교한다.
- hot key 만료, big key 읽기·삭제, 한 노드 장애, cold cache를 재현한다.
- 성공 기준과 중단 기준을 먼저 정하고, 샘플링·진단 명령 자체의 부하를 관찰한다.

## 공식 자료

- [Redis key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis observability](https://redis.io/tutorials/operate/redis-at-scale/observability/)
- [Redis latency monitoring](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency-monitor/)
- [Redis UNLINK](https://redis.io/docs/latest/commands/unlink/)
