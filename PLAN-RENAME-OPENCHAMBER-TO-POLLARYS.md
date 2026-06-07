# Escopo do Projeto: Renomear Pollarys → Pollarys + Migração de Dados + Idioma PT-BR

## 📋 Checklist de Implementação

### ✅ Tarefa 0: Criar Plano
- [x] Analisar código fonte (387 arquivos, ~4.286 ocorrências)
- [x] Documentar i18n (já está pt-BR)
- [x] Definir estratégia de migração de dados
- [x] Criar este arquivo de plano

### Fase 1: Identidade do Projeto + Script de Migração

#### Tarefa 1.1: Criar script de migração de dados
- [x] Criar `scripts/migrate-from-pollarys.mjs`
- [x] Script deve:
   - Detectar `~/.config/pollarys/` (e path macOS)
   - Copiar diretório para `~/.config/pollarys/`
   - Manter compatibilidade se `~/.config/pollarys/` já existir
   - Criar arquivo sentinela `.migrated-from-pollarys`
   - Substituir referências internas em JSONs (caminhos, nomes)
   - Log de progresso e erros
   - Ser idempotente

#### Tarefa 1.2: Atualizar package.json (workspace)
- [x] `packages/web/package.json` - bin: `"pollarys"` → `"pollarys"`
- [x] `packages/web/tsconfig.json` - paths: `@pollarys/*` → `@pollarys/*`
- [x] `packages/ui/tsconfig.json` - paths: `@pollarys/*` → `@pollarys/*`
- [x] `packages/vscode/tsconfig.webview.json` - paths: `@pollarys/*` → `@pollarys/*`
- [x] `packages/desktop/src-tauri/Cargo.toml` - `name = "pollarys-desktop"` → `"pollarys-desktop"`
- [x] `packages/desktop/src-tauri/tauri.conf.json` - identifier: `"ai.opencode.pollarys"` → `"ai.opencode.pollarys"`
- [x] `packages/desktop/src-tauri/tauri.conf.json` - sidecars: `pollarys-server` → `pollarys-server`

### Fase 2: Servidor Web + CLI

#### Tarefa 2.1: CLI
- [x] `packages/web/bin/cli.js` - todas as ocorrências (~60+)
   - Nome do comando, help text, shell completions, banner
   - Subcomandos: `serve`, `stop`, `restart`, `status`, `tunnel`, `logs`, `update`

#### Tarefa 2.2: Servidor Web - Configuração principal
- [x] `packages/web/server/index.js`
   - `POLLARYS_DATA_DIR` → `POLLARYS_DATA_DIR`
   - `POLLARYS_PORT` → `POLLARYS_PORT`
   - `registerPollarysRoutes` → `registerPollarysRoutes`
   - `DESKTOP_NOTIFY_PREFIX` etc

- [x] `packages/web/server/lib/opencode/pollarys-routes.js` (renomeado para `pollarys-routes.js`)
   - Rota: `/api/pollarys/update-check` → `/api/pollarys/update-check`
   - Rota: `/api/pollarys/update-install` → `/api/pollarys/update-install`
   - `pollarysDataDir` → `pollarysDataDir`
   - `pollarys-<port>.json` → `pollarys-<port>.json`
   - `restartCmdFallback` command

#### Tarefa 2.3: Servidor Web - Outros módulos
- [x] `packages/web/server/lib/opencode/env-config.js` - variáveis `POLLARYS_*`
- [x] `packages/web/server/lib/opencode/bootstrap-runtime.js` - `pollarysDataDir`
- [x] `packages/web/server/lib/opencode/feature-routes-runtime.js` - `pollarysDataDir`
- [x] `packages/web/server/lib/opencode/project-icon-routes.js` - `pollarysDataDir`
- [x] `packages/web/server/lib/opencode/pwa-manifest-routes.js` - nome do app
- [x] `packages/web/server/lib/opencode/server-startup-runtime.js` - logs
- [x] `packages/web/server/lib/opencode/lifecycle.js` - mensagens de erro
- [x] `packages/web/server/lib/opencode/env-runtime.js` - config messages
- [x] `packages/web/server/lib/ui-auth/ui-auth.js` - `POLLARYS_DATA_DIR`
- [x] `packages/web/server/lib/ui-auth/ui-passkeys.js` - `POLLARYS_DATA_DIR`, `DEFAULT_RP_NAME`
- [x] `packages/web/server/lib/github/auth.js` - `POLLARYS_DATA_DIR`
- [x] `packages/web/server/lib/session-folders/routes.js` - `pollarysDataDir`
- [x] `packages/web/server/lib/magic-prompts/routes.js` - `pollarysDataDir`

