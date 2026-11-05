import rolesImage from './assets/signup-roles.png'
import styles from './RoleSelection.module.css'

export type SignUpRole = 'customer' | 'engineer'

interface RoleSelectionProps {
  value?: SignUpRole
  onChange: (role: SignUpRole) => void
}

const ROLES = [
  {
    id: 'customer' as const,
    title: '고객',
    description: '우리 서비스의 인프라를 검토받고 싶어요',
  },
  {
    id: 'engineer' as const,
    title: '엔지니어 (MSP)',
    description: '고객사 인프라를 분석하고 구조를 설계해요',
  },
]

export function RoleSelection({ value, onChange }: RoleSelectionProps) {
  return (
    <div className={styles.roles} role="radiogroup" aria-label="가입 유형">
      {ROLES.map((role) => (
        <button
          key={role.id}
          type="button"
          role="radio"
          aria-checked={value === role.id}
          className={[styles.role, value === role.id && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange(role.id)}
        >
          <span className={styles.text}>
            <strong>{role.title}</strong>
            <span>{role.description}</span>
          </span>
          <span className={[styles.illustration, styles[role.id]].join(' ')} aria-hidden="true">
            <img src={rolesImage} alt="" />
          </span>
        </button>
      ))}
    </div>
  )
}
