/** 프로젝트(상담) 화면 경로. 라우트 이름이 바뀌면 이 파일만 고친다 */
export const projectPath = (projectId: number): string => `/projects/${projectId}`

/** 추천 결과 화면 경로 */
export const projectResultPath = (projectId: number): string => `/projects/${projectId}/result`

/** 엔지니어용 프로젝트 목록·단계별 워크플로 */
export const MSP_PROJECTS_PATH = '/msp/projects'

/** 고객이 접수한 답변을 읽기 전용으로 보는 화면 */
export const projectAnswersPath = (projectId: number): string =>
  `${MSP_PROJECTS_PATH}/${projectId}/answers`
