# Instruções para agentes neste repositório

## Fonte de verdade

Antes de implementar ou alterar a aplicação, leia [SPECS.md](SPECS.md) integralmente. Ela registra os requisitos do desafio Sezzle, as decisões adotadas, o contrato da API, o plano de 3–4 horas e os critérios de aceite.

Se a tarefa atual for apenas revisar documentação, limite as alterações à documentação. Quando o usuário solicitar a implementação, execute as etapas da seção 11 da especificação.

## Prioridades

1. Correção das quatro operações obrigatórias pelo backend Go.
2. Interface React com TypeScript, validação, erros e responsividade.
3. Testes relevantes nas duas camadas e cobertura medida.
4. README reproduzível em inglês e registro fiel dos prompts.
5. Publicação no repositório informado, quando fizer parte da tarefa autorizada.

Operações avançadas e Docker são opcionais. Não sacrificar os itens anteriores por extras. Não introduzir banco de dados, autenticação, parser de expressões ou infraestrutura desnecessária.

## Forma de trabalhar

- Inspecionar arquivos, instruções e estado Git; preservar alterações existentes.
- Usar inglês no código, na interface, nas mensagens da API e no README.
- Manter a lógica matemática independente de HTTP e os cálculos no backend.
- Seguir o contrato e as decisões explícitas de `SPECS.md`; registrar justificativa para qualquer ajuste necessário.
- Concluir e verificar cada etapa antes de avançar. Manter um registro curto em `docs/implementation-status.md` durante a implementação.
- Registrar os prompts realmente utilizados em `PROMPTS.md`, sem inventar histórico.
- Executar testes, cobertura, verificação de tipos/build, formatação e `go vet` conforme a especificação.
- Nunca inventar resultados de testes, cobertura, tempo gasto, publicação ou envio ao recrutador.
- Usar o repositório https://github.com/eduardoalmeidajesus/calculator-sezzle como destino informado pelo usuário; verificar remote e autenticação antes de publicar e preservar o histórico.

## Conclusão

Conferir todos os critérios de aceite aplicáveis em `SPECS.md`. Informar funcionalidades entregues, verificações executadas, cobertura, limitações e pendências externas. A existência de documentação ou de um checklist marcado não substitui a implementação e a execução das verificações.
