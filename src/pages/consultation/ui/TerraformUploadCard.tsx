import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { TERRAFORM_ACCEPT, useUploadTerraform, validateTerraformFile } from '@/entities/analysis'
import { ApiError } from '@/shared/api'
import { closeIcon, infoCircleIcon, uploadIcon } from '@/shared/ui'
import card from './ActionCard.module.css'
import styles from './TerraformUploadCard.module.css'

/** 413: 서버(또는 프록시)가 허용하는 크기를 넘었을 때 */
const TOO_LARGE_STATUS = 413

function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
  }
  return error.status === TOO_LARGE_STATUS
    ? '파일이 서버가 받을 수 있는 크기를 넘었어요. 5MB 이하 파일을 올려 주세요.'
    : error.message
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)}KB`
  return `${Math.round(bytes / 1024 ** 2)}MB`
}

function extensionOf(name: string) {
  const ext = name.split('.').pop()
  return ext && ext !== name ? ext.toUpperCase() : 'FILE'
}

interface TerraformUploadCardProps {
  /** 파일을 올릴 프로젝트(의뢰) */
  projectId: number
  done: boolean
  /** 완료된 카드에 보여줄, 분석에 쓴 파일 */
  savedFile?: { name: string; size: number }
  /** 서버가 파일을 받아 구조를 읽는 데 성공하면 호출한다 */
  onStart: (file: File) => void
}

/**
 * Terraform state 파일 업로드 카드.
 * 서버가 올린 파일에서 리소스 구조를 바로 읽어 응답하므로 별도 분석 작업(job) 없이 한 번에 끝난다.
 */
export function TerraformUploadCard({
  projectId,
  done,
  savedFile,
  onStart,
}: TerraformUploadCardProps) {
  const upload = useUploadTerraform(projectId)
  const [pickedFile, setPickedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  // 완료된 카드는 저장된 파일 정보를 보여준다
  const file = pickedFile ?? (done ? savedFile : undefined)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isUploading = upload.isPending

  /** 올릴 수 있는 파일만 받는다. 안 되면 이유를 보여주고 이전에 고른 파일은 그대로 둔다 */
  const pick = (candidate: File) => {
    const problem = validateTerraformFile(candidate)
    setFileError(problem ?? '')
    if (problem) return
    upload.reset()
    setPickedFile(candidate)
  }

  const removeFile = () => {
    upload.reset()
    setFileError('')
    setPickedFile(null)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    if (picked) pick(picked)
    event.target.value = '' // 같은 파일을 다시 골라도 change가 일어나게
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) pick(dropped)
  }

  const handleStart = () => {
    if (!pickedFile) return
    upload.mutate(pickedFile, { onSuccess: () => onStart(pickedFile) })
  }

  return (
    <div className={[card.card, done && card.done].filter(Boolean).join(' ')}>
      <input
        ref={inputRef}
        type="file"
        accept={TERRAFORM_ACCEPT}
        hidden
        onChange={handleChange}
        aria-label="Terraform state 파일 선택"
      />
      {file ? (
        <div className={styles.file}>
          <div className={styles.fileMain}>
            <span className={styles.thumb}>{extensionOf(file.name)}</span>
            <div className={styles.fileText}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
            </div>
          </div>
          {!done && (
            <button
              type="button"
              className={styles.remove}
              aria-label="파일 삭제"
              disabled={isUploading}
              onClick={removeFile}
            >
              <img src={closeIcon} alt="" width={12} height={12} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={[styles.dropzone, isDragging && styles.dragging].filter(Boolean).join(' ')}
          disabled={done}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <img src={uploadIcon} alt="" width={24} height={25} />
          파일을 끌어다 놓거나 클릭
          <span className={styles.dropzoneHint}>.tfstate · 최대 5MB</span>
        </button>
      )}
      <p className={card.hint}>
        <img src={infoCircleIcon} alt="" width={16} height={16} />
        업로드한 파일은 분석에만 사용돼요
      </p>
      {(fileError || upload.isError) && (
        <p className={card.error} role="alert">
          {fileError || errorMessage(upload.error)}
        </p>
      )}
      <button
        type="button"
        className={[card.primaryButton, done && card.completed].filter(Boolean).join(' ')}
        disabled={done || !pickedFile || isUploading}
        onClick={handleStart}
      >
        {isUploading ? '분석 중...' : upload.isError ? '다시 시도' : '분석 시작'}
      </button>
    </div>
  )
}
