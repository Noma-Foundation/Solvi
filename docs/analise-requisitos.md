# Análise de requisitos — OrderHub e OrderRequester

## 1. Apresentação dos sistemas

A solução é composta por dois sistemas complementares:

1. **OrderRequester**: site/portal usado pelo comprador/cliente para solicitar um pedido, informar necessidades do serviço, visualizar uma estimativa de orçamento e exportar ou salvar o orçamento gerado.
2. **OrderHub**: sistema de gestão usado por membros internos, suporte e organização para controlar solicitações recebidas, analisar serviços, gerenciar orçamentos, despachar ordens de serviço, acompanhar execução e atualizar status.

Em termos conceituais, o **OrderRequester** é a camada de solicitação e entrada de demanda, enquanto o **OrderHub** é a camada de gestão operacional. O comprador interage com o OrderRequester, e os membros internos interagem com o OrderHub. Os dois sistemas compartilham informações por uma interface de comunicação e uma base de dados/API, formando um fluxo distribuído entre solicitação, análise, cálculo, gestão e execução.

### 1.1 Perfis de usuários

| Perfil | Sistema principal | Descrição |
| --- | --- | --- |
| Comprador/Cliente | OrderRequester | Usuário externo que solicita serviços, informa dados, visualiza orçamento estimado e pode salvar/exportar o orçamento. |
| Membro interno | OrderHub | Usuário interno responsável por acompanhar solicitações, executar triagem técnica, atualizar status e apoiar a operação. |
| Suporte | OrderHub | Usuário interno com permissões para logar, gerenciar serviços, atualizar/deletar serviços, salvar relatórios e despachar ordens de serviço. |
| Organização | OrderHub | Representa a empresa/prestadora que gerencia orçamentos, presta serviços e controla a operação. |
| Sistema de cálculo/análise | OrderRequester e OrderHub | Serviço lógico responsável por analisar informações do cliente e calcular estimativas de orçamento. |

## 2. Fontes analisadas ou fontes de documentação

| Fonte | Evidência utilizada |
| --- | --- |
| `README.md` | Descreve o produto como sistema de pedidos e simulação de orçamentos para empresas e pequenos negócios. |
| `orderhub/README.md` | Indica base técnica Wails, modo de desenvolvimento e build distribuível. |
| `orderhub/wails.json` | Define metadados, comandos de instalação, build e desenvolvimento do app desktop OrderHub. |
| `orderhub/main.go` | Mostra menus nativos voltados a pedidos, clientes e ajuda, reforçando o papel do OrderHub como sistema de gestão. |
| `orderhub/frontend/index.html` | Contém interface inicial do OrderHub com navegação para Home, Orders e Customers. |
| Diagramas conceituais enviados | Mostram o comprador usando orçamento livre/portal de solicitação, a comunicação com sistema de gestão, fluxo de cálculo de estimativa e casos de uso de cliente, suporte e organização. |
| Solicitação de stakeholder | Necessidade de ticket/orçamento com detalhes internos: valor principal, tabela de componentes como câmeras e mão de obra, adição/remoção de componentes e exportação em arquivo. |

## 3. OrderRequester — Sistema de solicitação

### 3.1 Descrição do sistema

O **OrderRequester** é um site voltado ao comprador/cliente. Ele deve permitir que o cliente solicite um serviço, informe dados necessários para análise, receba uma estimativa de orçamento e visualize ou exporte o orçamento gerado.

O sistema deve funcionar como um portal de entrada de pedidos. Ele não é o sistema principal de gestão interna; sua responsabilidade é capturar a demanda, orientar o cliente e enviar as informações para análise e processamento pelo ecossistema do OrderHub.

### 3.2 Atores

| Ator | Descrição |
| --- | --- |
| Cliente/Comprador | Usuário externo que solicita o serviço, visualiza orçamento e exporta/salva arquivo. |
| Portal de solicitação | Interface web do OrderRequester que coleta os dados do cliente. |
| Processador de solicitações | Componente responsável por validar, organizar e encaminhar a solicitação. |
| Análise de serviço | Componente ou etapa que interpreta informações do serviço solicitado. |
| Calculadora de serviço/orçamento | Componente que calcula estimativa com base em dados do cliente, tabela de valores e regras de negócio. |
| Informações de dispositivos | Fonte de dados usada no cálculo quando o serviço depende de equipamentos, câmeras, dispositivos ou componentes. |
| Interface de comunicação | Camada/API que integra o OrderRequester com base de dados e OrderHub. |

### 3.3 Casos de uso

