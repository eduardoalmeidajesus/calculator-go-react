# Especificação do projeto — Calculadora Sezzle

## 1. Objetivo

Construir uma calculadora full-stack com frontend React e um microserviço backend em Go. O frontend deve consumir a API REST para executar os cálculos e apresentar os resultados.

O projeto deve demonstrar correção, clareza, manutenção simples e arquitetura testável. O tempo sugerido pelo desafio é de **2 a 4 horas**, com entrega em até **5 dias úteis após o recebimento do convite**.

Este documento traduz o desafio em um plano de implementação. Os contratos de API, a estrutura de pastas e as ferramentas abaixo são decisões propostas; não são exigências adicionais da Sezzle.

## Instruções de execução para o Codex

**Repositório de destino:** https://github.com/eduardoalmeidajesus/calculator-sezzle

**Decisão de escopo:** concluir uma aplicação pequena e bem acabada com as quatro operações obrigatórias, testes nas duas camadas, cobertura e documentação. Planejar **3 horas para a entrega essencial e até 1 hora de margem**. Operações avançadas e Docker continuam opcionais, conforme o e-mail, mesmo que o objetivo inicial mencione operações básicas e avançadas.

Este arquivo é a especificação de implementação. Sua existência não significa que a aplicação esteja implementada. Quando receber a tarefa de implementar:

1. Ler este arquivo inteiro e inspecionar os arquivos e o estado Git antes de alterar o projeto. Preservar trabalho existente e verificar o remote antes de publicar.
2. Trabalhar pelas etapas da seção 11, concluindo implementação e verificação de cada etapa antes de avançar. Não aguardar aprovação entre decisões técnicas rotineiras já cobertas por esta especificação.
3. Usar React com TypeScript e Go. React é obrigatório no e-mail; TypeScript e Go são preferências do e-mail que adotamos como decisões deste projeto.
4. Escrever código, interface, mensagens da API, README e descrições técnicas em **inglês**, para facilitar a avaliação. Esta especificação pode permanecer em português. Os textos em português nos exemplos abaixo explicam o comportamento; a implementação deve usar equivalentes em inglês.
5. Preferir funções pequenas, estado local React, `fetch` e biblioteca padrão Go. Não adicionar Redux, ORM, banco de dados, frameworks backend, monorepo tooling ou bibliotecas visuais sem necessidade concreta.
6. Registrar os prompts de implementação em `PROMPTS.md` durante o trabalho. Preservar o texto dos prompts disponíveis, identificando trechos omitidos por privacidade. Não inventar prompts ou conversas ausentes.
7. Executar os comandos de verificação e corrigir as falhas antes de declarar uma etapa concluída. Registrar impedimentos reais e verificações não executadas com clareza.
8. Usar a margem primeiro para correções. Não trocar testes, cobertura ou documentação por funcionalidades opcionais.
9. Ao concluir, informar o que foi implementado, os comandos executados, a cobertura medida, limitações e o estado da publicação. Nunca declarar push, testes ou entrega ao recrutador sem evidência.

### Rastreabilidade com o e-mail

| Exigência do processo | Evidência esperada na entrega |
| --- | --- |
| Full-stack e cálculos pelo backend | Formulário React integrado a `POST /api/calculate` e verificação com os dois serviços ativos |
| Quatro operações básicas | Implementação e testes de `add`, `subtract`, `multiply` e `divide` |
| Validação e edge cases | Testes de entradas inválidas, zero, decimais, negativos e divisão por zero |
| Interface intuitiva e responsiva | Formulário acessível, mensagens claras e verificação em desktop e mobile |
| Código limpo e testável | Lógica matemática independente do handler HTTP e cliente HTTP separado da UI |
| Testes e relatório de cobertura | Testes nas duas camadas e `docs/coverage.md` com resultados reais |
| Setup, execução, API e decisões | README em inglês com comandos reproduzíveis |
| Compartilhar prompts | `PROMPTS.md` referenciado no README |
| Repositório e envio do link | Código publicado no repositório informado e link preparado para o candidato enviar |
| Operações avançadas e Docker | Somente se implementados e verificados dentro da margem; sua ausência não impede a entrega obrigatória |

