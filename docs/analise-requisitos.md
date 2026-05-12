# Análise de requisitos — OrderManager e OrderHub

## 1. Contexto da análise

Esta análise consolida os requisitos identificados a partir da documentação e dos artefatos versionados no repositório, incluindo o histórico de branches já mescladas (`main`, `employee-interface` e `employee-user-interface`).

Foram identificados dois recortes de sistema:

1. **OrderManager**: sistema de negócio descrito no README raiz, voltado a pedidos e simulação de orçamentos para empresas e pequenos negócios.
2. **OrderHub**: aplicação desktop construída com Wails, com interface operacional para gestão de pedidos, clientes e ações de usuário/funcionário.

> Observação: como não há branches locais/remotas disponíveis além da branch atual (`work`), a análise usa o conteúdo presente no histórico já mesclado e no estado atual do projeto. Itens inferidos a partir de código ou interface estão marcados como **inferência**.

## 2. Fontes analisadas

| Fonte | Evidência utilizada |
| --- | --- |
| `README.md` | Descrição do OrderManager como sistema de pedidos e simulação de orçamentos para empresas e pequenos negócios. |
| `orderhub/README.md` | Indica que o OrderHub segue a estrutura de aplicação Wails, com modo de desenvolvimento e build de distribuição. |
| `orderhub/wails.json` | Define metadados, scripts de instalação/build/dev e empacotamento da aplicação desktop OrderHub. |
| `orderhub/main.go` | Define menus nativos para pedidos, clientes e ajuda; configura janela desktop e assets embutidos. |
| `orderhub/frontend/index.html` | Define cabeçalho, navegação principal, botões de ação e estrutura visual da interface. |
| Histórico Git | Registra merges das branches `main`, `employee-interface` e `employee-user-interface`, além de commits de atualização de interface e ajustes de Bootstrap. |
| Solicitação de stakeholder | Nova necessidade de detalhar um ticket/orçamento de R$ 800, permitindo visualizar, adicionar e remover componentes como câmeras e mão de obra, além de exportar o resultado em arquivo. |

## 3. Sistema 1 — OrderManager

### 3.1 Objetivo

O OrderManager deve apoiar empresas e pequenos negócios no gerenciamento de pedidos e na simulação de orçamentos, reduzindo dependência de controles manuais e centralizando informações de clientes, pedidos e configurações do negócio.

### 3.2 Atores

| Ator | Descrição |
| --- | --- |
| Administrador do negócio | Responsável por configurar o sistema, parâmetros comerciais e dados base. |
| Funcionário/operador | Usuário responsável por registrar, consultar e acompanhar pedidos e clientes. |
| Cliente | Pessoa ou empresa associada a pedidos e orçamentos. Pode ser ator indireto nesta versão, pois a interface atual é voltada ao operador. |

### 3.3 Requisitos funcionais