| ID | Caso de uso | Ator principal | Resultado esperado |
| --- | --- | --- | --- |
| UC-OR-01 | Enviar solicitação de serviço | Cliente/Comprador | Solicitação registrada e encaminhada para cálculo/análise. |
| UC-OR-02 | Calcular estimativa | Sistema | Orçamento aproximado calculado com base nas informações fornecidas. |
| UC-OR-03 | Visualizar orçamento | Cliente/Comprador | Cliente visualiza valor aproximado e composição resumida/detalhada permitida. |
| UC-OR-04 | Salvar orçamento em arquivo | Cliente/Comprador | Orçamento exportado, por exemplo em PDF, TXT, CSV ou outro formato definido. |
| UC-OR-05 | Consultar status da solicitação | Cliente/Comprador | Cliente acompanha andamento quando houver protocolo ou identificação da solicitação. |

### 3.4 Caminhos bons e ruins

#### Caminhos bons

1. Cliente acessa o portal de solicitação.
2. Cliente informa os dados necessários do serviço.
3. O sistema valida os dados obrigatórios.
4. O processador de solicitações envia os dados para análise de serviço.
5. A calculadora de orçamento gera uma estimativa.
6. O sistema apresenta o valor aproximado ao cliente.
7. O cliente visualiza detalhes do orçamento.
8. O cliente salva/exporta o orçamento.
9. A solicitação fica disponível para o OrderHub acompanhar e transformar em operação interna.

#### Caminhos ruins

| Situação | Comportamento esperado |
| --- | --- |
| Cliente envia formulário incompleto | Sistema deve informar campos obrigatórios e impedir envio inválido. |
| Dados informados não permitem cálculo confiável | Sistema deve apresentar mensagem de limitação e solicitar dados adicionais. |
| Calculadora de orçamento indisponível | Sistema deve salvar a solicitação como pendente de análise e informar retorno posterior. |
| Falha ao exportar arquivo | Sistema deve informar erro e permitir nova tentativa. |
| Solicitação duplicada | Sistema deve alertar ou agrupar solicitações semelhantes quando possível. |
| Falha de comunicação com OrderHub/API | Sistema deve manter solicitação em fila/retry e não perder dados do cliente. |

### 3.5 Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-OR-01 | O sistema deve permitir que o cliente envie uma solicitação de serviço. | Alta |
| RF-OR-02 | O sistema deve coletar informações do cliente e do serviço solicitado. | Alta |
| RF-OR-03 | O sistema deve validar campos obrigatórios antes de registrar a solicitação. | Alta |
| RF-OR-04 | O sistema deve encaminhar a solicitação para análise de serviço. | Alta |
| RF-OR-05 | O sistema deve calcular uma estimativa de orçamento com base nas informações fornecidas. | Alta |
| RF-OR-06 | O sistema deve exibir o valor aproximado do serviço ao cliente. | Alta |
| RF-OR-07 | O sistema deve permitir visualizar detalhes do orçamento/ticket quando disponíveis. | Alta |
| RF-OR-08 | O sistema deve permitir exportar ou salvar o orçamento em arquivo. | Alta |
| RF-OR-09 | O sistema deve permitir que o orçamento possua componentes internos, como câmeras, mão de obra e outros itens. | Alta |
| RF-OR-10 | O sistema deve permitir adicionar/remover componentes do orçamento quando o fluxo escolhido permitir orçamento livre. | Média |
| RF-OR-11 | O sistema deve recalcular o total quando componentes forem adicionados, removidos ou alterados. | Alta |
| RF-OR-12 | O sistema deve enviar a solicitação e o orçamento para integração com o OrderHub. | Alta |
| RF-OR-13 | O sistema deve gerar um identificador/protocolo para acompanhamento da solicitação. | Média |
| RF-OR-14 | O sistema deve permitir consultar status da solicitação quando houver protocolo. | Média |

### 3.6 Requisitos não funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RNF-OR-01 | O portal deve ser responsivo para uso em desktop e dispositivos móveis. | Alta |
| RNF-OR-02 | O fluxo de solicitação deve ser simples e compreensível para usuários externos. | Alta |
| RNF-OR-03 | O cálculo de estimativa deve retornar em tempo aceitável para experiência web. | Alta |
| RNF-OR-04 | O sistema deve proteger dados pessoais do cliente em trânsito e armazenamento. | Alta |
| RNF-OR-05 | O sistema deve registrar falhas de cálculo, exportação e integração para auditoria. | Média |
| RNF-OR-06 | O sistema deve manter disponibilidade compatível com uso público do portal. | Alta |
| RNF-OR-07 | A exportação do orçamento deve gerar arquivo legível e compartilhável. | Média |

