import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { defaultAvatar, plusIcon } from '@/shared/ui'
import styles from './MspProjectsPage.module.css'

const projects = [
  {
    id: 'a-shopping',
    name: 'A쇼핑몰',
    manager: '김민수',
    stage: '접수됨',
    cost: '-',
    updated: '2026.11.05',
  },
  {
    id: 'b-logistics',
    name: 'B물류',
    manager: '이수진',
    stage: '분석 완료',
    cost: '$1,850',
    updated: '2026.11.03',
  },
  {
    id: 'c-clinic',
    name: 'C클리닉',
    manager: '최유나',
    stage: '추천 완료',
    cost: '$920',
    updated: '2026.10.30',
  },
  {
    id: 'd-commerce',
    name: 'D커머스',
    manager: '정태오',
    stage: '접수됨',
    cost: '-',
    updated: '2026.10.28',
  },
]

const steps = [
  { key: 'answers', label: '고객 답변 확인' },
  { key: 'requirements', label: '요구사항 입력' },
  { key: 'aws', label: 'AWS 연결' },
  { key: 'analysis', label: '인프라 분석' },
  { key: 'recommendation', label: '추천 생성' },
]

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Link to="/msp/projects" className={styles.logo}>
        Wayco
      </Link>
      <button className={styles.newRequest}>
        <img src={plusIcon} alt="" />새 의뢰 시작
      </button>
      <div className={styles.divider} />
      <Link className={styles.projectNav} to="/msp/projects">
        <span>▣</span>프로젝트
      </Link>
      <span className={styles.recentLabel}>최근 프로젝트</span>
      {projects.slice(0, 3).map((project) => (
        <Link
          key={project.id}
          className={styles.recentProject}
          to={`/msp/projects/${project.id}/answers`}
        >
          <span>{project.name}</span>
          <small>{project.stage}</small>
        </Link>
      ))}
      <div className={styles.user}>
        <img src={defaultAvatar} alt="" />
        <b>testUser</b>
      </div>
    </aside>
  )
}

function Progress({ active }: { active: string }) {
  const activeIndex = steps.findIndex((step) => step.key === active)
  return (
    <aside className={styles.progress}>
      <h2>진행 순서</h2>
      {steps.map((step, index) => {
        const done = index < activeIndex
        return (
          <div
            key={step.key}
            className={index === activeIndex ? styles.activeStep : done ? styles.doneStep : ''}
          >
            <span className={styles.stepIcon}>{done ? '✓' : ''}</span>
            {step.label}
          </div>
        )
      })}
    </aside>
  )
}