## 2. Escopo e prioridades

### Obrigatório

- Adição, subtração, multiplicação e divisão.
- Interface React com entrada de dados e exibição de resultados.
- Integração real entre frontend e backend para executar as operações.
- Validação de entradas e tratamento de erros nas duas camadas.
- Layout responsivo com suporte básico a dispositivos móveis.
- API REST com respostas JSON.
- Código organizado, legível e idiomático.
- Testes unitários das principais funcionalidades de frontend e backend.
- Relatórios de cobertura das duas camadas.
- README com instalação, execução, exemplos de API e decisões de projeto.
- Repositório publicado em GitHub, GitLab ou equivalente.
- Registro dos prompts utilizados com ferramentas de IA.

### Opcional, somente após concluir o obrigatório

- Exponenciação, raiz quadrada e porcentagem.
- Dockerfile para executar frontend e backend juntos.

### Fora do escopo

- Autenticação, usuários e banco de dados.
- Histórico persistente ou sincronizado.
- Parser de expressões livres, precedência de operadores ou parênteses.
- Calculadora científica completa.
- Orquestração de serviços ou infraestrutura de produção.

## 3. Tecnologias propostas

| Camada | Tecnologia | Justificativa |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Tipagem e configuração enxuta |
| Estilos | CSS simples | Suficiente para uma interface pequena e responsiva |
| Testes do frontend | Vitest + React Testing Library | Verificação de comportamento dos componentes |
| Backend | Go com `net/http` e `encoding/json` | Biblioteca padrão suficiente para a API |
| Testes do backend | `testing` + `net/http/httptest` | Testes da lógica e dos handlers sem servidor externo |
| Persistência | Nenhuma | Operações independentes e sem estado |

Registrar no README as versões utilizadas e os pré-requisitos. Versionar o lockfile do frontend e os arquivos de módulo Go aplicáveis.

## 4. Requisitos funcionais

### RF01 — Executar cálculos

O usuário deve poder informar dois operandos, selecionar uma operação e acionar o cálculo. O frontend envia os dados ao backend e exibe o resultado retornado.

| Operação | Identificador na API | Regra | Exemplo |
| --- | --- | --- | --- |
| Adição | `add` | `a + b` | `2 + 3 = 5` |
| Subtração | `subtract` | `a - b` | `2 - 3 = -1` |
| Multiplicação | `multiply` | `a * b` | `-2 * 3 = -6` |
| Divisão | `divide` | `a / b`, com `b != 0` | `7 / 2 = 3.5` |

Aceitar números inteiros, decimais, negativos e zero. Zero é uma entrada válida e não pode ser confundido com campo vazio.

### RF02 — Validar entradas

- Exigir os operandos necessários à operação.
- Rejeitar campos vazios e valores que não representem números finitos.
- Validar a operação contra a lista suportada.
- Rejeitar divisão por zero, incluindo zero negativo.
- Rejeitar resultados não finitos, como overflow.
- Validar novamente no backend, independentemente das verificações do frontend.

### RF03 — Exibir estados e erros

- Exibir estado de carregamento durante a chamada da API.
- Impedir envios duplicados enquanto houver requisição em andamento.
- Apresentar mensagens compreensíveis para validação, falha de rede e erro do servidor.
- Ao iniciar uma nova tentativa, limpar o resultado anterior para evitar ambiguidade.
- Permitir corrigir as entradas e tentar novamente após um erro.

### RF04 — Limpar formulário

Disponibilizar uma ação para limpar entradas, resultado e mensagens. Durante uma requisição, desabilitar essa ação ou cancelar/ignorar a resposta pendente.

### Decisões de comportamento para evitar ambiguidades