| ID | Requisito | Prioridade | Origem / rastreabilidade |
| --- | --- | --- | --- |
| RF-OM-01 | O sistema deve permitir cadastrar pedidos. | Alta | Menu nativo `Orders > Add Order`; descrição do produto como sistema de pedidos. |
| RF-OM-02 | O sistema deve permitir pesquisar pedidos. | Alta | Menu nativo `Orders > Search Orders`. |
| RF-OM-03 | O sistema deve permitir editar/definir informações de um pedido. | Média | Menu nativo `Orders > Set Order`; **inferência**: ação representa alteração/configuração do pedido. |
| RF-OM-04 | O sistema deve permitir cadastrar clientes. | Alta | Menu nativo `Customers > Add Customer`. |
| RF-OM-05 | O sistema deve permitir pesquisar clientes. | Alta | Menu nativo `Customers > Search Customers`. |
| RF-OM-06 | O sistema deve permitir editar dados de clientes. | Média | Menu nativo `Customers > Edit Customer`. |
| RF-OM-07 | O sistema deve oferecer simulação de orçamentos para pedidos. | Alta | README raiz descreve “simulação de orçamentos”; **inferência**: orçamento deve estar ligado a itens, valores e cliente. |
| RF-OM-08 | O sistema deve permitir configurações mínimas do negócio antes da operação. | Média | README raiz menciona gerenciamento “com apenas algumas configurações”. |
| RF-OM-09 | O sistema deve disponibilizar documentação/ajuda ao usuário. | Baixa | Menu nativo `Help > Docs`. |
| RF-OM-10 | O sistema deve permitir visualizar os detalhes financeiros de um ticket/orçamento. | Alta | Solicitação de stakeholder: ao clicar em “visualizar detalhes”, deve aparecer uma tabela de valores. |
| RF-OM-11 | O sistema deve permitir adicionar e remover componentes dentro de um ticket/orçamento, como câmeras, mão de obra e outros itens de custo. | Alta | Solicitação de stakeholder: ticket de R$ 800 pode conter uma tabela interna de componentes ajustáveis. |
| RF-OM-12 | O sistema deve recalcular o valor total do ticket/orçamento quando componentes forem adicionados, removidos ou alterados. | Alta | **Inferência** necessária para manter coerência entre o total do ticket e sua composição interna. |
| RF-OM-13 | O sistema deve permitir exportar o ticket/orçamento detalhado como arquivo. | Alta | Solicitação de stakeholder: deve haver botão para exportar o orçamento/ticket. |
| RF-OM-14 | O sistema deve permitir selecionar componentes a partir de uma tabela de valores/catálogo e também registrar componentes avulsos quando necessário. | Média | Solicitação menciona “tabela x de valores”; **inferência**: os componentes podem vir de uma tabela pré-configurada. |

### 3.4 Requisitos não funcionais

| ID | Requisito | Prioridade | Justificativa |
| --- | --- | --- | --- |
| RNF-OM-01 | A interface deve ser simples para pequenos negócios. | Alta | O público-alvo inclui empresas e pequenos negócios, que tendem a precisar de baixa complexidade operacional. |
| RNF-OM-02 | O sistema deve executar como aplicação desktop distribuível. | Alta | A implementação usa Wails e define build redistribuível. |
| RNF-OM-03 | O sistema deve ter estrutura visual responsiva no frontend. | Média | Uso de meta viewport e Bootstrap no HTML. |
| RNF-OM-04 | O sistema deve manter navegação clara entre Home, Orders e Customers. | Média | Navegação atual contém essas seções. |
| RNF-OM-05 | O sistema deve preservar compatibilidade multiplataforma quando possível. | Média | Wails possui configuração desktop e tratamento específico de menu para macOS vs. Windows/Linux. |

### 3.5 Regras de negócio iniciais

| ID | Regra | Status |
| --- | --- | --- |
| RN-OM-01 | Todo pedido deve estar associado a um cliente ou a uma identificação mínima de solicitante. | Proposta |
| RN-OM-02 | Um orçamento simulado deve possuir valor total calculado a partir de itens, quantidades e regras comerciais configuradas. | Proposta |
| RN-OM-03 | Apenas usuários autorizados devem alterar configurações do negócio. | Proposta |
| RN-OM-04 | A busca de pedidos e clientes deve permitir localizar registros por identificadores relevantes, como nome, código ou descrição. | Proposta |
| RN-OM-05 | O valor total do ticket/orçamento deve refletir a soma dos componentes detalhados, salvo quando houver ajuste manual autorizado e registrado. | Proposta |
| RN-OM-06 | Componentes de ticket/orçamento devem registrar ao menos descrição, categoria, quantidade, valor unitário e valor total. | Proposta |
| RN-OM-07 | Quando um componente vier da tabela de valores, o sistema deve copiar o valor vigente para o ticket/orçamento, preservando o histórico mesmo que a tabela seja alterada depois. | Proposta |

### 3.6 Dados principais

| Entidade | Campos sugeridos |
| --- | --- |
| Cliente | ID, nome/razão social, documento, telefone, e-mail, endereço, observações. |
| Pedido | ID, cliente, data, status, itens, subtotal, descontos, total, observações. |
| Item de pedido | Produto/serviço, descrição, quantidade, preço unitário, desconto, total. |
| Orçamento | ID, cliente, itens, validade, status, valor total, data de emissão. |
| Ticket/Orçamento detalhado | ID, cliente, pedido vinculado, valor total, componentes, status, data de criação, data de atualização. |
| Componente do ticket | ID, ticket, categoria, descrição, quantidade, valor unitário, valor total, observações. |
| Tabela de valores | ID, categoria, descrição, valor padrão, unidade, status ativo/inativo, data de atualização. |
| Configuração do negócio | Dados da empresa, moeda, impostos/taxas, padrões de orçamento, permissões. |

