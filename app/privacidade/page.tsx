import Link from "next/link"
import type { Metadata } from "next"

import { PageTransition } from "@/components/ehfi/page-transition"
import { ThemeToggle } from "@/components/ehfi/theme-toggle"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Política de Privacidade — EHFI",
  description: "Dados tratados nos cadastros de alunos, profissionais e empresas da EHFI.",
}

const sections = [
  {
    title: "1. Como usamos seus dados",
    content: (
      <>
        <p>
          O EHFI utiliza os dados para criar e manter sua conta e seus perfis,
          processar os cadastros, analisar as informações e documentos
          profissionais e empresariais, e entrar em contato sobre um cadastro
          quando houver autorização aplicável.
        </p>
        <p>
          As informações acadêmicas e do CREF, junto aos comprovantes enviados,
          são utilizadas para análise do cadastro. O envio de um documento não
          confirma sua autenticidade ou a regularidade do CREF; não há
          validação automática nesta versão.
        </p>
      </>
    ),
  },
  {
    title: "2. Quais dados tratamos",
    content: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="font-semibold text-foreground">
            Identificação e contato:
          </strong>{" "}
          nome legal, data de nascimento, CPF, e-mail e telefone.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Localização e apresentação profissional:
          </strong>{" "}
          cidade, estado e Instagram profissional, se informado.
        </li>
        <li>
          <strong className="font-semibold text-foreground">Formação:</strong>{" "}
          instituição, curso, tipo de formação, situação acadêmica, ano de
          conclusão ou previsão e documentos acadêmicos.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Registro no CREF:
          </strong>{" "}
          conselho/UF, número, situação declarada, situação da solicitação
          quando aguarda emissão, carteira profissional e protocolo ou
          comprovante, se houver.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Atuação em Ginástica Laboral:
          </strong>{" "}
          interesse, experiência, modalidades, períodos e horários, dias e
          frequência de atendimento, cidades/regiões e disponibilidade para
          turnos e deslocamento.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Empresa e responsável:
          </strong>{" "}
          razão social, nome fantasia, CNPJ, ramo e endereço cadastral, site ou
          perfil opcional, nome, cargo, setor, e-mail, telefone e melhor horário
          para contato.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Estrutura e interesse da empresa:
          </strong>{" "}
          quantidade estimada de colaboradores, setores, dias, horários e
          turnos, condições do espaço, formato e frequência desejados, objetivos,
          previsão de início, interesse de contratação, orçamento e necessidades
          específicas.
        </li>
        <li>
          <strong className="font-semibold text-foreground">
            Confirmações:
          </strong>{" "}
          leitura desta Política, autorização obrigatória para dados de saúde
          no cadastro de aluno, autorizações da empresa, declaração de
          veracidade e sua escolha sobre comunicações promocionais.
        </li>
      </ul>
    ),
  },
  {
    title: "3. Informações exibidas no perfil",
    content: (
      <>
        <p>
          Nesta versão não há perfil profissional público. Uma futura exibição
          de nome, cidade/UF, formação, Instagram ou informações do CREF
          exigirá aviso e configuração próprios.
        </p>
        <p>
          CPF, data de nascimento, e-mail, telefone, documentos acadêmicos,
          carteira do CREF, protocolos, detalhes da solicitação e situações
          autodeclaradas são mantidos privados e não aparecem no perfil público.
        </p>
      </>
    ),
  },
  {
    title: "4. Compartilhamento, conservação e proteção",
    content: (
      <>
        <p>
          Ao concluir o cadastro, os dados informados são gravados na conta
          EHFI. Antes da conclusão, um rascunho pode ser mantido nos servidores
          por até 30 dias sem atividade; senhas e confirmações de senha não
          fazem parte do rascunho. Documentos profissionais ficam em
          armazenamento privado.
        </p>
        <p>
          A autenticação, o banco de dados e o armazenamento de arquivos usam
          Supabase. A região do projeto, o provedor de email de recuperação,
          eventuais transferências e o prazo de conservação após a conclusão
          da conta ainda precisam ser informados. Os dados de saúde do aluno
          são guardados separadamente e só são coletados após a autorização
          obrigatória apresentada no cadastro. A senha é gerenciada pelo
          Supabase Auth e não é incluída no perfil nem no rascunho.
        </p>
      </>
    ),
  },
  {
    title: "5. Comunicações sobre novidades",
    content: (
      <p>
        As comunicações promocionais são opcionais e dependem da sua
        autorização, separada das confirmações necessárias ao cadastro. Você
        pode cancelar essa autorização sem afetar sua conta ou os serviços
        profissionais. O canal para exercer essa escolha precisa ser informado
        junto com o contato de privacidade da controladora.
      </p>
    ),
  },
  {
    title: "6. Seus direitos e contato",
    content: (
      <>
        <p>
          Você pode solicitar confirmação do tratamento e acesso aos dados,
          correção, informações sobre uso e compartilhamento, anonimização,
          bloqueio ou eliminação quando cabíveis, portabilidade quando aplicável
          e revogação do consentimento quando essa for a base utilizada.
        </p>
        <p>
          A identidade e o canal de contato da controladora ainda precisam ser
          preenchidos. Esta página, sem esses dados, não informa um canal
          válido para exercer os direitos dos titulares.
        </p>
      </>
    ),
  },
]