- Iniciar com ambos os campos vazios e operação `add` selecionada; não realizar chamadas no carregamento inicial.
- Manter os valores digitados como strings no estado React. Aplicar `trim()` e verificar vazio antes de converter com `Number`; não usar `parseFloat`, que pode aceitar entradas parcialmente inválidas.
- Para comportamento previsível entre ambientes, usar campos de texto com `inputMode="decimal"`. Aceitar sinal, decimais com ponto e notação científica; rejeitar vírgula, hexadecimal e conteúdo misturado. Exibir a dica “Use a dot for decimals, e.g. 1.5”. Uma expressão regular simples pode validar a sintaxe antes de `Number.isFinite`.
- Considerar sintaxe decimal válida `^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$`. Exemplos válidos: `0`, `-2`, `1.5`, `.5`, `1e-3`. Exemplos inválidos: `1,5`, `0x10`, `12abc`, `Infinity`.
- Desabilitar campos, seletor e botões durante a requisição. Ao alterar uma entrada ou operação, limpar resultado e erro anteriores.
- Validar divisão por zero no frontend para feedback imediato; manter a mesma proteção no backend.
- Usar timeout de 10 segundos no cliente com `AbortController`, limpar o timer ao terminar e mostrar erro recuperável. Não adicionar retries automáticos.
- Validar a resposta recebida: sucesso exige `result` numérico e finito. JSON inesperado ou corpo inválido devem gerar mensagem amigável, sem derrubar o componente.
- Exibir o resultado com `String(result)`, permitindo notação científica e documentando ponto flutuante. Não usar arredondamento fixo nem `toFixed(2)`.
- “Clear” restaura os campos vazios, a operação `add` e o estado inicial.

## 5. Interface e acessibilidade

Usar um formulário simples com dois campos numéricos, seletor de operação, botão “Calcular”, botão “Limpar” e área de resultado. Um teclado visual de calculadora não é necessário.

- Associar labels aos campos e usar elementos HTML semânticos.
- Permitir navegação por teclado e envio com Enter.
- Manter foco visível e contraste legível.
- Não comunicar erros somente por cor.
- Anunciar resultado e mensagens com uma região acessível, como `aria-live`.
- Exibir a interface sem rolagem horizontal em largura de 320 px.
- Informar o formato decimal aceito e evitar conversões silenciosas incorretas.

Não executar a aritmética no frontend como alternativa à API. O frontend pode validar entradas e formatar o resultado.

## 6. Contrato da API REST

### Endpoint

`POST /api/calculate`

Um endpoint único atende às quatro operações, reduzindo duplicação. Enviar `Content-Type: application/json`.

### Requisição

```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

- `operation`: string obrigatória com um identificador suportado.
- `a` e `b`: números JSON obrigatórios no escopo básico.
- Strings numéricas, booleanos, arrays, objetos e `null` não são operandos válidos.
- O backend deve distinguir campos ausentes de valores iguais a zero.
- Rejeitar campos desconhecidos. O corpo deve ser exatamente um objeto JSON; espaços após o objeto são permitidos, outro valor JSON não.
- Aceitar `application/json` com parâmetros, como `application/json; charset=utf-8`, usando parsing do media type.
- Validar primeiro método e media type; depois JSON e campos obrigatórios; depois operação e regras matemáticas. Testar erros individualmente sem depender de precedência entre vários erros no mesmo objeto.
- Para campos numéricos, ponteiros `*float64` no DTO permitem rejeitar ausência e `null` preservando zero válido. Usar `DisallowUnknownFields` e conferir EOF após o primeiro decode.

### Resposta de sucesso — HTTP 200

```json
{
  "result": 15
}
```

### Resposta de erro

```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Não é possível dividir por zero."
  }
}
```

| Status HTTP | Código de erro | Situação |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | JSON malformado, campos ausentes, tipos inválidos ou conteúdo extra após o JSON |
| 400 | `INVALID_OPERATION` | Operação não suportada |
| 400 | `DIVISION_BY_ZERO` | Divisor igual a zero |
| 400 | `NON_FINITE_RESULT` | Resultado fora do intervalo numérico suportado |
| 405 | `METHOD_NOT_ALLOWED` | Método não permitido no endpoint |
| 404 | `NOT_FOUND` | Rota de API inexistente |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Corpo enviado sem o tipo de conteúdo JSON |
| 500 | `INTERNAL_ERROR` | Falha inesperada do servidor |

Retornar `Content-Type: application/json` nas respostas da API e não expor detalhes internos em mensagens de erro. Para HTTP 405, incluir `Allow: POST`.

### Exemplos de chamadas

Exemplos em shell compatível com Bash; no README, adaptar ou adicionar alternativas para PowerShell se necessário.

```bash
# Adição: resultado esperado 15
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","a":10,"b":5}'