### Fase 3: Desktop (Electron)

#### Tarefa 3.1: Electron main e preload
- [ ] `packages/electron/main.mjs`
  - `DEEP_LINK_PROTOCOL = 'pollarys'` → `'pollarys'`
  - IPC channels: `pollarys:emit`, `pollarys:invoke`, `pollarys:open-session`, `pollarys:menu-action`, etc.
  - CLI args: `--pollarys-local-origin`, `--pollarys-home`, `--pollarys-server-host`, `--pollarys-server-port`
  - Config path: `~/.config/pollarys/settings.json`
  - GitHub URLs: `pollarys/pollarys` → `pollarys/pollarys`
- [ ] `packages/electron/preload.mjs`
  - `readArgValue('--pollarys-local-origin')` etc.
  - IPC listener: `'pollarys:emit'`
  - IPC invoker: `'pollarys:invoke'`, `'pollarys:dialog:open'`

#### Tarefa 3.2: SSH Manager
- [ ] `packages/electron/ssh-manager.mjs`
  - `SSH_STATUS_EVENT = 'pollarys:ssh-instance-status'`
  - `pollarysPassword`, `pollarys --version`, `pollarys serve --hostname`

### Fase 4: Desktop (Tauri - Legacy)

#### Tarefa 4.1: Tauri config e Rust
- [ ] `packages/desktop/src-tauri/tauri.conf.json`
  - `"identifier": "ai.opencode.pollarys"` → `"ai.opencode.pollarys"`
  - `"sidecars/pollarys-server"` → `"pollarys-server"`
  - GitHub release URL
- [ ] `packages/desktop/src-tauri/Cargo.toml`
  - `name = "pollarys-desktop"` → `"pollarys-desktop"`
- [ ] `packages/desktop/src-tauri/src/main.rs`
  - IPC events: `pollarys:menu-action`, `pollarys:check-for-updates`, etc.
  - `SIDECAR_NAME: &str = "pollarys-server"`
  - `process_kill_name("pollarys-server.exe")`
  - URLs GitHub: `pollarys/pollarys`
- [ ] `packages/desktop/src-tauri/src/remote_ssh.rs`
  - `SSH_STATUS_EVENT: &str = "pollarys:ssh-status"`
  - `pollarys_password`, `pollarys_version`, `remote_pollarys`
  - `install_pollarys_managed()` - instala `@pollarys/web`

#### Tarefa 4.2: Info.plist (macOS)
- [ ] `packages/desktop/src-tauri/Info.plist` - CFBundleName, identifiers

### Fase 5: Extensão VS Code

#### Tarefa 5.1: package.json da extensão
- [ ] `packages/vscode/package.json`
  - `"name": "pollarys"`, `"displayName": "Pollarys"` → `"pollarys"`, `"Pollarys"`
  - Extension ID: `fedaykindev.pollarys` → (nova decisão: manter? mudar?)
  - Commands (20+): `pollarys.openSidebar`, `pollarys.focusChat`, etc.
  - Views: `pollarys.chatView`
  - Configuration: `pollarys.apiUrl`, `pollarys.opencodeBinary`
  - Menus e submenus
- [ ] `packages/vscode/src/webviewHtml.ts`
  - `<html lang="en">` → `<html lang="pt-BR">`

### Fase 6: UI - Infrastructure

#### Tarefa 6.1: i18n e storage
- [ ] `packages/ui/src/lib/i18n/runtime.ts`
  - `LOCALE_STORAGE_KEY = 'pollarys.i18n.v1'` → `'pollarys.i18n.v1'`
  - (Nota: DEFAULT_LOCALE já é 'pt-BR')
- [ ] `packages/ui/src/lib/pollarysConfig.ts` - módulo, `__POLLARYS_RUNTIME_APIS__`, paths
- [ ] `packages/ui/src/lib/pollarysEvents.ts` - `PollarysEvent`, SSE endpoint
- [ ] `packages/ui/src/lib/desktop.ts` - `__POLLARYS_RUNTIME_APIS__`
- [ ] `packages/ui/src/lib/desktopBoot.ts` - APIs de runtime
- [ ] `packages/ui/src/lib/desktopNative.ts` - IPC channels
- [ ] `packages/ui/src/lib/desktopSsh.ts` - SSH event names
- [ ] `packages/ui/src/lib/persistence.ts` - storage keys `pollarys.*`
- [ ] `packages/ui/src/lib/pwa.ts` - PWA references