## 4. Sistema 2 — OrderHub

### 4.1 Objetivo

O OrderHub deve ser a aplicação operacional do ecossistema OrderManager, fornecendo uma interface desktop para funcionários/usuários internos gerenciarem pedidos e clientes, além de acessarem ações rápidas por menu e por interface web embarcada.

### 4.2 Atores

| Ator | Descrição |
| --- | --- |
| Funcionário/operador | Usuário principal da interface OrderHub, responsável pela rotina de pedidos e clientes. |
| Administrador/suporte | Usuário responsável por configurações, validação de ambiente e acesso à documentação. |

### 4.3 Requisitos funcionais

| ID | Requisito | Prioridade | Origem / rastreabilidade |
| --- | --- | --- | --- |
| RF-OH-01 | A aplicação deve iniciar uma janela desktop chamada “OrderHub”. | Alta | Configuração da aplicação Wails em `main.go` e `wails.json`. |
| RF-OH-02 | A aplicação deve carregar os assets do frontend embutidos no binário. | Alta | Uso de `embed.FS` apontando para `frontend/dist`. |
| RF-OH-03 | A aplicação deve disponibilizar menu “Orders”. | Alta | Código cria submenu `Orders`. |
| RF-OH-04 | O menu “Orders” deve oferecer ações de adicionar, buscar e definir/alterar pedidos. | Alta | Itens `Add Order`, `Search Orders` e `Set Order`. |
| RF-OH-05 | A aplicação deve disponibilizar menu “Customers”. | Alta | Código cria submenu `Customers`. |
| RF-OH-06 | O menu “Customers” deve oferecer ações de adicionar, buscar e editar clientes. | Alta | Itens `Add Customer`, `Search Customers` e `Edit Customer`. |
| RF-OH-07 | A aplicação deve disponibilizar menu “Help” com acesso a documentação. | Baixa | Item `Docs` no submenu `Help`. |
| RF-OH-08 | A interface web deve exibir cabeçalho “OrderHub Manager”. | Média | HTML define o título principal da interface. |
| RF-OH-09 | A interface web deve oferecer navegação para Home, Orders e Customers. | Média | HTML define navegação com esses links. |
| RF-OH-10 | A interface web deve oferecer ações rápidas de visualização e configurações. | Média | Branch de interface de usuário substituiu Login por botões `View` e `Settings`. |
| RF-OH-11 | A aplicação deve ter scripts padronizados para desenvolvimento, build e preview do frontend. | Média | `package.json` define scripts Vite. |
| RF-OH-12 | A aplicação deve ter comandos Wails para instalar dependências, construir frontend e iniciar watcher de desenvolvimento. | Média | `wails.json` define comandos de install/build/dev. |
| RF-OH-13 | A interface deve oferecer uma ação “Visualizar detalhes” para abrir a composição interna do ticket/orçamento. | Alta | Solicitação de stakeholder para exibir tabela detalhada ao visualizar o ticket. |
| RF-OH-14 | A tela de detalhes deve exibir tabela de componentes com valores, categorias e totais. | Alta | Exemplo citado: câmeras, mão de obra e outros componentes internos. |
| RF-OH-15 | A tela de detalhes deve disponibilizar botões para adicionar componente, remover componente e exportar arquivo. | Alta | Solicitação de stakeholder para manutenção dinâmica dos componentes e exportação. |
| RF-OH-16 | Ao adicionar componente, a interface deve permitir buscar item em uma tabela de valores/catálogo ou criar um componente manual. | Média | Suporta a “tabela x de valores” mencionada pelo stakeholder sem bloquear exceções operacionais. |

### 4.4 Requisitos não funcionais