# Divisão: resultado esperado 3.5
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":2}'

# Erro esperado: HTTP 400 / DIVISION_BY_ZERO
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":0}'
```

## 7. Precisão numérica e operações opcionais

Usar `float64` no backend e `number` no frontend. Documentar as limitações de ponto flutuante, como a representação de `0.1 + 0.2`. Não prometer precisão financeira ou arbitrária.

A API retorna o valor numérico calculado sem arredondamento de negócio. Qualquer formatação visual deve ser documentada e não transformar números pequenos válidos em zero indevidamente.

Se houver tempo para operações adicionais, usar este contrato:

| Operação | Identificador | Operandos | Regra |
| --- | --- | --- | --- |
| Exponenciação | `power` | `a`, `b` | `a` elevado a `b`; rejeitar resultado não finito |
| Raiz quadrada | `sqrt` | Somente `a` | Exigir `a >= 0`; rejeitar `b` se enviado |
| Porcentagem | `percentage` | `a`, `b` | Calcular `a` por cento de `b`: `(a / 100) * b` |

Para raiz de número negativo, retornar HTTP 400 com código `INVALID_DOMAIN`. Ajustar formulário, documentação e testes ao adicionar operações opcionais. Deixar a semântica de porcentagem explícita na interface.

Caso `power` seja implementado, usar `math.Pow`: documentar `0^0 = 1`; resultados NaN retornam `INVALID_DOMAIN` e resultados infinitos retornam `NON_FINITE_RESULT`. Para `sqrt`, o campo `b` deve ser omitido pelo frontend e sua presença, inclusive `null`, deve ser rejeitada pela API; isso exige detectar presença no DTO opcional. Não adicionar essas regras ao escopo básico antes de ele estar concluído.

## 8. Arquitetura e organização

Separar responsabilidades sem criar camadas desnecessárias:

- **Componentes React:** formulário, estados visuais e apresentação.
- **Cliente HTTP:** serialização da requisição e interpretação das respostas.
- **Handler Go:** validação do contrato HTTP e construção das respostas.
- **Lógica de cálculo Go:** operações e regras matemáticas, sem dependência de HTTP.

Estrutura sugerida:

```text
/
├── README.md
├── SPECS.md
├── PROMPTS.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── App.test.tsx
│       ├── api/calculator.ts
│       └── styles.css
├── backend/
│   ├── go.mod
│   ├── cmd/server/main.go
│   └── internal/
│       ├── calculator/
│       │   ├── calculator.go
│       │   └── calculator_test.go
│       └── httpapi/
│           ├── handler.go
│           └── handler_test.go
└── docs/
    └── coverage.md
