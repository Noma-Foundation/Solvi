---
trigger: always_on
---

# About

This document explains the main objectives of the project. 

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