| ID | Requisito | Prioridade | Justificativa |
| --- | --- | --- | --- |
| RNF-OH-01 | A aplicação deve ter tamanho inicial de janela suficiente para uso operacional. | Média | Janela configurada com 1024x768. |
| RNF-OH-02 | A interface deve usar componentes visuais consistentes. | Média | Uso de Bootstrap e classes `btn`, `btn-dark`, `btn-primary`. |
| RNF-OH-03 | A aplicação deve respeitar diferenças de menu entre macOS e Windows/Linux. | Média | Código adiciona menu de app no macOS e menu de edição fora do macOS. |
| RNF-OH-04 | O frontend deve permitir desenvolvimento com hot reload. | Baixa | Wails/Vite configurados para modo dev. |
| RNF-OH-05 | O build final deve embutir frontend para distribuição desktop. | Alta | `frontend/dist` é incorporado via `embed.FS`. |

### 4.5 Lacunas e riscos identificados

| ID | Lacuna/Risco | Impacto | Recomendação |
| --- | --- | --- | --- |
| GAP-OH-01 | A importação de `settings.css` existe no JavaScript e no HTML, mas o arquivo não está versionado no estado atual. | Build do frontend pode falhar ou gerar inconsistência visual. | Criar `settings.css` ou remover importação/referência até que haja tela de configurações. |
| GAP-OH-02 | Menus nativos possuem callbacks vazios ou apenas `fmt.Println`. | A interface sugere funcionalidades ainda não implementadas. | Conectar ações a telas, diálogos ou métodos de backend. |
| GAP-OH-03 | Não há persistência de dados definida para pedidos/clientes/orçamentos. | O sistema não consegue cumprir requisitos de gestão real sem armazenamento. | Definir banco local, schema e camada de repositório. |
| GAP-OH-04 | Não há autenticação/autorização implementada, apesar de histórico de interface conter botão de Login. | Risco de acesso indevido em ambiente compartilhado. | Definir estratégia de usuários/perfis antes de liberar uso real. |
| GAP-OH-05 | A documentação Wails permanece genérica e não descreve domínio, fluxos e requisitos do produto. | Dificulta manutenção e alinhamento de escopo. | Substituir/complementar README técnico com documentação funcional do OrderHub. |

## 5. Casos de uso essenciais

### UC-01 — Cadastrar cliente

- **Ator principal:** Funcionário/operador.
- **Pré-condições:** Aplicação iniciada; usuário autorizado.
- **Fluxo principal:**
  1. Operador acessa `Customers > Add Customer`.
  2. Sistema apresenta formulário de cliente.
  3. Operador informa dados obrigatórios.
  4. Sistema valida e salva o cliente.
  5. Sistema confirma cadastro.
- **Pós-condição:** Cliente disponível para busca e associação a pedidos/orçamentos.

### UC-02 — Cadastrar pedido

- **Ator principal:** Funcionário/operador.
- **Pré-condições:** Cliente existente ou dados mínimos do solicitante informados.
- **Fluxo principal:**
  1. Operador acessa `Orders > Add Order`.
  2. Sistema apresenta formulário de pedido.
  3. Operador informa cliente, itens, quantidades e observações.
  4. Sistema calcula valores.
  5. Sistema salva pedido.
- **Pós-condição:** Pedido disponível para consulta e acompanhamento.

### UC-03 — Simular orçamento

- **Ator principal:** Funcionário/operador.
- **Pré-condições:** Configurações comerciais mínimas definidas.
- **Fluxo principal:**
  1. Operador inicia simulação de orçamento.
  2. Sistema solicita cliente e itens.
  3. Sistema calcula subtotal, descontos/taxas e total.
  4. Operador revisa o orçamento.
  5. Sistema salva ou exporta o orçamento.
- **Pós-condição:** Orçamento registrado e apto a virar pedido.

### UC-04 — Detalhar e exportar ticket/orçamento

- **Ator principal:** Funcionário/operador.
- **Pré-condições:** Ticket/orçamento existente, por exemplo no valor inicial de R$ 800.
- **Fluxo principal:**
  1. Operador localiza o ticket/orçamento.
  2. Operador clica em “Visualizar detalhes”.
  3. Sistema exibe tabela com componentes internos, como câmeras, mão de obra e demais valores.
  4. Operador adiciona, remove ou edita componentes, selecionando itens de uma tabela de valores/catálogo ou criando componentes avulsos.
  5. Sistema recalcula subtotal e total do ticket/orçamento.
  6. Operador clica em “Exportar”.
  7. Sistema gera um arquivo com o resumo e a composição detalhada do ticket/orçamento.
