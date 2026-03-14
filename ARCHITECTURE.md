# Arquitetura inspirada no Fedimint

Este MVP replica conceitos centrais de uma carteira comunitária para federação:

1. **Cliente da federação** (`FederationWalletService`)
   - Ponto único para operações de recebimento e envio.
   - Mantém o estado da carteira da comunidade.
2. **Módulos de pagamento por rail**
   - `PaymentRail::Onchain`
   - `PaymentRail::Lightning`
3. **Operações com histórico (e-cash lifecycle simplificado)**
   - `OperationKind::Receive`
   - `OperationKind::Send`
   - Registro de operações recentes para auditoria local.
4. **API de integração**
   - Endpoints para `state`, `receive`, `send`.
5. **UI cliente**
   - Dashboard da federação/comunidade.
   - Fluxos de teste on-chain e LN.

> Observação: este projeto é um simulador de integração e UX; não implementa criptografia, consenso federado, nem mint/notes reais do protocolo Fedimint.