#### Tarefa 6.2: Hooks e Types
- [ ] `packages/ui/src/hooks/useRouter.ts` - route references
- [ ] `packages/ui/src/hooks/useWindowTitle.ts` - title strings
- [ ] `packages/ui/src/types/desktop.d.ts` - `__POLLARYS_RUNTIME_APIS__`
- [ ] `packages/ui/src/types/vscode.d.ts` - VSCode API interface

#### Tarefa 6.3: Bootstrap da aplicação
- [ ] `packages/ui/src/App.tsx` - referências no wrapper
- [ ] `packages/ui/src/main.tsx` - bootstrap, nome do app

### Fase 7: UI - Componentes

#### Tarefa 7.1: Seções de Settings
- [ ] `packages/ui/src/components/sections/pollarys/AboutSettings.tsx` - "About Pollarys"
- [ ] `packages/ui/src/components/sections/pollarys/PollarysPage.tsx` - página settings
- [ ] `packages/ui/src/components/sections/pollarys/PollarysVisualSettings.tsx` - seletor de idioma + visual

#### Tarefa 7.2: Componentes UI
- [ ] `packages/ui/src/components/ui/PollarysLogo.tsx` - logo component
- [ ] `packages/ui/src/components/ui/AboutDialog.tsx` - about dialog
- [ ] `packages/ui/src/components/ui/UpdateDialog.tsx` - update dialog
- [ ] `packages/ui/src/components/onboarding/desktopRecoveryConfig.ts` - nome do app

### Fase 8: Temas

#### Tarefa 8.1: Temas built-in
- [ ] `packages/ui/src/lib/theme/themes/fields-of-the-shire-light.json` - `"id": "pollarys-light"` → `"pollarys-light"`
- [ ] `packages/ui/src/lib/theme/themes/fields-of-the-shire-dark.json` - `"id": "pollarys-dark"` → `"possary-dark"`

#### Tarefa 8.2: Índice de temas
- [ ] `packages/ui/src/lib/theme/themes/index.ts` - referências aos temas

### Fase 9: Traduções (i18n messages)

#### Tarefa 9.1: Arquivos de mensagens principais (7 locais)
Para cada locale em `['en', 'pt-BR', 'es', 'zh-CN', 'uk', 'ko', 'pl']`:
- [ ] `packages/ui/src/lib/i18n/messages/{locale}.ts`
  - Substituir "Pollarys" → "Pollarys" em todas as strings de UI
  - Manter chaves de tradução (ex: `'installation.prompt'`)—apenas os valores
  - Cuidado com strings que contêm "pollarys" em URLs ou tokens técnicos (ex: `pollarys.i18n.v1`)

#### Tarefa 9.2: Arquivos de configurações (settings)
Para cada locale:
- [ ] `packages/ui/src/lib/i18n/messages/{locale}.settings.ts`
  - Substituir "Pollarys" → "Pollarys" em títulos, descrições

### Fase 10: Documentação

#### Tarefa 10.1: Arquivos raiz
- [ ] `README.md` - todas menções a "Pollarys" → "Pollarys"
- [ ] `AGENTS.md` - riot all "Pollarys"/"pollarys" references
- [ ] `CHANGELOG.md` - nome do projeto, URLs
- [ ] `CONTRIBUTING.md` - nome
- [ ] `SECURITY.md` - nome

#### Tarefa 10.2: Configuração de servidor
- [ ] `Caddyfile` - server name
- [ ] `docker-compose.yml` - service name, container_name, volumes paths
- [ ] `Dockerfile` - caminhos e referências

#### Tarefa 10.3: Docs
- [ ] Todos arquivos em `docs/` - fazer busca global

### Fase 11: CI/CD e Scripts

#### Tarefa 11.1: GitHub Actions
- [ ] `.github/workflows/release.yml` - `pollarys-website` → `pollarys-website`
- [ ] `.github/workflows/docs-source.yml` - `pollarys-docs-source`, `pollarys-website`
- [ ] `.github/workflows/vscode-extension.yml` - `pollarys-vscode-vsix`

#### Tarefa 11.2: Shell scripts
- [ ] `scripts/test-release-build.sh` - nomes de arquivos e comandos
- [ ] `scripts/install.sh` - nome do pacote npm, comandos
- [ ] `docker-entrypoint.sh` - referências
- [ ] `packages/web/bin/cli.js` (comando `update`) - nome do pacote npm

### Fase 12: Variáveis de Ambiente e Compatibilidade

