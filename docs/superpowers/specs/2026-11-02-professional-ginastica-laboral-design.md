# Atuação em Ginástica Laboral no cadastro profissional

## Intenção

Adicionar ao cadastro demonstrativo de profissionais de Educação Física uma etapa opcional para registrar interesse, experiência e disponibilidade declarada para atuação em ginástica laboral.

## Objetivos

- Coletar as respostas dentro do cadastro profissional existente.
- Permitir que a etapa seja deixada sem resposta, sem impedir a conclusão do cadastro.
- Distinguir uma etapa sem resposta da resposta explícita “Não” à pergunta de interesse.
- Manter as respostas apenas na memória desta demonstração, conforme o comportamento atual do cadastro.
- Preservar a etapa de termos como última etapa do fluxo.

## Fora de escopo

- Busca, filtragem, pareamento ou encaminhamento de profissionais para empresas.
- Exposição das respostas para empresas, outros profissionais ou em um perfil público.
- Persistência, envio de dados, autenticação ou integração com banco de dados.
- Tela ou fluxo separado para editar respostas depois da inscrição.
- Integração externa para sugestões ou validação de cidades.

## Posição e navegação

O fluxo terá cinco etapas, nesta ordem:

1. Seus dados.
2. Sua formação.
3. Registro CREF.
4. Atuação em Ginástica Laboral.
5. Termos e confirmações.

A nova etapa usa a navegação, o stepper, os controles Voltar/Continuar e o movimento reduzido já existentes. A etapa pode ser aberta diretamente pelo stepper. A conclusão final continua validando as etapas atualmente obrigatórias; ginástica laboral não cria uma nova resposta obrigatória.

## Campos

### Interesse

- Pergunta: “Tem interesse em atender empresas com ginástica laboral?”
- Respostas: “Sim” e “Não”.
- A pergunta pode ficar sem resposta. Sem resposta não equivale a “Não”.
- Quando a resposta for “Não”, ocultar as perguntas dependentes. Se a pessoa voltar para “Sim”, restaurar os valores que havia preenchido enquanto a tela permanecia aberta.

### Campos exibidos quando o interesse for “Sim”

- Experiência: “Sim”; “Não”; “Não tenho experiência, mas tenho interesse em atuar na área”. Seleção única.
- Modalidades: sessões coletivas com todos os colaboradores; sessões separadas por setor; sessões por turno; “Todas as modalidades”. Seleção múltipla. “Todas as modalidades” é um atalho para selecionar as três modalidades concretas e não é armazenado como um valor separado.
- Períodos: manhã, tarde, noite e madrugada. Seleção múltipla.
- Horário específico: um intervalo opcional com início e término. O intervalo vale em conjunto para os dias selecionados. Se apenas um extremo estiver preenchido, solicitar o outro antes de sair da etapa ou concluir o cadastro; nenhum dos dois é exigido quando ambos estão vazios.
- Dias: segunda-feira a domingo. Seleção múltipla.
- Flexibilidade para empresas com turnos diferentes, inclusive noturnos: sim ou não. O texto de apoio diferencia essa flexibilidade dos períodos específicos em que a pessoa pode atender.
- Frequência: uma vez por semana; duas vezes por semana; três vezes por semana; todos os dias úteis; horários flexíveis, conforme negociação. Seleção única.
- Cidades/regiões de atendimento: lista de itens de texto adicionados pela própria pessoa, independente da cidade de residência. Permitir adicionar por teclado e remover cada item. Não usar serviço externo de localidades.
- Deslocamento: sim; não; sim, dependendo da distância. Seleção única.

Todos os campos dependentes são opcionais. A ausência de resposta à pergunta principal também é permitida. A validação do intervalo de horário só atua quando um dos campos início/término tiver sido preenchido.

## Modelo de dados

Adicionar um modelo específico em `lib/professional-registration.ts` para manter as respostas agrupadas e tipadas:

- interesse: `"yes" | "no" | null`;
- experiência: enumeração das três respostas ou `null`;
- modalidades: lista de zero a três valores concretos;
- períodos e dias: listas de opções selecionadas;
- início e término: strings de horário vazias por padrão;
- flexibilidade de turnos: `"yes" | "no" | null`;
- frequência: opção selecionada ou `null`;
- regiões de atendimento: lista de strings sem itens vazios ou duplicados;
- deslocamento: `"yes" | "no" | "depends_distance" | null`.

Não salvar este modelo em `localStorage`, `sessionStorage`, API, ação de servidor ou banco. A tela de sucesso mantém o aviso de que nenhuma resposta do cadastro foi salva.

## Privacidade

Acrescentar à lista de categorias da Política de Privacidade os dados de interesse, experiência e disponibilidade de ginástica laboral. Identificar a página como descritiva dos usos previstos e informar que, nesta demonstração, as respostas ficam apenas na memória da página e não são enviadas nem salvas. Não declarar compartilhamento, visibilidade pública ou pareamento com empresas; os usos operacionais futuros para esses campos não estão definidos neste escopo.

## Interface e acessibilidade

- Reutilizar os componentes, tokens, estilo e padrões de campo já presentes no cadastro.
- Agrupar opções relacionadas em `fieldset` com `legend` visível ou acessível.
- Usar rótulos associados aos campos de horário e à entrada de cidade/região.
- Dar nomes acessíveis aos controles de adicionar e remover localidades.
- Manter foco visível, navegação por teclado, alvos de toque confortáveis, responsividade e suporte a movimento reduzido.
- Não introduzir dependências.

## Restrições do projeto

- Não executar `git`, `typecheck`, `build`, `lint` ou `test`.
- Não adicionar testes; a implementação será revisada manualmente por leitura de código e rastreamento dos fluxos.
- Consultar a documentação Next.js instalada no projeto antes de alterar código.
