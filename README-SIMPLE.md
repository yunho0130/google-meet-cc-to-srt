# Google Meet CC Capturer - 간단 버전

Google Meet의 자막(CC)을 캡처하여 텍스트/SRT 파일로 다운로드하는 심플한 Chrome 확장 프로그램입니다.

**API 불필요** - OpenAI나 Gemini API 없이 Meet의 자막만 캡처합니다.

## ✨ 주요 기능

- ✅ Google Meet 자막 실시간 캡처
- ✅ TXT 형식으로 다운로드
- ✅ SRT 자막 형식으로 다운로드
- ✅ 타임스탬프 포함
- ✅ API 키 불필요
- ✅ 완전 무료

## 🚀 설치 방법

### 1. 파일 준비

기존 `manifest.json`을 백업하고 `manifest-simple.json`으로 교체:

```bash
# 백업
mv manifest.json manifest-api.json

# 심플 버전으로 교체
mv manifest-simple.json manifest.json
```

### 2. Chrome에 로드

1. Chrome에서 `chrome://extensions/` 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 이 폴더 선택

## 📖 사용 방법

### 1. Google Meet 회의 참여

1. Google Meet 회의에 참여합니다
2. **중요:** 하단의 CC(자막) 버튼을 클릭하여 자막을 활성화합니다

   ![CC Button](https://i.imgur.com/example.png)

### 2. 캡처 시작

확장 프로그램 아이콘을 클릭하고:

1. "캡처 시작" 버튼 클릭
2. 회의 진행 중 자막이 자동으로 캡처됨
3. 우측 하단에 캡처 패널이 표시됨

### 3. 캡처 중지 및 다운로드

1. "캡처 중지" 버튼 클릭
2. "📄 TXT 다운로드" 또는 "🎬 SRT 다운로드" 선택
3. 파일이 자동으로 다운로드됨

## 📁 파일 형식

### TXT 형식
```
[00:00:15] 안녕하세요 여러분
[00:00:18] 오늘 회의를 시작하겠습니다
[00:00:22] 첫 번째 안건은...
```

### SRT 형식
```
1
00:00:15,000 --> 00:00:18,000
안녕하세요 여러분

2
00:00:18,000 --> 00:00:22,000
오늘 회의를 시작하겠습니다
```

## 🎯 주요 특징

### 장점
- ✅ **API 불필요**: OpenAI/Gemini API 키 없이 사용 가능
- ✅ **완전 무료**: 사용 제한 없음
- ✅ **빠른 속도**: 실시간 자막 캡처
- ✅ **심플함**: 복잡한 설정 불필요

### 제한 사항
- ⚠️ **자막 필수**: Google Meet에서 CC를 활성화해야 함
- ⚠️ **자막 정확도**: Google의 자막 인식 정확도에 의존
- ⚠️ **한국어 제한**: Google Meet 자막이 한국어를 완벽히 지원하지 않을 수 있음

## 🔧 문제 해결

### Q: "CC container not found" 에러가 발생해요
**A:** Google Meet에서 CC(자막) 버튼을 먼저 활성화해주세요.

### Q: 자막이 캡처되지 않아요
**A:**
1. CC 버튼이 활성화되어 있는지 확인
2. 페이지를 새로고침하고 다시 시도
3. Chrome 확장 프로그램을 재로드

### Q: 다운로드한 파일이 비어있어요
**A:** 캡처가 시작된 후에 말한 내용만 캡처됩니다. 캡처 시작 전 내용은 포함되지 않습니다.

### Q: SRT 파일의 시간이 정확하지 않아요
**A:** 자막이 표시되는 타이밍을 기준으로 하므로, 약간의 오차가 있을 수 있습니다.

## 📂 프로젝트 구조

```
google-meet-cc-to-srt/
├── manifest.json              # 확장 프로그램 설정
├── content/
│   ├── meet-cc-simple.js     # 자막 캡처 로직
│   └── meet-cc-simple.css    # 캡처 패널 스타일
├── popup/
│   ├── popup-simple.html     # 팝업 UI
│   └── popup-simple.js       # 팝업 로직
└── assets/
    └── icons/                 # 확장 프로그램 아이콘
```

## 🆚 API 버전과의 비교

| 기능 | 심플 버전 | API 버전 |
|------|-----------|----------|
| API 키 필요 | ❌ 불필요 | ✅ 필요 |
| 비용 | 무료 | API 사용량에 따라 과금 |
| 정확도 | Google 자막 | 매우 높음 (Whisper/Gemini) |
| 속도 | 실시간 | 약간 지연 |
| CC 필수 | ✅ 필수 | ❌ 불필요 |

## 🔄 API 버전으로 전환하기

고품질 음성 인식이 필요한 경우:

```bash
# 심플 버전 백업
mv manifest.json manifest-simple.json

# API 버전으로 전환
mv manifest-api.json manifest.json

# Chrome에서 확장 프로그램 재로드
```

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR을 환영합니다!

## 💬 지원

문제가 발생하면 GitHub Issues에 등록해주세요.

---

**Made with ❤️ for simple, free meeting transcription**
