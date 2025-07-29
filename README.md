# Notion-like Editor

TipTap 기반의 Notion과 유사한 리치 텍스트 에디터입니다.

## 특징

- 📝 Notion과 유사한 사용자 인터페이스
- ⚡ TipTap 에디터 기반의 고성능 편집 환경
- 🎨 다양한 블록 타입 지원 (헤딩, 리스트, 코드 블록, 이미지 등)
- 🤖 AI 통합 기능
- 🔗 실시간 협업 지원
- 📱 반응형 디자인

## 시작하기

### 설치

```bash
npm install
# 또는
yarn install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드

```bash
npm run build
# 또는
yarn build
```

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Editor**: TipTap
- **Styling**: SCSS, CSS Modules
- **State Management**: React Context

## 프로젝트 구조

```
├── app/                    # Next.js App Router
├── components/             # 컴포넌트
│   ├── tiptap-extension/   # TipTap 확장 기능
│   ├── tiptap-icons/       # 에디터 아이콘
│   ├── tiptap-node/        # 커스텀 노드
│   ├── tiptap-templates/   # 에디터 템플릿
│   ├── tiptap-ui/          # UI 컴포넌트
│   └── tiptap-ui-primitive/ # 기본 UI 컴포넌트
├── contexts/               # React Context
├── hooks/                  # 커스텀 훅
├── lib/                    # 유틸리티 함수
└── styles/                 # 글로벌 스타일
```

## 사용법

에디터는 다음과 같은 기능을 제공합니다:

- **슬래시 명령어**: `/`를 입력하여 블록 타입 선택
- **마크다운 단축키**: `#`, `*`, `-` 등을 사용한 빠른 포맷팅
- **드래그 앤 드롭**: 블록 순서 변경
- **AI 기능**: 텍스트 개선, 요약, 번역 등

## 배포

Vercel을 사용한 배포를 권장합니다:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

자세한 배포 가이드는 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 기여하기

프로젝트에 기여하고 싶으시다면:

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
