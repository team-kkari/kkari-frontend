import { useRef, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TERRAFORM_ACCEPT, useUploadTerraform, validateTerraformFile } from '@/entities/analysis'
import { projectQueries, type ProjectDetail } from '@/entities/project'
import { ApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib'
import { errorMessage } from '../../lib/error-message'
import { formatBytes } from '../../lib/format'
import { countResources } from '../../model/analysis-summary'
import { readTerraformMeta } from '../../model/terraform-meta'
import { Field } from '../Field'
import styles from '../MspProjectsPage.module.css'

/** 413: 서버(또는 프록시)가 허용하는 크기를 넘었을 때 */
const TOO_LARGE_STATUS = 413

interface UploadedFile {
  fileName: string
  size: number
  resourceCount: number
  skippedCount: number
}

/**
 * Terraform state 올리기 (선택). 서버가 올린 파일에서 리소스 구조만 읽어 바로 응답하므로
 * 별도 분석 작업 없이 한 번에 끝난다. 다시 올리면 교체된다.
 */
export function TerraformUpload({ project }: { project: ProjectDetail }) {
  const { projectId } = project
  const queryClient = useQueryClient()
  const upload = useUploadTerraform(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState('')
  // 이번 화면에서 방금 올린 파일. 없으면 서버에 저장된 정보(새로고침 후)를 보여준다
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null)
  const meta = readTerraformMeta(project)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // 같은 파일을 다시 골라도 change 가 일어나게
    if (!file) return

    const problem = validateTerraformFile(file)
    setFileError(problem ?? '')
    if (problem) return

    upload.reset()
    upload.mutate(file, {
      onSuccess: (infra) => {
        setUploaded({
          fileName: file.name,
          size: file.size,
          resourceCount: countResources(infra.resources ?? {}),
          skippedCount: infra.missing?.length ?? 0,
        })
        // 프로젝트 상세에 업로드 정보가 생기고 최근 수정 시각이 바뀐다
        void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
      },
    })
  }

  const uploadError = upload.isError
    ? upload.error instanceof ApiError && upload.error.status === TOO_LARGE_STATUS
      ? '파일이 서버가 받을 수 있는 크기를 넘었어요. 5MB 이하 파일을 올려 주세요.'
      : errorMessage(upload.error)
    : ''
  const hasFile = !!uploaded || meta.uploaded

  return (
    <Field title="Terraform state 올리기 (선택)" wide>
      <p>
        리소스 구조만 추가해요. 사용률과 비용은 계산하지 않아요. .tfstate 또는 .json 파일, 최대
        5MB까지 올릴 수 있고 다시 올리면 교체돼요
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={TERRAFORM_ACCEPT}
        hidden
        aria-label="Terraform state 파일 선택"
        onChange={handleChange}
      />
      <button
        type="button"
        className={styles.secondary}
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending
          ? '올리는 중…'
          : hasFile
            ? 'tfstate 파일 다시 올리기'
            : 'tfstate 파일 선택'}
      </button>
      {fileError && (
        <p className={styles.fieldError} role="alert">
          {fileError}
        </p>
      )}
      {uploadError && (
        <p className={styles.fieldError} role="alert">
          {uploadError}
        </p>
      )}
      {uploaded ? (
        <p className={styles.uploadInfo} role="status">
          <b>{uploaded.fileName}</b> ({formatBytes(uploaded.size)}) 올렸어요. 리소스{' '}
          {uploaded.resourceCount}개를 읽었어요
          {uploaded.skippedCount > 0 &&
            `. 지원하지 않아 제외한 항목이 ${uploaded.skippedCount}개 있어요`}
        </p>
      ) : (
        meta.uploaded && (
          <p className={styles.uploadInfo}>
            올려 둔 파일이 있어요
            {meta.fileName && (
              <>
                : <b>{meta.fileName}</b>
                {meta.size !== undefined && ` (${formatBytes(meta.size)})`}
              </>
            )}
            {meta.uploadedAt && ` · ${formatDate(meta.uploadedAt)} 업로드`}
          </p>
        )
      )}
    </Field>
  )
}