```

No desenvolvimento, usar o frontend na porta 5173 e o backend na porta 8080. Configurar o proxy do Vite para encaminhar `/api` ao backend e usar URLs relativas no cliente. Assim, não é necessário configurar CORS para o fluxo local proposto.

Se Docker for implementado, uma opção simples é servir o build estático do frontend pelo próprio serviço Go, mantendo `/api` para os cálculos.

### Configuração mínima de execução

- Backend: módulo `github.com/eduardoalmeidajesus/calculator-sezzle/backend`; executar `go run ./cmd/server` dentro de `backend/`. Permitir `PORT`, com padrão `8080`, e configurar timeouts HTTP razoáveis.
- Frontend: usar npm e fornecer scripts `dev`, `build`, `test` e `test:coverage`. `build` deve verificar TypeScript antes de gerar os assets; `test:coverage` deve executar uma vez e emitir cobertura em texto e HTML.
- Configurar `strict: true` no TypeScript e ambiente `jsdom` para os testes de UI. Incluir o provider de cobertura compatível com a versão instalada do Vitest.
- Setup local: `npm ci` dentro de `frontend/`, backend em um terminal e `npm run dev` em outro. Documentar o endereço `http://localhost:5173`.
- Ignorar `node_modules`, `dist`, relatórios HTML gerados e binários. Versionar o resumo de cobertura em Markdown. Não exigir Docker para executar ou avaliar o projeto.
- Não adicionar CI ou implantação pública como pré-requisito: o e-mail pede repositório publicado, não uma aplicação hospedada.

## 9. Estratégia de testes

### Backend

Usar testes orientados por tabela para a lógica matemática e `httptest` para o contrato HTTP.

- Quatro operações com resultados conhecidos.
- Números negativos, decimais e zero.
- Divisão por zero e por zero negativo.
- Operação inválida.
- Campos ausentes, `null` e tipos incorretos.
- JSON malformado e múltiplos valores JSON no mesmo corpo.
- Método HTTP e tipo de conteúdo incorretos.
- Overflow ou resultado não finito.
- Status, headers e estrutura JSON de sucesso e erro.

Para resultados de ponto flutuante, usar tolerância quando necessário.

### Frontend

Simular o limite HTTP para testar o comportamento sem depender de um servidor ativo.

- Renderização e identificação acessível dos controles.
- Envio da operação e dos operandos corretos.
- Exibição do resultado retornado pela API, incluindo zero.
- Bloqueio de envio com entradas inválidas.
- Estado de carregamento e prevenção de envio duplicado.
- Exibição de erros de API e de rede.
- Recuperação após erro e limpeza do formulário.

### Cobertura e verificação manual

Não há percentual mínimo exigido no enunciado. Priorizar caminhos críticos e erros; medir e registrar a cobertura efetivamente obtida, sem inventar resultados.

Comandos esperados, após configurar os scripts e a dependência de cobertura do frontend:

```bash
# Na pasta backend
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html

# Na pasta frontend
npm run test -- --run
npm run test:coverage
npm run build
```

Registrar em `docs/coverage.md` os comandos, a data da execução e os percentuais de cada camada. Explicar como gerar os relatórios detalhados; mantê-los disponíveis como arquivos de entrega ou artefatos acessíveis do repositório.

O próprio `docs/coverage.md` será o relatório versionado exigido na entrega. Incluir saída resumida real do Go (statements) e do Vitest (statements, branches, functions e lines), com escopo/exclusões declarados. Medir todo o código de aplicação, sem excluir lógica difícil para aumentar números; excluir apenas testes, configurações e artefatos gerados. Não é necessário versionar HTML, habilitar CI ou alcançar um percentual arbitrário.

Além dos testes, executar `gofmt` nos arquivos Go, `go vet ./...` e `go build ./...` no backend. Testar também a validação do corpo de resposta e o timeout do cliente HTTP. Preferir asserções de comportamento a snapshots extensos ou testes que apenas repetem o código.

Verificar manualmente a integração real das quatro operações, uma divisão por zero, uma falha de conexão e o layout em tela pequena.

## 10. Documentação e entrega

O `README.md` deve incluir:

1. Objetivo e funcionalidades implementadas.
2. Pré-requisitos e versões utilizadas.
3. Instalação a partir de um clone limpo.
4. Comandos para executar frontend e backend, com portas e configuração necessárias.
5. Contrato da API e exemplos de sucesso e erro.
6. Comandos de testes, build e geração dos relatórios de cobertura.
7. Arquitetura, decisões, premissas e limitações numéricas.
8. Funcionalidades opcionais implementadas e limitações conhecidas.
9. Referência ao arquivo `PROMPTS.md`.
10. Instruções de Docker, se implementado.

