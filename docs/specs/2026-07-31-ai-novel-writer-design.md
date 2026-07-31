# AI 辅助写小说软件 · 设计文档

- 日期:2026-07-31
- 状态:已通过设计评审,待编写实施计划
- 范围:MVP 核心闭环(编辑器 + AI 续写/改写 + 章节/卷管理 + 人物/设定库)

## 1. 背景与目标

开发一个桌面端的通用小说写作工具,以 AI 辅助续写与改写为核心能力,配套章节/卷管理与人物/设定库,帮助作者提升写作效率。

### 1.1 关键决策(已与用户确认)

| 维度 | 决策 |
|---|---|
| 目标场景 | 通用小说写作工具(续写 + 建议 + 结构管理) |
| 运行平台 | 桌面应用 |
| AI 模型来源 | 云端 LLM API 为主,预留本地模型接口 |
| MVP 功能 | AI 续写、AI 改写/润色、章节/卷管理、人物/设定库 |
| 技术方案 | 方案 A:Electron + React + TypeScript + TipTap + SQLite |

### 1.2 范围分解

完整的"AI 辅助写小说软件"含多个子系统。本期聚焦核心 MVP,后续子项目各自走 设计→计划→实现 循环:

- 本期(MVP):编辑器 + AI 续写/改写引擎 + 章节/卷管理 + 人物/设定库
- 后续:风格/连贯性检查、导出与发布(txt/docx/epub)、账户与云同步

## 2. 整体架构

采用 Electron 双进程架构。

### 2.1 渲染进程(React)

负责所有 UI:

- **编辑器**(TipTap):写作主区域,支持自定义"AI 续写块"节点。
- **项目/章节树**:卷→章两级的层级导航与拖拽排序。
- **人物/设定库面板**:角色卡、世界观设定的查看与编辑。
- **AI 侧边栏**:续写/改写指令入口、参数调节、生成结果预览。

### 2.2 主进程(Node.js)

负责重活,通过 IPC 暴露给渲染进程:

- **数据持久层**:SQLite(better-sqlite3,同步、快),存项目/章节/人物等。
- **AI Provider 服务**(核心):统一接口,云端实现调 LLM API 并处理流式 SSE;预留本地实现接口(日后接 Ollama)。
- **文件导入/导出**:txt/docx/epub(后续)。

### 2.3 关键架构原则

1. AI 调用走主进程而非渲染进程——避免暴露 API Key、绕过 CORS、便于流式处理与重试。
2. `AiProvider` 是抽象接口(`generate(ctx, opts) → AsyncIterable<string>`),云端/本地都实现它,切换不改业务代码。
3. IPC 用 contextBridge 暴露类型安全的 API 对象,渲染进程不直接 `require` 主进程模块。

### 2.4 目录结构

```
src/
  main/              # Electron 主进程
    db/              # SQLite 初始化、迁移、DAO
    ai/              # AiProvider 接口与云端实现
    services/        # 业务服务(项目、章节、人物、AI 调用编排)
    ipc/             # IPC handler 注册
  renderer/          # React 前端
    components/      # UI 组件
    editor/          # TipTap 编辑器与自定义节点
    stores/          # Zustand stores
    hooks/
  shared/            # 主进程与渲染进程共享的类型、常量
  preload/           # contextBridge 桥接
```

## 3. 数据模型

所有数据存于本地 SQLite。核心关系:`Project 1—N Volume 1—N Chapter`、`Project 1—N Character`、`Project 1—N Setting`。

### projects(小说项目)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| title | TEXT | 书名 |
| synopsis | TEXT | 简介/梗概 |
| genre | TEXT | 类型(玄幻/都市/…) |
| target_words | INTEGER | 目标字数 |
| created_at / updated_at | TEXT | ISO 时间 |

### volumes(卷)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | |
| project_id | FK→projects | |
| title | TEXT | 卷名 |
| sort_order | INTEGER | 排序 |

### chapters(章)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | |
| volume_id | FK→volumes | |
| title | TEXT | 章标题 |
| content | TEXT | TipTap JSON(含 AI 节点) |
| word_count | INTEGER | 正文字数 |
| sort_order | INTEGER | 排序 |
| status | TEXT | draft / done |
| updated_at | TEXT | |

### characters(人物卡)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | |
| project_id | FK→projects | |
| name | TEXT | 姓名 |
| role | TEXT | 主角/配角/反派 |
| appearance / personality / background | TEXT | 外貌/性格/背景 |
| relations | TEXT | 关系(自由文本) |

### settings(世界观设定)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | |
| project_id | FK→projects | |
| category | TEXT | 地点/势力/道具/规则 |
| name | TEXT | 名称 |
| description | TEXT | 描述 |

### ai_config(AI 配置,全局单行)

| 字段 | 类型 | 说明 |
|---|---|---|
| provider | TEXT | cloud / local |
| model | TEXT | 如 deepseek-chat |
| api_key | TEXT | 存主进程内存,不落渲染进程 |
| base_url | TEXT | 自定义端点 |

### 3.1 关键决策

1. **章节正文存 TipTap JSON** 而非纯文本——这样才能往返保留"AI 续写块"等自定义节点,且支持富文本格式。
2. **人物/设定独立于章节**,挂在 project 下,可被任意章节的 AI 上下文引用(续写时把相关人物卡塞进 prompt)。
3. **字数统计在保存时由主进程计算**并写回 chapter,避免渲染进程频繁重算。
4. 排序用 `sort_order` 整数,拖拽后批量重排(避免浮点数方案复杂度)。

## 4. AI 抽象层与生成流程

### 4.1 AiProvider 接口(主进程)

