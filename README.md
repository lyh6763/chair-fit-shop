# 체어 핏

의자 추천부터 주문 내용 확인까지 체험하는 Next.js 시제품이다. 6개 질문에 답하면 추천 모델과 이유를 볼 수 있다. 최대 3개 모델을 비교하고, 상세 화면에서 색상과 수량을 정해 장바구니에 담는다. 주문 내용 확인 화면에서 선택한 옵션과 합계를 확인한다. 실결제와 주문 제출 기능은 범위 밖이다.

## 로컬에서 실행하기

Node.js 24 환경에서 `npm install` 후 `npm run dev`를 실행하고 `http://localhost:3000`을 연다. 프로덕션 빌드는 `npm run build`, 빌드한 사이트 실행은 `npm run start`를 쓴다.

설문 결과와 비교, 장바구니는 현재 브라우저의 저장소에 남는다. 입력 중인 설문은 세션 저장소에 남는다. 이 프로젝트는 `chair-fit-shop:` 접두사를 쓰고 별도의 저장소에서 관리한다.

저장된 설문 결과를 지우거나 되돌리면 다른 탭의 결과 화면에도 반영된다. 브라우저가 저장을 거부하면 현재 탭에서 결과를 볼 수 있으며, 새로고침하면 사라진다.

## 가상 의자

추천·비교·상세·매장·장바구니가 [상품 원본](src/data/chairs.ts)의 세 모델을 공통으로 읽는다. 가격·사양·출시일은 체험용 예시 값이다.

| 모델 ID | 이름 | 단가 | 좌판 높이 | 색상 ID |
| --- | --- | ---: | --- | --- |
| `desk-mesh` | 데스크 메쉬 체어 | 549,000원 | 425–525mm | `black`, `white` |
| `adjustable-mesh` | 조절형 메쉬 체어 | 829,000원 | 420–520mm | `black`, `gray` |
| `study-fabric` | 스터디 패브릭 체어 | 329,000원 | 420mm 고정 | `black`, `blue` |

## 추천·비교·장바구니에서 쓰는 값

- `chair.slug`를 모델 식별자로 사용한다. 추천 결과와 비교 링크의 모델 ID도 이 값이다. 표시 이름이 바뀌어도 ID는 유지한다.
- 비교표는 표 한 벌을 유지하며 컨테이너 폭이 42rem 이상이면 왼쪽 라벨 열을 표시한다. 더 좁은 상자에서는 항목 이름을 각 행 위에 둬 세 모델을 나란히 읽을 수 있다.
- 컴포넌트와 페이지는 [globals.css](src/app/globals.css)에 정의된 의미 색 토큰만 사용하며, 원시 색 클래스나 `var(--color-원시)` 참조가 다시 들어오면 `src/app/semantic-colors.test.ts`가 실패한다.
- 상품 단가는 `chair.price`에 원 단위 정수로 둔다. 색상별 단가는 동일하다. 비교표와 주문 확인의 가격은 상품 원본에서 조회한다.
- 장바구니의 [CartLine](src/lib/cart/types.ts)은 `chairSlug`, `colorSlug`, `quantity`를 담는다. 같은 모델과 색상은 한 줄로 합치며 옵션당 최대 99개까지 담을 수 있다. 읽을 수 없는 모델·색상이나 양의 정수가 아닌 수량은 목록에서 제외한다. 단가, 소계와 합계는 상품 원본의 가격으로 계산한다.

## 검증과 연결 기준

설문·비교와 상품 갤러리는 DUOBACK Fit의 배포 커밋 `73e568d`를 기반으로 가져왔다. 모델 이름·ID·가격을 새로 정하고, 세 모델에 해당하는 사진 24장을 새 ID에 연결했다.

Node.js 24에서 `node --test tests/catalog.test.mjs`로 모델 ID, 색상 ID와 단가를 검사한다.

Fit `73e568d`의 상품 스키마에 세 모델을 넣어 검증했다. 키 176cm·72kg의 사무용 예시는 예산 60만 원에서 `desk-mesh`, 100만 원에서 `adjustable-mesh`가 1위였다. 키 158cm·47kg의 학습용 예시는 `study-fabric`이 1위였다. 같은 데이터로 Fit 비교표의 가격 행을 만들었다. 장바구니 데이터 예시로 `desk-mesh` 화이트 2개와 `study-fabric` 블루 1개를 조회하면 합계는 1,427,000원이다.

로컬 검증은 `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run fonts:web -- --check` 순서로 실행한다. Playwright Chromium을 설치한 다음 `npm run test:e2e`로 설문부터 주문 확인까지 검증한다.

GitHub Actions는 기본 브랜치 `feat/recommendation-order-preview`의 푸시와 PR에서 품질 검사와 Lighthouse를 실행한다. 원본 Fit의 기획·화면 자료는 [기획 기록](docs/README.md)에 보관한다.

등록된 의자 상세는 빌드에서 미리 생성한다. 없는 모델은 상세와 공유 이미지 모두 HTTP 404로 응답한다. 상세의 404 화면에는 `noindex`를 붙이고, ‘의자 보기’ 링크로 목록에 돌아갈 수 있다.

Next.js 16.3.8의 프로덕션 서버는 `dynamicParams = false`인 상세 경로가 없는 모델을 거절할 때 `NoFallbackError`를 기록할 수 있다. 이 시제품에서 404 상태 코드와 오류 화면이 그대로 전달되는 것을 확인했다. [Next.js 이슈 #90537](https://github.com/vercel/next.js/issues/90537)
