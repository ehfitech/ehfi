import type { CompanyDirectoryData } from "@/lib/company-registration"

const openCnpjEndpoint = "https://kitana.opencnpj.com/cnpj/"

type OpenCnpjEntry = Record<string, unknown>

type OpenCnpjResponse = {
  success?: unknown
  message?: unknown
  data?: OpenCnpjEntry
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function unavailable() {
  return Response.json(
    {
      success: false,
      error: "service_unavailable",
      message: "Não foi possível consultar o CNPJ agora.",
    },
    { status: 502 }
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params

  if (!/^\d{14}$/.test(cnpj)) {
    return Response.json(
      {
        success: false,
        error: "invalid_cnpj",
        message: "Informe um CNPJ com 14 dígitos.",
      },
      { status: 400 }
    )
  }

  let upstream: Response
  try {
    upstream = await fetch(`${openCnpjEndpoint}${cnpj}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
  } catch {
    return unavailable()
  }

  if (upstream.status === 404) {
    return Response.json(
      {
        success: false,
        error: "not_found",
        message: "Não encontramos esse CNPJ no Open CNPJ.",
      },
      { status: 404 }
    )
  }

  if (upstream.status === 429) {
    return Response.json(
      {
        success: false,
        error: "rate_limited",
        message: "A consulta atingiu o limite temporário. Você pode preencher os dados manualmente.",
      },
      { status: 429 }
    )
  }

  if (upstream.status === 400) {
    return Response.json(
      {
        success: false,
        error: "invalid_cnpj",
        message: "Confira os números do CNPJ informado.",
      },
      { status: 400 }
    )
  }

  if (!upstream.ok) return unavailable()

  let payload: OpenCnpjResponse
  try {
    payload = (await upstream.json()) as OpenCnpjResponse
  } catch {
    return unavailable()
  }

  if (!isRecord(payload)) return unavailable()

  if (payload.success === false) {
    return Response.json(
      {
        success: false,
        error: "not_found",
        message: "Não encontramos esse CNPJ no Open CNPJ.",
      },
      { status: 404 }
    )
  }

  if (
    payload.success !== true ||
    !isRecord(payload.data) ||
    !optionalText(payload.data.razaoSocial)
  ) {
    return unavailable()
  }

  const cnaes = Array.isArray(payload.data.cnaes) ? payload.data.cnaes : []
  const firstCnae = cnaes.find(isRecord)
  const normalized: CompanyDirectoryData = {
    cnpj,
    legalName: optionalText(payload.data.razaoSocial) ?? "",
    tradeName: optionalText(payload.data.nomeFantasia),
    street: optionalText(payload.data.logradouro),
    number: optionalText(payload.data.numero),
    complement: optionalText(payload.data.complemento),
    district: optionalText(payload.data.bairro),
    city: optionalText(payload.data.municipio),
    state: optionalText(payload.data.uf),
    postalCode: optionalText(payload.data.cep)?.replace(/\D/g, ""),
    mainCnae: firstCnae ? optionalText(firstCnae.descricao) : undefined,
    registrationStatus: optionalText(payload.data.situacaoCadastral),
  }

  return Response.json({ success: true, data: normalized })
}
