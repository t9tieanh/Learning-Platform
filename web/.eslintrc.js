/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
module.exports = {
  extends: [
    // Chúng ta sẽ dùng các rule mặc định từ các plugin mà chúng ta đã cài.
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    // Disable các rule mà eslint xung đột với prettier.
    // Để cái này ở dưới để nó override các rule phía trên!.
    'eslint-config-prettier',
    'prettier'
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    'src/components/ui/**/*'
  ],
  plugins: ['prettier'],
  settings: {
    react: {
      // Nói eslint-plugin-react tự động biết version của React.
      version: 'detect'
    },
    // Nói ESLint cách xử lý các import
    'import/resolver': {
      node: {
        paths: [path.resolve(__dirname)],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {
        project: path.resolve(__dirname, './tsconfig.json')
      }
    }
  },
  env: {
    node: true
  },
  rules: {
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
    'comma-dangle': 'off', // Tắt hoàn toàn rule này
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    '@typescript-eslint/no-unused-vars': 'warn', // Đổi thành warning
    'import/namespace': 'off',
    'jsx-a11y/alt-text': 'off',
    // Tắt rule yêu cầu import React trong file jsx
    'react/react-in-jsx-scope': 'off',
    // Cảnh báo khi thẻ <a target='_blank'> mà không có rel="noreferrer"
    'react/jsx-no-target-blank': 'warn',
    'typescript-eslint/no-explicit-any ': 'off',
    'eslint-disable-next-line': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Tăng cường một số rule prettier (copy từ file .prettierrc qua)
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',
        semi: false,
        trailingComma: 'none',
        tabWidth: 2,
        endOfLine: 'auto',
        useTabs: false,
        singleQuote: true,
        printWidth: 120,
        jsxSingleQuote: true
      }
    ]
  }
}