function PrivacyPolicyContent() {
  return (
    <main className="relative isolate min-h-dvh overflow-clip px-4 pt-4 pb-12 sm:px-7 sm:pt-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 right-[-10rem] -z-10 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-16rem] left-[-12rem] -z-10 size-[32rem] rounded-full bg-ehfi-secondary/10 blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="inline-flex min-h-11 items-center rounded-full px-2 font-heading text-sm font-bold tracking-[0.16em] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          EHFI
        </Link>
        <ThemeToggle />
      </header>

      <div className="mx-auto mt-6 w-full max-w-5xl sm:mt-10">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="mb-5 inline-flex min-h-10 items-center rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/55 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          Voltar ao início
        </Link>

        <Card className="gap-0 rounded-[1.8rem] border-border/60 bg-card/75 p-5 shadow-[0_24px_80px_-42px_rgba(31,22,50,0.34)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <CardHeader className="gap-4 px-0 pb-6">
            <p className="w-fit rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold tracking-[0.1em] text-primary uppercase">
              Cadastro EHFI
            </p>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Política de Privacidade do EHFI
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Esta Política descreve os dados tratados nos cadastros de
                profissional, aluno e empresa da EHFI. As informações de
                controladora, contato, bases legais e retenção de contas
                finalizadas ainda precisam ser completadas.
              </p>
              <p className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-3 text-sm leading-6 text-muted-foreground">
                Os cadastros gravam dados pessoais e, no caso de alunos, dados
                de saúde após consentimento obrigatório. No cadastro de
                empresa, o CNPJ é encaminhado ao Open CNPJ para consulta.
                Consulte as categorias e limitações descritas abaixo antes de
                concluir um cadastro.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-0 pb-0 text-sm leading-7 text-muted-foreground">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-heading text-lg leading-6 font-semibold text-foreground">
                  {section.title}
                </h2>
                <div className="space-y-3">{section.content}</div>
              </section>
            ))}
            <section id="cadastro-empresa" className="scroll-mt-8 space-y-3">
              <h2 className="font-heading text-lg leading-6 font-semibold text-foreground">
                7. Cadastro de empresa e consulta de CNPJ
              </h2>
              <p>
                O cadastro solicita dados cadastrais da empresa, endereço,
                ramo de atividade, informações do responsável, estrutura e
                horários de trabalho, interesse e necessidades para ginástica
                laboral. Ao concluir, esses dados são associados à conta e
                persistidos para análise da solicitação.
              </p>
              <p>
                Ao completar os 14 dígitos do CNPJ e fazer uma breve pausa, o
                navegador consulta uma rota do EHFI, que encaminha somente os
                dígitos do CNPJ ao Open CNPJ. A resposta pode preencher razão
                social, nome fantasia, endereço, CNAE principal e situação
                cadastral. Esses dados são públicos, podem estar desatualizados
                e permanecem editáveis; confira-os antes de continuar. E-mail e
                telefone públicos da empresa não são usados para preencher os
                campos do responsável.
              </p>
              <p>
                O CNPJ e os demais campos da empresa ficam salvos após a
                conclusão do cadastro. A consulta externa recebe somente os
                dígitos do CNPJ; revise e corrija os dados retornados. Se a
                consulta não encontrar o registro ou estiver indisponível, os
                dados cadastrais podem ser preenchidos manualmente.
              </p>
              <p>
                Consulte também os{" "}
                <Link
                  href="/termos-de-uso"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Termos de Uso
                </Link>
                .
              </p>
            </section>
            <section id="cadastro-aluno" className="scroll-mt-8 space-y-3">
              <h2 className="font-heading text-lg leading-6 font-semibold text-foreground">
                8. Cadastro de aluno e anamnese
              </h2>
              <p>
                O cadastro de aluno trata nome,
                e-mail, telefone, credencial de acesso, data de nascimento,
                altura, peso opcional, condicionamento físico, prática de
                exercícios, modalidades, rotina, objetivos e respostas abertas
                fornecidas pelo aluno. Esses dados são associados à conta após
                a conclusão do cadastro.
              </p>
              <p>
                A anamnese também solicita condições de saúde, medicamentos,
                sintomas, dores, limitações físicas, lesões, cirurgias,
                restrições recomendadas por profissionais de saúde e, quando
                aplicável, gestação ou período pós-parto. Essas informações são
                dados de saúde e serão tratadas para avaliação inicial,
                planejamento e acompanhamento da prática de exercício físico.
                A autorização para tratar dados de saúde é obrigatória; sem
                ela, a anamnese e a criação da conta não prosseguem.
              </p>
              <p>
                As respostas de saúde são armazenadas separadamente e ficam
                disponíveis somente para o próprio aluno nesta versão. Ainda
                não existe associação com um profissional nem exibição pública
                desses dados.
              </p>
              <p>
                Pessoas menores de 18 anos podem criar e usar uma conta nesta
                versão. O formulário não solicita nem verifica autorização de
                responsável. Os requisitos legais aplicáveis a crianças e
                adolescentes ainda precisam de avaliação específica.
              </p>
              <p>
                Respostas de saúde que indiquem necessidade de revisão deixam
                o perfil com status pendente. Esse status não equivale a
                avaliação clínica, diagnóstico ou liberação para exercício.
              </p>
            </section>
          </CardContent>
        </Card>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-muted-foreground">
          Saiba mais sobre os{" "}
          <Link
            href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            direitos dos titulares de dados
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <PrivacyPolicyContent />
    </PageTransition>
  )
}
