# Plano — correção dos erros de TypeScript

> **Para execução:** seguir as tarefas na ordem neste workspace. As instruções do projeto proíbem testes e os comandos `git`, `typecheck`, `build` e `lint`; a revisão será estática.

**Objetivo:** corrigir os 29 diagnósticos listados no log fornecido, cobrindo seis causas em seis arquivos.

**Abordagem:** remover propriedades JSX duplicadas nos pontos de uso, preservar tipos literais na seleção de arquivos, explicitar o acesso opcional às claims e mapear o papel do rascunho a partir do argumento que já filtra a consulta.

**Stack:** TypeScript, React/JSX, Next.js 16 App Router e tipos gerados do Supabase já presentes no projeto.

**Spec:** `docs/superpowers/specs/2026-11-03-typecheck-error-cleanup-design.md`

## Restrições globais

- Não executar `git`, `typecheck`, `build`, `lint` ou `test`; não criar testes.
- Preservar comportamento, conteúdo, animações, acessibilidade e contratos das ações.
- Não substituir a validação do papel por uma asserção de tipo sem verificação.

## Foco da revisão

- IDs dos controles continuam ligados ao `htmlFor` e aos atributos ARIA corretos.
- O atributo de reveal continua vindo do helper nos elementos animados.
- Os caminhos de autenticação e seleção de comprovantes mantêm a mesma lógica.
- O papel do rascunho continua limitado pela consulta e pela restrição do banco.

---

### Tarefa 1: Remover IDs redundantes nos campos profissionais

**Arquivos:**
- Modificar: `components/ehfi/professional-signup.tsx`

- [x] Remover o `id` escrito diretamente dos 17 controles que também recebem `fieldProps(id, error)`.
- [x] Preservar `fieldProps()` para que ele continue definindo o ID e os atributos ARIA, inclusive nos campos de senha.
- [x] Revisar estaticamente os 17 usos e conferir que os valores continuam iguais aos IDs passados a `FormField`.

### Tarefa 2: Remover atributos de reveal duplicados

**Arquivos:**
- Modificar: `components/ehfi/role-card.tsx`
- Modificar: `components/ehfi/welcome-screen.tsx`

- [x] Remover as declarações locais repetidas de `data-ehfi-reveal` nos três cards e nos cinco elementos da tela inicial.
- [x] Manter `entranceProps()` e revisar que ele continua sendo aplicado a todos os oito elementos.

### Tarefa 3: Corrigir os dois tipos nas ações de cadastro

**Arquivos:**
- Modificar: `app/actions/registrations.ts`

- [x] Ler o email com acesso opcional às claims de `getClaims()`, sem mudar o retorno para sessão correspondente ou divergente.
- [x] Construir `selectedKinds` como `Set<DraftFileReference["kind"]>` com inserções condicionais tipadas, evitando arrays inferidos como `string[]`.
- [x] Revisar estaticamente que somente o comprovante acadêmico exigido e o documento CREF correspondente ao ramo ativo são permitidos.

### Tarefa 4: Remover a checagem inalcançável de carregamento

**Arquivos:**
- Modificar: `components/ehfi/company-signup.tsx`

- [x] Remover `draft.status === "loading"` do `disabled` do botão, mantendo a condição `submitting`.
- [x] Conferir estaticamente que a tela retorna o estado de carregamento antes de renderizar o botão.

### Tarefa 5: Tipar o papel ao retornar um rascunho

**Arquivos:**
- Modificar: `lib/registration-drafts/repository.ts`

- [x] Retornar `null` explicitamente quando a consulta não encontra linha.
- [x] Com linha, retornar os dados com `role` fornecido à função, que já está aplicado no filtro `.eq("role", role)`.
- [x] Conferir a restrição de valores de papel na migração e evitar conversão por asserção.

### Verificação permitida

- [x] Revisar os trechos modificados e as ocorrências restantes dos spreads/helpers.
- [x] Registrar que nenhuma suíte ou compilação foi executada, pois os comandos estão proibidos pelo projeto.

## Resultado da execução

- As alterações foram aplicadas diretamente no workspace atual, conforme solicitado.
- A revisão estática confirmou 17 usos de `fieldProps()` sem IDs duplicados, oito aplicações de `entranceProps()` sem atributos locais repetidos, o retorno tipado do repositório e a guarda de carregamento antes do botão da empresa.
- `git`, `typecheck`, `build`, `lint` e `test` não foram executados. A ausência de execução do TypeScript deixa a confirmação do compilador pendente.
