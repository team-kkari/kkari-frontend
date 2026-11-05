import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { closeIcon, infoCircleIcon, uploadIcon } from '@/shared/ui'
import card from './ActionCard.module.css'
import styles from './TerraformUploadCard.module.css'

const ACCEPT = '.tfstate,.json,.zip'

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
  done: boolean
  /** 완료된 카드에 보여줄, 분석에 쓴 파일 */
  savedFile?: { name: string; size: number }
  onStart: (file: File) => void
}

export function TerraformUploadCard({ done, savedFile, onStart }: TerraformUploadCardProps) {
  const [pickedFile, setFile] = useState<File | null>(null)
  // 완료된 카드는 저장된 파일 정보를 보여준다
  const file = pickedFile ?? (done ? savedFile : undefined)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    if (picked) setFile(picked)
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
    if (dropped) setFile(dropped)
  }

  return (
    <div className={[card.card, done && card.done].filter(Boolean).join(' ')}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
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
              onClick={() => setFile(null)}
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
        </button>
      )}
      <p className={card.hint}>
        <img src={infoCircleIcon} alt="" width={16} height={16} />
        업로드한 파일은 분석에만 사용돼요
      </p>
      <button
        type="button"
        className={[card.primaryButton, done && card.completed].filter(Boolean).join(' ')}
        disabled={done || !file}
        onClick={() => pickedFile && onStart(pickedFile)}
      >
        분석 시작
      </button>
    </div>
  )
}