#### Tarefa 12.1: Migração de variáveis de ambiente
- [ ] Implementar fallback `POLLARYS_*` → `POLLARYS_*` por 3 meses
  - Em cada módulo que lê `process.env`, adicionar lógica:
    ```js
    const pollarysVal = process.env.POLLARYS_FOO;
    const pollarysVal = process.env.POLLARYS_FOO;
    const value = pollarysVal ?? pollarysVal;
    if (pollarysVal) console.warn('POLLARYS_* is deprecated, use POLLARYS_*');
    ```
- [ ] Atualizar docs para mencionar novas variáveis
- [ ] Log warnings apropriados

#### Tarefa 12.2: Compatibilidade localStorage (migração automática)
- [ ] Em `packages/ui/src/lib/i18n/runtime.ts` (ou storage module):
  - No bootstrap, migrar chaves:
    ```js
    const oldKeys = ['pollarys.i18n.v1', 'pollarys.pwaName', ...];
    oldKeys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        localStorage.setItem(key.replace('pollarys', 'pollarys'), val);
        localStorage.removeItem(key);
      }
    });
    ```
- [ ] Para IndexedDB, migrar nomes de bancos no bootstrap
  - Abrir `pollarys-*`, copar dados para `pollarys-*`, deletar antigo

### Fase 13: Build e Validação

#### Tarefa 13.1: Build
- [ ] `bun run build` (web, ui, electron, desktop, vscode)

#### Tarefa 13.2: Type-check e Lint
- [ ] `bun run type-check` - sem erros
- [ ] `bun run lint` - sem erros

#### Tarefa 13.3: Testes manuais
- [ ] Executar `pollarys serve` localmente
- [ ] Verificar que diretório `~/.config/pollarys/` é criado
- [ ] Testar CLI: `pollarys --help`, `pollarys tunnel help`
- [ ] Testar migração: mover dados de `~/.config/pollarys/` para antigo, iniciar app, verificar migração

---

## 📁 Arquivos Afetados (Caminhos)

```
scripts/migrate-from-pollarys.mjs  (novo)
packages/web/package.json
packages/web/tsconfig.json
packages/web/bin/cli.js
packages/web/server/
packages/ui/tsconfig.json
packages/ui/src/lib/i18n/runtime.ts
packages/ui/src/lib/*chamber*.ts
packages/ui/src/hooks/*.ts
packages/ui/src/types/*.d.ts
packages/ui/src/App.tsx
packages/ui/src/main.tsx
packages/ui/src/components/sections/pollarys/
packages/ui/src/components/ui/*Chamber*.tsx
packages/ui/src/lib/theme/themes/*.json
packages/ui/src/lib/i18n/messages/*.ts
packages/electron/main.mjs
packages/electron/preload.mjs
packages/electron/ssh-manager.mjs
packages/desktop/src-tauri/tauri.conf.json
packages/desktop/src-tauri/Cargo.toml
packages/desktop/src-tauri/src/main.rs
packages/desktop/src-tauri/src/remote_ssh.rs
packages/vscode/package.json
packages/vscode/src/webviewHtml.ts
README.md
AGENTS.md
CHANGELOG.md
CONTRIBUTING.md
SECURITY.md
Caddyfile
docker-compose.yml
Dockerfile
.github/workflows/*.yml
scripts/*.sh
packages/web/bin/cli.js (update command)
```

---

## 🧪 Verificação Pós-Migração

### Checklist Final
- [ ] Build completo sem erros: `bun run build`
- [ ] Type-check limpo: `bun run type-check`
- [ ] Lint limpo: `bun run lint`
- [ ] CLI funciona: `pollarys --help`
- [ ] Diretório padrão: `~/.config/pollarys/` criado
- [ ] localStorage sem chaves `pollarys.*` (migração automática ocorreu)
- [ ] IndexedDB bancos `pollarys-*` criados
- [ ] IPC channels no Electron: `pollarys:*`
- [ ] VS Code commands: `pollarys.*`
- [ ] Tema IDs: `pollarys-light`, `pollarys-dark`
- [ ] Traduções pt-BR ativas por padrão
- [ ] Todas docs referenciam Pollarys, não Pollarys

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Dados perdidos | Usuários perdem configs e temas | Script de migração automática; docs explicam como migrar manualmente |
| Atualização quebra apps instalados | Alto - usuários não conseguem abrir app | Publicar como nova app? (nova decision: extension ID, app identifier) |
| IPC channels mudam | Electron desktop quebra | Garantir que Electron e Tauri (legacy) usem novos nomes |
| VS Code extension ID mudança | Atualizações automáticas quebram | Decidir: manter ID `fedaykindev.pollarys` ou criar novo? |
| Path aliases quebram | Imports falham | Atualizar todos tsconfigs |
| Ambient vars antigas não migradas | Servidor não inicia | Fallback `POLLARYS_*` por 3 meses |
| localStorage não migrado | Preferências de idioma perdidas | Script de migração no bootstrap |
| IndexedDB não migrado | Drafts, todos perdidos | Script de migração de DB no bootstrap |