```ts
interface AiProvider {
  generate(ctx: GenerateContext, opts: GenOpts): AsyncIterable<string>
}

type GenerateContext = {
  task: 'continue' | 'rewrite'
  // 续写:当前章末尾文本;改写:选中文本
  sourceText: string
  instruction: string        // 用户指令(方向/字数/风格)
  characters: Character[]    // 相关人物卡
  settings: Setting[]        // 相关世界观设定
  styleSample?: string       // 风格样例(可选)
}
```

- `CloudProvider` 实现:调 LLM API,解析 SSE,逐 chunk `yield`。
- `LocalProvider`:预留空实现(日后接 Ollama),接口一致,业务无感切换。

### 4.2 上下文组装策略(决定生成质量)

- **续写**:`system(你是小说续写助手,保持人物性格与前文连贯)` + 人物卡摘要 + 相关设定 + 当前章末尾 ~2000 字 + 用户指令。
- **改写**:`system(按指令改写)` + 选中文本 + 前后各 ~500 字 + 指令(润色/扩写/缩写/换风格)。
- 人物/设定按"当前章提及的角色"筛选,避免全量塞入撑爆 token。

### 4.3 续写流程(6 步)

1. 用户在编辑器点"续写"并填指令 → IPC 调主进程 AI 服务。
2. AI 服务查数据库:当前章正文末尾 + 相关人物卡 + 设定。
3. 数据库返回上下文。
4. AI 服务组装 prompt,**流式调用**云端 LLM(核心步骤)。
5. LLM 逐 token 返回。
6. AI 服务通过 IPC 流把 chunk 实时推回编辑器,插入为"AI 续写块"(预览态)。

### 4.4 关键设计点

1. **流式**贯穿全程——`generate()` 返回 `AsyncIterable<string>`,主进程边收边推,渲染进程边收边渲染,用户看到字一个个出现。
2. **上下文组装在主进程完成**——渲染进程只传 `chapterId` + 指令,主进程自己查库组装,减少 IPC 传输量与敏感数据暴露。
3. **生成结果先入"AI 块"预览态**,用户可接受(转为正文)/丢弃(删除)/再生成,不会直接污染正文。
4. **可取消**:流式过程中用户可中断,主进程 abort fetch。

## 5. 编辑器与 AI 交互

TipTap 编辑器基于 StarterKit,扩展一个自定义节点 `AiBlock`:

- `AiBlock` 是一个容器节点(`group`、`content: block+`),属性 `status: 'streaming' | 'preview'`、`task: 'continue' | 'rewrite'`。
- 生成内容先进入 `AiBlock` 预览态,**不污染正文**,用户决定后才"接受"转为普通段落。

### 5.1 续写交互

光标处插入空 `AiBlock` → 流式填充(边收边显示,光标态闪烁)→ 预览态显示操作条 → 接受(unwrap 为正文)/丢弃(删除)/重生(重新生成)。

### 5.2 改写交互

选中文本 → 浮动气泡(润色/扩写/缩写/换风格)→ 结果在原位以 `AiBlock` 预览 → 接受则替换选区。

### 5.3 主界面布局

三栏:左 `项目树` | 中 `编辑器` | 右 `AI 侧边栏`(续写指令与参数,可切到 `人物库` 标签)。侧边栏可折叠,让编辑器获得更大空间。

## 6. 章节/人物管理、错误处理与测试

### 6.1 章节/卷管理

- 项目树支持卷→章两级,拖拽排序(松手后批量重排 `sort_order`)。
- 章节自动保存(防抖 1.5s),保存时主进程重算字数写回。
- 章状态 `draft/done`,树上有视觉标记。

### 6.2 人物/设定库

- 角色卡表单(姓名/角色/外貌/性格/背景/关系),设定按分类(地点/势力/道具/规则)。
- 续写/改写时由主进程按"当前章正文提及的姓名"匹配相关人物卡注入上下文(MVP 用简单姓名匹配,不做 NER)。

### 6.3 错误处理

| 场景 | 处理 |
|---|---|
| AI API 401/无效 Key | 侧边栏提示"配置错误",跳设置页 |
| AI API 限流/超时 | 自动重试 1 次,失败则在 AiBlock 内显错,可重生 |
| 流式中断 | 用户取消 → abort fetch,删除半成品 AiBlock |
| 保存失败 | toast 提示,保留编辑器内容不丢 |

### 6.4 测试策略

- **单元**:`AiProvider` 上下文组装(给定章+人物→预期 prompt)、各 DAO 增删改查、`sort_order` 重排算法。
- **集成**:mock 云端 LLM(返回假 token 流),验证"续写请求→流式插入→接受转正文"全链路。
- 编辑器:测 `AiBlock` 接受后 unwrap 为正文、丢弃后文档结构正确。

## 7. 技术栈清单

| 层 | 选型 |
|---|---|
| 桌面框架 | Electron |
| 前端 | React + TypeScript + Vite |
| 编辑器 | TipTap(富文本,自定义 AI 节点) |
| 状态管理 | Zustand |
| 本地存储 | better-sqlite3(SQLite) |
| AI 抽象层 | `AiProvider` 接口(云端实现 + 本地预留) |
| UI 组件 | Tailwind CSS + shadcn/ui |
| 测试 | Vitest(单元/集成) |

## 8. 成功标准(MVP)

1. 能创建项目,在卷/章节树中增删改、拖拽排序。
2. 能在编辑器中写作,自动保存,字数统计正确。
3. 能维护角色卡与世界观设定。
4. 点击续写,AI 流式生成并实时显示在预览块,可接受/丢弃/重生。
5. 选中文本可触发改写气泡,四种改写模式可用,结果可接受替换。
6. AI 配置可设置 provider/model/key,云端调用成功。
7. 流式可取消;API 出错有明确提示与重试。