### 3.7 Restrições de desenvolvimento

| ID | Restrição |
| --- | --- |
| RD-OR-01 | O OrderRequester deve ser implementado como aplicação web/site separado do app desktop de gestão. |
| RD-OR-02 | A comunicação com o OrderHub deve ocorrer por API, serviço de integração ou camada de comunicação definida. |
| RD-OR-03 | O frontend deve ser desenhado pensando em usuários externos, sem expor funcionalidades internas de gestão. |
| RD-OR-04 | O sistema deve suportar evolução para modelo SaaS e múltiplas organizações. |
| RD-OR-05 | A exportação deve usar formato definido pelo produto: PDF, CSV, XLSX, TXT ou combinação desses. |

## 4. Por que é um sistema distribuído

A solução é distribuída porque separa responsabilidades em componentes que podem executar em ambientes diferentes e se comunicam por rede ou camada de integração:

- O **OrderRequester** é um site público/externo usado pelo cliente.
- O **OrderHub** é o sistema interno de gestão usado por membros da organização.
- A **base de dados** centraliza solicitações, orçamentos, clientes, componentes e status.
- A **interface de comunicação/API** conecta portal, processador de solicitações, calculadora e sistema de gestão.
- A **calculadora de orçamento** pode ser um módulo separado para permitir evolução independente das regras de preço.
- O **processador de solicitações** pode validar, normalizar e enfileirar solicitações antes de enviá-las ao OrderHub.

Essa separação permite que o cliente solicite pedidos pelo site enquanto a equipe interna gerencia e executa esses pedidos em outro sistema. Também melhora escalabilidade, segurança e manutenção, porque o portal público não precisa carregar regras e permissões internas do sistema de gestão.

## 5. Aspectos de SaaS

A solução tem características de SaaS porque pode atender múltiplas organizações usando uma mesma base de produto, com separação lógica de dados e configurações por empresa.

### 5.1 Características esperadas

| Aspecto | Aplicação na solução |
| --- | --- |
| Multi-tenant | Cada organização deve visualizar apenas suas solicitações, clientes, orçamentos e serviços. |
| Configuração por organização | Tabelas de valores, categorias de componentes, regras de orçamento e dados da empresa podem variar por organização. |
| Portal externo | Clientes acessam o OrderRequester sem precisar instalar o OrderHub. |
| Gestão interna | Equipes usam o OrderHub para controlar operação e atendimento. |
| Auditoria | Alterações em orçamento, componentes, status e exportações devem ser rastreáveis. |
| Escalabilidade | O portal e os serviços de cálculo/comunicação podem escalar separadamente do sistema de gestão. |
| Segurança | Autenticação, autorização e isolamento de dados são obrigatórios em cenário multiempresa. |

### 5.2 Pontos de atenção para SaaS

- Definir estratégia de autenticação para clientes externos e usuários internos.
- Definir isolamento de dados por organização/tenant.
- Definir limites de uso, planos ou permissões por perfil.
- Definir logs e auditoria para alterações em orçamentos e ordens de serviço.
- Definir política de exportação e armazenamento de arquivos.

## 6. OrderHub — Sistema de gestão

### 6.1 Descrição do sistema

O **OrderHub** é o sistema de gestão interno da solução. Ele deve receber ou consultar solicitações geradas pelo OrderRequester, permitir triagem técnica, gerenciar orçamentos, controlar pedidos/ordens de serviço, atualizar status e apoiar a execução do serviço pela organização.

O OrderHub não é o portal principal do cliente. Seu foco é a operação interna: suporte, membros internos e organização controlam o ciclo de vida da solicitação desde a chegada até a prestação do serviço.

### 6.2 Atores

| Ator | Descrição |
| --- | --- |
| Membro interno | Acompanha solicitações, executa triagem e atualiza status. |
| Suporte | Gerencia serviços, relatórios, ordens de serviço e acessos internos. |
| Organização | Prestadora responsável por gerenciar orçamentos e prestar serviços. |
| Sistema de gestão | Aplicação OrderHub responsável por centralizar a operação. |
| Base de dados/API | Camada de persistência e comunicação com o OrderRequester. |

### 6.3 Caminhos bons e ruins

#### Caminhos bons

1. OrderRequester envia solicitação para a base/API.
2. OrderHub recebe ou lista a nova solicitação.
3. Membro interno realiza triagem técnica.
4. Sistema exibe orçamento calculado e componentes do ticket.
5. Usuário interno ajusta componentes, valores e status quando necessário.
6. Organização aprova ou gerencia o orçamento.
7. Suporte despacha ordem de serviço.
8. Equipe presta serviço e atualiza status.
9. Sistema registra relatório e histórico da operação.