---

## 🔄 Compatibilidade Reversa (3 meses)

1. **Variáveis de ambiente**: `POLLARYS_*` aceitas como fallback + warning log
2. **localStorage/IndexedDB**: migração automática ocorre no primeiro boot
3. **Diretório `~/.config/pollarys/`**: o app ainda lê dele se `~/.config/pollarys/` vazio por 30 dias?
   - Decisão: **não**. Forçar migração. Se não houver sentinela e houver dados antigos, rodar migração automaticamente.
4. **Deep link protocol**: registrar ambos `pollarys://` e `pollarys://` por 3 meses? (difícil - protocolo registrado no OS)
   - Decisão: script de install pode registrar novo protocolo; documentar para usuários manualmente.

---

## 📊 Estimativa

- **Arquivos para editar**: ~150 (excluindo dist, node_modules, traduções que são quase 100% replace)
- **Linhas de código**: ~4.000+ substituições
- **Tarefas**: ~80 subtarefas listadas acima
- **Complexidade**: ALTA - afeta todos pacotes, múltiplas linguagens (JS, TS, Rust), CI/CD, docs
- **Risco**: ALTO - quebra compatibilidade com instalações existentes

---

## 🎯 Objetivo Final

- Projeto renomeado consistentemente como **Pollarys** em todo o código
- Idioma padrão: **pt-BR** (já configurado)
- Dados de usuários **migrados automaticamente**
- Build e type-check limpos
- Docs atualizadas
- CLI: `pollarys` e `pollarys-server`
- Deep link: `pollarys://`
- Extension ID: necessidade de decisão (manter ou criar novo)

---

## ✅ Progresso Realizado (até agora)

### Fase 1: ✅ CONCLUÍDA
- Script de migração criado
- package.json, tsconfigs, Cargo.toml, tauri.conf.json atualizados

### Fase 2: ✅ CONCLUÍDA
- CLI e servidor web com replacements em massa

### Fase 3: ✅ CONCLUÍDA
- Electron main, preload, ssh-manager atualizados

### Fase 4: ✅ CONCLUÍDA
- Tauri Rust sources e Info.plist atualizados

### Fase 5: ✅ CONCLUÍDA
- VS Code extension package.json e webviewHtml.ts atualizados

### Fase 6: ✅ PARCIALMENTE CONCLUÍDA
- i18n runtime storage key alterado
- Arquivos de lib renomeados e imports atualizados
- desktop.ts, desktopBoot.ts, etc. atualizados

### Fase 7: ⚠️ PARCIAL
- Pasta `sections/pollarys` criada (renomeada)
- Imports atualizados
- **Conteúdo dos arquivos da seção ainda contém "Pollarys" (necessário replace interno)**

### Fase 8: ✅ CONCLUÍDA
- Temas IDs e autor atualizados

### Fase 9: ✅ CONCLUÍDA
- Todas as traduções (7 locales + settings) substituídas

### Fase 10: ✅ CONCLUÍDA
- Documentação raiz e docs atualizadas

### Fase 11: ✅ CONCLUÍDA
- GitHub Actions e shell scripts atualizados

### Fase 12: ❌ PENDENTE
- Fallback de variáveis de ambiente (POLLARYS_* → POLLARYS_*)

### Fase 13: ❌ PENDENTE
- Build, type-check, lint e testes manuais

---

## ⚠️ Pendências Críticas

1. **Conteúdo dos arquivos em `packages/ui/src/components/sections/pollarys/`**  
   Ainda contêm:
   - Nomes de componentes (`PollarysPage`, `PollarysVisualSettings`, etc.)
   - Strings de UI ("About Pollarys", etc.)
   - Constantes e tipos (`Pollarys*`)
   - Necessário replace interno nesses 18 arquivos.

2. **Fusion de fallback vars** (Fase 12) — pode ser feito posteriormente.

3. **Validação final** (build, type-check, lint).

---

**Deseja que eu prossiga com o replace interno nos arquivos de seção e, em seguida, executar a build de validação?** Ou prefere ajustar manualmente esses arquivos?

