# Spec — limpeza dos diagnósticos de TypeScript

## Intenção

Corrigir os 29 diagnósticos do log de `pnpm typecheck`, reduzindo-os às seis causas identificadas e mantendo o comportamento funcional dos cadastros, da autenticação e dos rascunhos.

## Estado atual

- O log informa 29 erros em seis arquivos.
- Dezessete erros vêm de `fieldProps()` reaplicar `id` em campos que também o declaram diretamente.
- Oito erros vêm de elementos que declaram `data-ehfi-reveal` e recebem o mesmo atributo por `entranceProps()`.
- Os quatro restantes são: acesso a claims possivelmente nulos, tipos literais alargados para `string[]`, comparação inalcançável com o estado `loading` e o campo `role` do banco tipado como `string`.

## Objetivos

- Eliminar os 29 diagnósticos reportados sem alterar o fluxo ou a aparência dos cadastros.
- Manter IDs compatíveis com `Label htmlFor`, `aria-invalid` e `aria-describedby`.
- Manter `data-ehfi-reveal` nos elementos animados por meio de `entranceProps()`.
- Preservar a filtragem de documentos permitidos e os ramos de autenticação existentes.
- Retornar rascunhos com um `RegistrationRole` confiável, preservando o caso de ausência de linha.

## Fora de escopo

- Alterar validações de cadastro, regras de autorização, schema do Supabase ou comportamento de animação.
- Adicionar ou executar testes.
- Alterar outros diagnósticos que não aparecem no log fornecido.

## Requisitos e restrições

- Tratar o log fornecido como a evidência dos erros atuais; não executar `git`, `typecheck`, `build`, `lint` ou `test`.
- Não criar testes automatizados.
- Não usar asserções amplas para converter `string` em `RegistrationRole`.
- Em `readRegistrationDraft`, preservar o filtro `.eq("role", role)` e tratar o retorno nulo antes de mapear a linha.
- As alterações em componentes client-side não devem introduzir APIs ou limites novos do Next.js.

## Critérios de aceite

- Cada campo coberto por `fieldProps()` declara seu `id` uma única vez no elemento final, e a associação entre label e controle continua igual.
- Os oito elementos afetados continuam recebendo `data-ehfi-reveal` via `entranceProps()`.
- `getClaims()` permanece seguro quando não há claims; o conjunto de documentos aceita apenas os tipos declarados em `DraftFileReference["kind"]`.
- O botão da empresa mantém `disabled={submitting}` depois do retorno antecipado de carregamento.
- `readRegistrationDraft()` retorna `null` sem linha e, com linha, usa o papel já filtrado pela consulta.
- A revisão final é estática; não afirmar que o compilador foi executado.