function ProjectList() {
  const [filter, setFilter] = useState('전체')
  const shown = useMemo(
    () => (filter === '전체' ? projects : projects.filter((p) => p.stage === filter)),
    [filter],
  )
  return (
    <main className={styles.listMain}>
      <header className={styles.listHeader}>
        <div>
          <h1>프로젝트</h1>
          <p>고객이 등록한 서비스와 직접 만든 의뢰가 함께 보여요</p>
        </div>
        <button>새 의뢰 시작</button>
      </header>
      <div className={styles.filters}>
        {['전체', '접수됨', '분석 완료', '추천 완료'].map((item) => (
          <button
            key={item}
            className={filter === item ? styles.selected : ''}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.table} role="table">
        <div className={styles.tableHeader}>
          <span>고객사</span>
          <span>담당자</span>
          <span>진행 단계</span>
          <span>월 비용</span>
          <span>최근 수정</span>
        </div>
        {shown.map((project) => (
          <Link
            to={`/msp/projects/${project.id}/answers`}
            className={styles.tableRow}
            key={project.id}
          >
            <b>{project.name}</b>
            <span>{project.manager}</span>
            <span>
              <i className={styles[`stage${project.stage.replace(' ', '')}`]}>{project.stage}</i>
            </span>
            <span>{project.cost}</span>
            <span>{project.updated}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}

const Section = ({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) => (
  <section className={styles.answerSection}>
    <h3>
      <em>{number}</em>
      {title}
    </h3>
    {children}
  </section>
)
const Row = ({
  label,
  children,
  muted = false,
}: {
  label: string
  children: React.ReactNode
  muted?: boolean
}) => (
  <div className={styles.answerRow}>
    <span>{label}</span>
    <b className={muted ? styles.muted : ''}>{children}</b>
    <span className={styles.edit}>⌕</span>
  </div>
)

function Answers() {
  return (
    <>
      <PageTitle
        title="A쇼핑몰 · 의류 쇼핑몰"
        sub="고객 답장과 최근 수정일 2026.11.05"
        badge="접수됨"
      />
      <Section number="01" title="무엇을 바라시나요">
        <Row label="고민">
          월 클라우드 비용이 너무 많이 나와요. 세일 때 말고는 서버가 남는 것 같아요
        </Row>
        <Row label="받고 싶은 결과">요금 절감, 안 멈추는 구조, 관리 편한 구조</Row>
        <Row label="우선순위">요금 절감 &gt; 안 멈추는 구조 &gt; 관리 편한 구조</Row>
        <Row label="월 비용">줄였으면 좋겠어요</Row>
      </Section>
      <Section number="02" title="어떤 서비스인가요">
        <Row label="서비스 이름">의류 쇼핑몰</Row>
        <Row label="소개">자체 브랜드 의류를 파는 온라인 쇼핑몰이에요</Row>
        <Row label="하루 사용자">1만~10만 명</Row>
        <Row label="몰리는 때">저녁, 세일·이벤트 때</Row>
        <Row label="1년 뒤">2배쯤 늘 것 같아요</Row>
      </Section>
      <Section number="03" title="꼭 지켜야 할 것">
        <Row label="멈췄을 때 영향">매출이나 고객에게 바로 영향이 있어요</Row>
        <Row label="허용 범위">최대 1시간 멈춤, 데이터는 몇 분 전까지</Row>
        <Row label="개인정보">네, 회원 이름, 연락처, 주소</Row>
        <Row label="규정·인증">잘 모르겠어요</Row>
        <Row label="손대면 안 되는 부분">결제 시스템</Row>
        <Row label="변화 허용">잠깐 중단은 괜찮아요, 관리형 전환·서버 변경은 맡길게요</Row>
        <Row label="서버 관리" muted>
          아직 답하지 않았어요
        </Row>
      </Section>
    </>
  )
}

function PageTitle({ title, sub, badge }: { title: string; sub: string; badge?: string }) {
  return (
    <header className={styles.pageTitle}>
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {badge && <span>{badge}</span>}
    </header>
  )
}
const Field = ({
  title,
  children,
  wide = false,
}: {
  title: string
  children: React.ReactNode
  wide?: boolean
}) => (
  <section className={`${styles.field} ${wide ? styles.wide : ''}`}>
    <h3>{title}</h3>
    {children}
  </section>
)

function Requirements() {
  return (
    <>
      <PageTitle title="요구사항 입력" sub="고객 답변을 참고해 새 추천에 쓸 요구사항을 정리해요" />
      <Field title="요구사항 내용" wide>
        <textarea defaultValue="세일 기간 외 유휴 서버 비용을 줄이고, 결제 데이터베이스 장애에 대비해야 해요. 결제 시스템은 변경 불가해요." />
      </Field>
      <Field title="우선순위" wide>
        <p>앞에 둘수록 중요해요</p>
        <div className={styles.chips}>
          <button>1 비용</button>
          <button>2 안정성</button>
          <button>성능</button>
          <button>보안</button>
        </div>
      </Field>
      <div className={styles.fieldGrid}>
        <Field title="월 예산 (선택)">
          <div className={styles.input}>
            금액 입력 <b>KRW</b>
          </div>
        </Field>
        <Field title="개인정보 포함 여부">
          <div className={styles.chips}>
            <button>예</button>
            <button className={styles.off}>아니오</button>
          </div>
        </Field>
      </div>
      <Field title="변경하면 안 되는 리소스 (선택)" wide>
        <input defaultValue="결제 시스템" />
      </Field>
      <Field title="원하는 구조 (선택)" wide>
        <input placeholder="특별히 원하는 구조가 있으면 입력" />
      </Field>
    </>
  )
}

function Aws() {
  return (
    <>
      <PageTitle
        title="AWS 연결"
        sub="고객사 계정에 읽기 전용 Role을 만들면 비용과 사용량을 분석할 수 있어요"
      />
      <Field title="1. 고객사에 전달할 정보" wide>
        <p>고객사 담당자가 이 값으로 Role의 신뢰 정책을 만들어요</p>
        <div className={styles.kv}>
          <span>우리 계정 ID</span>
          <b>111122223333</b>
          <button>복사</button>
          <span>External ID</span>
          <b>wayco-a1b2c3d4e5</b>
          <button>복사</button>
        </div>
        <pre>{`{"Principal":{"AWS":"arn:aws:iam::111122223333:root"},\n "Action":"sts:AssumeRole",\n "Condition":{"StringEquals":{"sts:ExternalId":"wayco-a1b2c3d4e5"}}}`}</pre>
      </Field>
      <Field title="2. 고객사에서 받은 Role ARN 등록" wide>
        <input defaultValue="arn:aws:iam::444455556666:role/WaycoReadOnly" />
        <button className={styles.secondary}>Role ARN 등록</button>
      </Field>
      <Field title="3. 연결 테스트" wide>
        <p>읽기 권한까지 되는지 확인해요</p>
        <button className={styles.secondary}>연결 테스트</button>
        <span className={styles.connected}>연결됨</span>
      </Field>
      <Field title="Terraform state 올리기 (선택)" wide>
        <p>리소스 구조만 추가해요. 사용률과 비용은 계산하지 않아요</p>
        <button className={styles.secondary}>tfstate 파일 선택</button>
      </Field>
    </>
  )
}

function Analysis() {
  return (
    <>
      <PageTitle
        title="인프라 분석 결과"
        sub="최근 14일 사용률과 온디맨드 정가 기준 추정 비용이에요"
      />
      <div className={styles.metrics}>
        <div>
          <span>월 예상 비용</span>
          <b>$4,200</b>
        </div>
        <div>
          <span>EC2</span>
          <b>10대</b>
        </div>
        <div>
          <span>평균 CPU</span>
          <b>12%</b>
        </div>
        <div>
          <span>RDS</span>
          <b>1개</b>
        </div>
      </div>
      <div className={styles.resourceTable}>
        <div>
          <span>리소스</span>
          <span>스펙</span>
          <span>14일 평균 / p95</span>
          <span>월 비용</span>
        </div>
        {[
          ['EC2 웹·앱 서버 10대', 'm5.2xlarge', 'CPU 12% / 38%', '$2,600'],
          ['RDS 결제 DB', 'db.r5.large, Single-AZ', 'CPU 34% / 61%', '$900'],
          ['NAT Gateway, Load Balancer', 'NAT 2개, ALB 1개', '-', '$400'],
          ['S3, EBS', 'gp2 스토리지 포함', '-', '$300'],
        ].map((r) => (
          <div key={r[0]}>
            {r.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        ))}
      </div>
      <Field title="추천 구조 개수" wide>
        <p>1~5개까지 만들 수 있고, 1~2.5분 걸려요</p>
        <div className={styles.chips}>
          <button className={styles.off}>1개</button>
          <button className={styles.off}>3개</button>
          <button>5개</button>
        </div>
      </Field>
    </>
  )
}

function Detail({ step }: { step: string }) {
  const navigate = useNavigate()
  const index = Math.max(
    0,
    steps.findIndex((s) => s.key === step),
  )
  const projectId = useParams().projectId ?? 'a-shopping'
  const content =
    step === 'requirements' ? (
      <Requirements />
    ) : step === 'aws' ? (
      <Aws />
    ) : step === 'analysis' ? (
      <Analysis />
    ) : (
      <Answers />
    )
  return (
    <>
      <main className={styles.detailMain}>
        {content}
        <footer className={styles.footer}>
          {index > 0 && (
            <button
              className={styles.back}
              onClick={() => navigate(`/msp/projects/${projectId}/${steps[index - 1].key}`)}
            >
              이전
            </button>
          )}
          <button
            onClick={() =>
              navigate(`/msp/projects/${projectId}/${steps[Math.min(index + 1, 4)].key}`)
            }
          >
            {index === 0
              ? '요구사항 입력'
              : index === 1
                ? '저장하고 AWS 연결로'
                : index === 2
                  ? '인프라 분석 시작'
                  : '추천 생성'}
          </button>
        </footer>
      </main>
      <Progress active={step} />
    </>
  )
}

export function MspProjectsPage() {
  const { projectId, step = 'answers' } = useParams()
  return (
    <div className={styles.page}>
      <Sidebar />
      {projectId ? <Detail step={step} /> : <ProjectList />}
    </div>
  )
}
