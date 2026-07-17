# Tron (gulp-tron) — 한국어 요약

Tron은 Gulp 기반의 빌드 시스템으로, 작업(task) 관리와 스트림 기반 빌드 API를 제공합니다.

주요 기능:

- 작업 등록 및 관리(`task`, `createTasks`)
- 의존성 및 트리거(`dependsOn`, `triggers`)
- 자동 클리너(`addCleaner`) 및 워처(`addWatcher`)
- 패턴 기반 작업 선택(`selectTasks`, `selectTasksAll`)
- 스트림 빌드 API(`BuildStream`) — `src`, `dest`, `pipe`, `copy`, `clean` 등

시작하기:

```bash
npm install gulp-tron gulp
```

간단 사용 예:

```js
const { Tron } = require("gulp-tron");
const tron = new Tron();

tron.task("build", (bs) => bs.src("src/**/*.js").dest("dist"));
tron.addCleaner({ clean: ["dist"] });
tron.addWatcher();
```

자세한 문서는 상위 디렉터리의 영어 문서를 참고하세요.