#### Caminhos ruins

| Situação | Comportamento esperado |
| --- | --- |
| Solicitação chega com dados insuficientes | OrderHub deve marcar como pendente de informação ou solicitar revisão. |
| Orçamento calculado parece inconsistente | Usuário interno deve conseguir revisar componentes e registrar ajuste. |
| Componente de preço não existe na tabela | Sistema deve permitir componente avulso com justificativa ou encaminhar para cadastro. |
| Usuário tenta deletar serviço em andamento | Sistema deve bloquear ou exigir permissão elevada/justificativa. |
| Ordem de serviço não pode ser despachada | Sistema deve registrar motivo e manter status apropriado. |
| Falha de integração com OrderRequester | Sistema deve registrar erro, permitir retry e evitar perda de solicitação. |

### 6.4 Requisitos funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-OH-01 | O sistema deve permitir login de usuários internos. | Alta |
| RF-OH-02 | O sistema deve listar solicitações recebidas do OrderRequester. | Alta |
| RF-OH-03 | O sistema deve permitir visualizar detalhes de uma solicitação. | Alta |
| RF-OH-04 | O sistema deve permitir triagem técnica da solicitação. | Alta |
| RF-OH-05 | O sistema deve permitir gerenciar orçamentos vinculados a solicitações. | Alta |
| RF-OH-06 | O sistema deve exibir ticket/orçamento com tabela de componentes internos. | Alta |
| RF-OH-07 | O sistema deve permitir adicionar, editar e remover componentes do ticket/orçamento. | Alta |
| RF-OH-08 | O sistema deve permitir selecionar componentes a partir de tabela de valores/catálogo. | Alta |
| RF-OH-09 | O sistema deve permitir registrar componentes avulsos quando necessário. | Média |
| RF-OH-10 | O sistema deve recalcular totais ao alterar componentes do orçamento. | Alta |
| RF-OH-11 | O sistema deve permitir exportar orçamento/ticket detalhado como arquivo. | Alta |
| RF-OH-12 | O sistema deve permitir atualizar status do serviço. | Alta |
| RF-OH-13 | O sistema deve permitir gerenciar serviços: criar, atualizar, deletar e consultar. | Alta |
| RF-OH-14 | O sistema deve permitir despachar ordem de serviço. | Alta |
| RF-OH-15 | O sistema deve permitir salvar relatório de atendimento/serviço. | Média |
| RF-OH-16 | O sistema deve permitir gerenciar clientes relacionados às solicitações. | Média |
| RF-OH-17 | O sistema deve permitir pesquisar pedidos, clientes, orçamentos e serviços. | Média |
| RF-OH-18 | O sistema deve registrar histórico de alterações em status, orçamento e componentes. | Alta |

### 6.5 Requisitos não funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RNF-OH-01 | A aplicação deve ser adequada ao uso operacional interno. | Alta |
| RNF-OH-02 | O sistema deve controlar permissões por perfil, como suporte, membro interno e organização. | Alta |
| RNF-OH-03 | O sistema deve preservar histórico e rastreabilidade de alterações. | Alta |
| RNF-OH-04 | A interface deve apresentar tabelas e detalhes de orçamento de forma clara. | Alta |
| RNF-OH-05 | O sistema deve manter integração confiável com OrderRequester/API/base de dados. | Alta |
| RNF-OH-06 | O sistema deve suportar operação multiempresa em cenário SaaS. | Alta |
| RNF-OH-07 | A exportação de arquivo deve gerar documento consistente com os dados salvos. | Média |
| RNF-OH-08 | A aplicação deve manter compatibilidade com o ambiente desktop Wails enquanto esse for o caminho técnico escolhido. | Média |
| RNF-OH-09 | A aplicação deve registrar erros operacionais e falhas de integração para suporte. | Média |

### 6.6 Restrições de desenvolvimento

| ID | Restrição |
| --- | --- |
| RD-OH-01 | O OrderHub deve ser tratado como sistema de gestão, não como portal principal de solicitação do cliente. |
| RD-OH-02 | O OrderHub deve consumir dados do OrderRequester por API, base compartilhada ou interface de comunicação definida. |
| RD-OH-03 | Funcionalidades internas devem exigir autenticação e autorização. |
| RD-OH-04 | Alterações em orçamento, componentes e status devem ser persistidas e auditáveis. |
| RD-OH-05 | A tabela de valores/catálogo deve ser configurável por organização em cenário SaaS. |
| RD-OH-06 | O sistema deve evitar que usuários externos acessem telas administrativas. |
| RD-OH-07 | Enquanto o frontend atual referenciar `settings.css`, o arquivo deve existir ou a referência deve ser removida para permitir build estável. |