- **Pós-condição:** Ticket/orçamento atualizado e arquivo de exportação disponibilizado ao operador.

### UC-05 — Consultar pedido ou cliente

- **Ator principal:** Funcionário/operador.
- **Pré-condições:** Existência de registros cadastrados.
- **Fluxo principal:**
  1. Operador acessa busca de pedidos ou clientes.
  2. Sistema exibe campos de filtro.
  3. Operador informa termo de busca.
  4. Sistema lista resultados compatíveis.
  5. Operador seleciona um resultado para visualizar detalhes.
- **Pós-condição:** Registro consultado e disponível para ação posterior.

## 6. Backlog sugerido por prioridade

### Prioridade alta

1. Corrigir lacuna do `settings.css` para estabilizar build do frontend.
2. Definir modelo de dados inicial para clientes, pedidos, itens, orçamentos, tickets, componentes detalhados e tabela de valores.
3. Implementar persistência local.
4. Implementar telas de cadastro e busca de clientes.
5. Implementar telas de cadastro e busca de pedidos.
6. Implementar cálculo inicial de orçamento.
7. Implementar tela de detalhes do ticket/orçamento com tabela de componentes, ações de adicionar/remover e recálculo automático.
8. Implementar exportação de ticket/orçamento detalhado em arquivo.
9. Implementar cadastro ou carga inicial da tabela de valores/catálogo de componentes.

### Prioridade média

1. Implementar tela de configurações do negócio.
2. Conectar menus nativos às telas do frontend.
3. Implementar edição de clientes e pedidos.
4. Definir status de pedido e orçamento.
5. Melhorar README do OrderHub com instruções funcionais.

### Prioridade baixa

1. Implementar atalho para documentação.
2. Criar fluxo de autenticação e perfis caso o uso seja multiusuário.
3. Adicionar exportação/impressão de orçamento.
4. Adicionar testes automatizados para regras de cálculo.

## 7. Critérios de aceite gerais

- O sistema deve permitir que um operador cadastre, consulte e edite clientes.
- O sistema deve permitir que um operador cadastre e consulte pedidos.
- O sistema deve permitir simular orçamento com cálculo de total.
- O sistema deve permitir abrir detalhes de um ticket/orçamento e visualizar sua composição em tabela.
- O sistema deve permitir adicionar e remover componentes de um ticket/orçamento, recalculando o total apresentado.
- O sistema deve permitir adicionar componentes a partir de uma tabela de valores/catálogo ou por preenchimento manual.
- O sistema deve permitir exportar o ticket/orçamento detalhado como arquivo.
- A aplicação desktop deve abrir com título, menus e interface principal do OrderHub.
- O build do frontend não deve depender de arquivos inexistentes.
- As ações expostas em menu ou botões devem ter comportamento implementado ou estar claramente desabilitadas/rotuladas como futuras.

## 8. Perguntas em aberto

1. Quais são os campos obrigatórios de cliente para o negócio alvo?
2. O orçamento deve virar pedido automaticamente ou por aprovação manual?
3. Haverá controle de estoque/produtos ou apenas itens livres de orçamento?
4. O sistema será monoempresa ou multiempresa?
5. Será necessário login/perfil de usuário nesta fase?
6. Qual armazenamento local será adotado: SQLite, arquivo JSON ou outro banco?
7. Haverá emissão de PDF, impressão ou envio por e-mail dos orçamentos?
8. Qual formato de exportação do ticket/orçamento detalhado será priorizado: PDF, CSV, XLSX ou outro?
9. O valor total do ticket/orçamento sempre será calculado pelos componentes ou poderá existir ajuste manual do total?
10. Quais categorias de componentes devem existir inicialmente, além de câmeras e mão de obra?
11. A tabela de valores será cadastrada manualmente no sistema ou importada de planilha/arquivo externo?
