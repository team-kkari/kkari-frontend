/** 프로젝트(상담) 화면 경로. 라우트 이름이 바뀌면 이 파일만 고친다 */
export const projectPath = (projectId: number): string => `/projects/${projectId}`

/** 추천 결과 화면 경로 */
export const projectResultPath = (projectId: number): string => `/projects/${projectId}/result`