## 7. Entidades principais sugeridas

| Entidade | Campos sugeridos |
| --- | --- |
| Organização/Tenant | ID, nome, documento, plano, status, configurações. |
| Usuário interno | ID, organização, nome, e-mail, perfil, status. |
| Cliente | ID, organização, nome/razão social, documento, telefone, e-mail, endereço. |
| Solicitação | ID, cliente, organização, descrição, dados do serviço, status, origem, data de criação. |
| Ticket/Orçamento | ID, solicitação, cliente, organização, valor total, status, validade, data de criação. |
| Componente do ticket | ID, ticket, categoria, descrição, quantidade, valor unitário, valor total, origem do valor. |
| Tabela de valores | ID, organização, categoria, descrição, unidade, valor padrão, status, vigência. |
| Ordem de serviço | ID, solicitação, responsável, status, data de despacho, data de conclusão. |
| Relatório de serviço | ID, ordem de serviço, descrição, anexos, responsável, data. |
| Arquivo exportado | ID, ticket, formato, caminho/URL, data de geração, usuário solicitante. |

## 8. Backlog sugerido por prioridade

### Prioridade alta

1. Definir contrato de comunicação entre OrderRequester e OrderHub.
2. Definir modelo de dados de organização, cliente, solicitação, ticket, componentes e tabela de valores.
3. Implementar fluxo do OrderRequester para envio de solicitação e cálculo de estimativa.
4. Implementar tela do OrderRequester para visualizar e exportar orçamento.
5. Implementar autenticação e perfis internos no OrderHub.
6. Implementar listagem e detalhe de solicitações no OrderHub.
7. Implementar triagem técnica e atualização de status no OrderHub.
8. Implementar ticket/orçamento com tabela de componentes, adicionar/remover, recálculo e exportação.
9. Corrigir lacuna técnica do `settings.css` no frontend atual do OrderHub.

### Prioridade média

1. Implementar gestão da tabela de valores/catálogo por organização.
2. Implementar despacho de ordem de serviço.
3. Implementar relatório de serviço.
4. Implementar consulta de status pelo cliente no OrderRequester.
5. Implementar auditoria de alterações de orçamento e status.

### Prioridade baixa

1. Implementar envio de orçamento por e-mail ou link compartilhável.
2. Implementar importação de tabela de valores por planilha.
3. Implementar dashboards de operação no OrderHub.
4. Implementar métricas SaaS por organização.

## 9. Critérios de aceite gerais

- O cliente deve conseguir enviar uma solicitação pelo OrderRequester.
- O cliente deve conseguir visualizar o valor aproximado do orçamento.
- O cliente deve conseguir exportar ou salvar o orçamento em arquivo.
- O OrderHub deve receber ou consultar solicitações vindas do OrderRequester.
- Um usuário interno deve conseguir visualizar detalhes da solicitação no OrderHub.
- Um usuário interno deve conseguir visualizar e gerenciar componentes do ticket/orçamento.
- O total do ticket/orçamento deve ser recalculado quando componentes forem adicionados, removidos ou alterados.
- O sistema deve permitir exportar o ticket/orçamento detalhado como arquivo.
- O OrderHub deve permitir atualizar status e despachar ordem de serviço.
- O sistema deve separar permissões de cliente externo e usuário interno.

## 10. Perguntas em aberto

1. O OrderRequester terá login para clientes ou permitirá solicitação sem conta?
2. Qual formato de exportação será obrigatório na primeira versão: PDF, TXT, CSV ou XLSX?
3. O orçamento livre poderá ser editado pelo cliente ou apenas por usuários internos?
4. A tabela de valores será global, por organização ou por tipo de serviço?
5. Quais categorias iniciais existirão além de câmeras e mão de obra?
6. O valor total sempre será a soma dos componentes ou haverá ajuste manual autorizado?
7. Como será feita a integração entre OrderRequester e OrderHub: API REST, banco compartilhado, fila ou outro mecanismo?
8. O OrderHub continuará como app desktop Wails ou também terá versão web administrativa?
9. Quais status de solicitação e ordem de serviço devem existir?
10. Quais perfis internos precisam de permissão para deletar serviço ou alterar orçamento já aprovado?
