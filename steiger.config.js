import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // 초기 단계라 slice 수가 적어 경고가 과하게 나옴. 구조가 잡히면 다시 켜기.
      'fsd/insignificant-slice': 'off',
    },
  },
])