O `PROMPTS.md` deve registrar os prompts efetivamente usados, incluindo a solicitação de criação desta especificação, além da ferramenta utilizada e da finalidade de cada interação relevante. Não incluir segredos ou dados pessoais desnecessários.

Publicar o código e a documentação em um repositório acessível à equipe avaliadora e compartilhar o link pelo canal indicado no processo seletivo. Conferir o acesso antes do envio.

Usar o repositório informado no início deste documento. Na implementação, verificar autenticação, branch e remote reais antes do push; não substituir histórico remoto nem usar force push. Se a publicação estiver impedida por credenciais ou permissões, concluir os arquivos e verificações locais e relatar exatamente a pendência. Preparar uma mensagem curta em inglês com o link, mas deixar o envio ao recrutador com o candidato, salvo autorização explícita para enviar.

No README, diferenciar claramente “implemented” de “optional / not implemented”. Informar o tempo real aproximado gasto, se registrado; não afirmar que o trabalho coube em quatro horas sem essa informação. O prazo de cinco dias úteis depende da data de recebimento do e-mail, que não foi informada.

## 11. Etapas de implementação e limite de tempo

| Etapa | Orçamento | Condição para concluir |
| --- | --- | --- |
| 1. Inspeção e configuração | 15 min | Estrutura criada, versões registradas e comandos básicos funcionando |
| 2. Backend e testes | 45 min | Quatro operações, contrato JSON e testes de sucesso/erro passando |
| 3. Frontend e integração | 45 min | Formulário responsivo consumindo a API real com todos os estados |
| 4. Testes e revisão | 35 min | Testes de UI/cliente passando, build válido e integração real conferida |
| 5. Documentação e entrega essencial | 40 min | README, prompts, cobertura medida e revisão de arquivos para publicação |
| 6. Margem final | Até 60 min | Correções, eventual opcional completo e publicação verificada |

Total planejado: **3 horas para o essencial, com limite de planejamento de 4 horas**. As estimativas não garantem duração; comunicar desvios reais. Ao atingir três horas com requisitos pendentes, usar toda a margem para concluí-los.

Somente iniciar um opcional com o essencial verificado e pelo menos 30 minutos disponíveis. Priorizar uma operação adicional completa (API, UI, testes e documentação) antes de Docker. Docker só entra se houver tempo para efetivamente construir e executar a imagem; um Dockerfile não testado não conta como entrega concluída. É aceitável entregar somente o escopo obrigatório bem acabado.

Ao finalizar cada etapa, atualizar `docs/implementation-status.md` com estado (`pending`, `in progress`, `done` ou `blocked`), mudanças, verificações reais e pendências. Manter esse registro curto para que outra sessão do Codex consiga continuar sem repetir trabalho. Não criar um sistema de gestão de tarefas.

## 12. Critérios de aceite

- [ ] Uma pessoa consegue executar o projeto seguindo apenas o README.
- [ ] O frontend usa React com TypeScript e o backend usa Go.
- [ ] As quatro operações obrigatórias funcionam pela API.
- [ ] Inteiros, decimais, negativos e zero são tratados corretamente.
- [ ] Entradas inválidas e divisão por zero produzem erros claros.
- [ ] A API valida requisições independentemente do frontend.
- [ ] Carregamento, sucesso e falha são apresentados na interface.
- [ ] A interface funciona com teclado e em dispositivos móveis.
- [ ] Os testes das duas camadas passam e o build do frontend é concluído.
- [ ] A cobertura medida e suas instruções de reprodução estão disponíveis.
- [ ] README e registro de prompts estão completos.
- [ ] O repositório não contém credenciais, dependências instaladas ou arquivos temporários desnecessários.
- [ ] O repositório está publicado e acessível à equipe avaliadora.
- [ ] O link foi compartilhado dentro do prazo do desafio.
