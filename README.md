# OrderManager

O OrderManager é uma plataforma de gestão de pedidos e solicitações de serviço para a FixIT Support e outros clientes.

## Como funciona

O cliente envia uma solicitação no portal de serviços. A solicitação é validada, enriquecida com dados de dispositivo/serviço e encaminhada para estimativa de orçamento. O orçamento estimado retorna ao portal, enquanto o ciclo de vida completo da solicitação é gerenciado pelo sistema interno de gestão.

## Modelo conceitual de classes (alta coesão, baixo acoplamento)

### Entidades centrais de domínio

- **Cliente**: dados de identificação e contato.
- **MembroInterno**: perfil do operador interno e permissões.
- **SolicitacaoServico**: raiz de agregado para o ciclo de vida da solicitação (`rascunho`, `enviada`, `orcada`, `aprovada`, `em_andamento`, `concluida`, `cancelada`).
- **InfoDispositivo**: modelo, serial, condição e metadados de diagnóstico.
- **AnaliseServico**: resumo técnico e premissas da análise.
- **OrcamentoEstimado**: preço estimado, horas de trabalho, peças, validade e nível de confiança.
- **OrdemServico**: objeto interno de execução criado após aprovação.
- **HistoricoStatusSolicitacao**: log imutável de transições de status.

### Serviços de aplicação

- **ServicoEntradaSolicitacao**: recebe e valida novas solicitações.
- **OrquestradorSolicitacao**: coordena análise, precificação e transições de status.
- **ServicoAnalise**: aplica regras de negócio para análise técnica.
- **ServicoCalculoOrcamento**: calcula orçamento estimado com base em políticas de preço.
- **ServicoFluxoGestao**: conduz passos operacionais internos e atribuição.
- **ServicoNotificacao**: envia atualizações para clientes e membros internos.

### Portas (interfaces) para reduzir acoplamento

- **RepositorioSolicitacao**
- **RepositorioCliente**
- **RepositorioOrdemServico**
- **ProvedorPoliticaPreco**
- **ProvedorCatalogoDispositivo**
- **PublicadorEventos**
- **GatewayMensageria** (e-mail/SMS/notificações no portal)

> Serviços de aplicação dependem de interfaces, não de implementações concretas de infraestrutura.

### Adaptadores de infraestrutura

- **ControladorApiPortal**: endpoint HTTP para solicitações do cliente.
- **ControladorApiGestao**: endpoint para operações internas.
- **RepositorioSqlSolicitacao / RepositorioSqlOrdemServico**: persistência em banco de dados.
- **AdaptadorMotorOrcamento**: integração com motor de orçamento interno ou externo.
- **AdaptadorNotificacao**: integração com provedores de comunicação.

## Responsabilidades sugeridas dos objetos

- Manter **SolicitacaoServico** focada em invariantes e transições de estado.
- Manter regras de cálculo em **ServicoCalculoOrcamento**, não em controladores/entidades.
- Manter lógica de integração nos adaptadores, não nas classes de domínio.
- Usar eventos de domínio (ex.: `SolicitacaoEnviada`, `OrcamentoGerado`, `OrdemServicoCriada`) para desacoplar fluxos internos.

## Regras práticas antiacoplamento

1. Controladores apenas mapeiam DTOs de entrada/saída.
2. Serviços de aplicação orquestram casos de uso.
3. Entidades de domínio garantem regras de negócio.
4. Repositórios são interfaces nas camadas de domínio/aplicação.
5. Infraestrutura implementa interfaces e pode ser trocada sem alterar o domínio.
