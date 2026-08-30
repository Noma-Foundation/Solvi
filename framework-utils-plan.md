# Plano: Funções Utilitárias em `framework.js`

## Visão Geral

Implementar funções utilitárias de loading state diretamente em `frontend/framework/framework.js`,
equivalentes às de `frontend/src/utils/loading-state.js`, mas compatíveis tanto com elementos
jQuery quanto com HTMLElement nativo — necessário para suportar os futuros `ISolviElement` (Web Components)
que não dependem de jQuery.

O `loading-state.js` original permanece intacto no `src/` para não quebrar o código existente da aplicação.

---

## Sub-tarefa 1 — Implementar `setButtonLoading` em `framework.js`

**Intent:**
Portar a lógica de `setButtonLoading` do `loading-state.js` para o framework, aceitando jQuery ou HTMLElement.

**Expected Outcomes:**
- `framework.js` exporta `setButtonLoading(button, isLoading)`
- Funciona quando `button` é um objeto jQuery (tem `.prop()` e `.html()`)
- Funciona quando `button` é um `HTMLElement` nativo (usa `.disabled` e `.innerHTML`)
- Preserva o conteúdo original do botão e restaura ao desativar o loading
- Exibe spinner Bootstrap (`spinner-border spinner-border-sm`) durante loading

**Todo List:**
1. Criar helper interno `#isJQuery(el)` — verifica se o objeto tem `.prop` e `.html` como funções
2. Implementar `setButtonLoading(button, isLoading)` com dois caminhos: jQuery e nativo
3. Para o caminho nativo, usar `dataset` para guardar o `innerHTML` original (equivalente ao `.data()` do jQuery)
4. Exportar a função

**Relevant Context:**
- [`frontend/src/utils/loading-state.js`](frontend/src/utils/loading-state.js) — implementação original a ser espelhada
- [`frontend/framework/framework.js`](frontend/framework/framework.js) — arquivo destino (atualmente vazio)

**Status:** [ ] pending

---

## Sub-tarefa 2 — Implementar `setContainerLoading` em `framework.js`

**Intent:**
Portar `setContainerLoading` do `loading-state.js` para o framework, com suporte a jQuery e HTMLElement nativo.

**Expected Outcomes:**
- `framework.js` exporta `setContainerLoading(container, isLoading)`
- Funciona com jQuery e HTMLElement nativo
- Adiciona/remove overlay de spinner Bootstrap dentro do container
- Evita duplicar o overlay se chamado duas vezes com `isLoading = true`

**Todo List:**
1. Implementar `setContainerLoading(container, isLoading)` com dois caminhos: jQuery e nativo
2. Para o caminho nativo: verificar `querySelector(":scope > .loading-overlay")` para evitar duplicação
3. Para remoção no caminho nativo: usar `querySelector` + `remove()`
4. Exportar a função

**Relevant Context:**
- [`frontend/src/utils/loading-state.js`](frontend/src/utils/loading-state.js) — implementação original
- [`frontend/framework/framework.js`](frontend/framework/framework.js) — arquivo destino

**Status:** [ ] pending

---

## Sub-tarefa 3 — Demonstrar uso no app de testes (`frontend/tests/`)

**Intent:**
Mostrar as funções em funcionamento no mini-app de testes, servindo como documentação viva do framework.

**Expected Outcomes:**
- `frontend/tests/index.html` exibe dois botões e um container demonstrativos
- `frontend/tests/main.js` importa `setButtonLoading` e `setContainerLoading` de `framework.js` e os usa
- Ao clicar num botão, ele entra em modo loading por 2 segundos e volta ao normal
- Ao clicar no outro botão, o container exibe o overlay de loading por 2 segundos

**Todo List:**
1. Adicionar estrutura HTML mínima em `index.html` (dois botões + um container)
2. Em `main.js`, importar as funções de `../framework/framework.js`
3. Adicionar listeners de click que demonstram os dois utilitários
4. Adicionar estilos mínimos em `style.css` para o container ter dimensão visível

**Relevant Context:**
- [`frontend/tests/index.html`](frontend/tests/index.html) — ponto de entrada do mini-app
- [`frontend/tests/main.js`](frontend/tests/main.js) — atualmente só importa `MAX_HISTORY_SIZE`
- [`frontend/tests/style.css`](frontend/tests/style.css) — atualmente vazio

**Status:** [ ] pending
