<<<<<<< HEAD
# OrbitX - Global Solution 2026

## Sobre o Projeto

O OrbitX é uma plataforma mobile desenvolvida para apoiar a nova economia espacial por meio da análise de dados orbitais, monitoramento de eventos globais e acompanhamento de satélites em tempo real.

A solução conecta informações provenientes de tecnologias espaciais com aplicações práticas na Terra, permitindo que usuários acompanhem fenômenos ambientais, eventos naturais e dados de monitoramento espacial por meio de uma interface moderna e intuitiva.

O projeto foi desenvolvido como parte da Global Solution 2026 da FIAP, alinhado ao tema:

> "O Espaço é a Nova Fronteira"

---

## Problema

Grande parte dos dados gerados por satélites e missões espaciais está distribuída em diferentes plataformas, dificultando o acesso da população e de organizações que poderiam utilizar essas informações para tomada de decisões.

Além disso, eventos ambientais e climáticos monitorados por satélites nem sempre são apresentados de forma acessível para usuários comuns.

---

## Solução

O OrbitX centraliza informações espaciais e ambientais em um único aplicativo, permitindo:

* Monitoramento de satélites
* Visualização da posição da ISS
* Consulta de eventos ambientais monitorados pela NASA
* Relatórios e indicadores
* Assistente inteligente para consulta de informações
* Dashboard com dados em tempo real
* Gestão de usuários

---

## Relação com a Global Solution

O OrbitX conecta dados da indústria espacial com aplicações práticas na Terra, oferecendo informações sobre satélites, eventos ambientais e monitoramento espacial.

### Objetivos de Desenvolvimento Sustentável (ODS)

* ODS 9 – Indústria, Inovação e Infraestrutura
* ODS 11 – Cidades e Comunidades Sustentáveis
* ODS 13 – Ação Contra a Mudança Global do Clima

---

## Telas do Aplicativo

* Splash Screen
* Onboarding
* Login
* Cadastro
* Recuperação de Senha
* Dashboard
* Assistente
* Satélites
* Mapa
* Relatórios
* Configurações
=======
# OrbitX — Monitoramento Inteligente de Datacenters

Plataforma mobile de monitoramento sustentável de datacenters desenvolvida para a **Global Solution FIAP 2026**.

---

## Visão Geral

O OrbitX integra dados reais de satélites, eventos naturais da NASA, posição da ISS em tempo real e KPIs de eficiência energética com análise por Inteligência Artificial via Groq (llama-3.3-70b).

---

## Stack

### Frontend — React Native
| Tecnologia | Versão |
|---|---|
| Expo SDK | 54 |
| React Native | 0.81.5 |
| Expo Router | 6 |
| Zustand | 5 |
| Axios | latest |
| React Native Reanimated | 4 |
| NativeWind | 4 |

### Backend — Spring Boot
| Tecnologia | Versão |
|---|---|
| Java | 17 |
| Spring Boot | 3.2.5 |
| Spring Security (JWT) | — |
| Spring AI (Groq) | 1.0.0 |
| Oracle Database | FIAP |
| Flyway | 10 |
| Spring HATEOAS | — |
>>>>>>> renato/main

---

## Funcionalidades

<<<<<<< HEAD
### Autenticação

* Cadastro de usuário
* Login
* Logout
* Recuperação de senha

### Monitoramento Espacial

* Visualização de satélites
* Rastreamento da ISS
* Informações orbitais

### Eventos Ambientais

* Consulta de eventos monitorados pela NASA
* Visualização de dados ambientais

### Assistente Inteligente

* Interface conversacional
* Consulta de informações relevantes

### Dashboard

* Indicadores em tempo real
* Métricas da plataforma

### Configurações

* Gerenciamento de preferências
* Perfil do usuário

---

## Arquitetura

```text
src
├── app
├── components
├── hooks
├── services
├── store
├── theme
├── types
└── utils
```

---

## Tecnologias Utilizadas

### Front-end

* React Native
* Expo
* TypeScript
* Expo Router

### Gerenciamento de Estado

* Zustand

### Comunicação HTTP

* Axios

### Estilização

* NativeWind
* Tailwind CSS

### APIs

* NASA Open APIs
* ISS Tracking API

---

## Como Executar

### Pré-requisitos

* Node.js 20+
* npm ou yarn
* Expo CLI

### Instalação

Clone o repositório:

```bash
git clone https://github.com/fabioeduu/OrbitX.git
```

Acesse a pasta do projeto:

```bash
cd OrbitX
```

Instale as dependências:

```bash
npm install
```

Execute a aplicação:

```bash
npx expo start
```
=======
- **Dashboard em tempo real** — consumo energético, temperatura, PUE, emissões de CO₂ e alertas gerados por IA
- **Assistente IA** — chat com RAG + Tool Calling via Groq (llama-3.3-70b), modo offline com keywords quando sem chave
- **Métricas ESG** — score de sustentabilidade, comparativo antes/depois, exportação de relatório PDF
- **Mapa NASA EONET** — eventos naturais em tempo real (incêndios, terremotos, vulcões) com filtros por categoria
- **ISS ao vivo** — posição orbital, altitude, velocidade e visibilidade da Estação Espacial Internacional
- **Autenticação JWT** — login, cadastro empresarial, redefinição de senha por e-mail (Resend)
>>>>>>> renato/main

---

## Estrutura do Projeto

<<<<<<< HEAD
```text
app/
components/
hooks/
services/
store/
theme/
types/
utils/
assets/
=======
```
OrbitX/                          # Frontend React Native
├── app/
│   ├── (tabs)/                  # Telas principais (dashboard, assistant, reports, map, satellite)
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── settings.tsx
├── services/
│   ├── api.ts                   # Instância Axios + token interceptor
│   └── orbitApi.ts              # Todos os endpoints (authApi, dashboardApi, etc.)
├── store/
│   ├── auth.ts                  # Zustand store com JWT persistido
│   └── theme.ts                 # Tema dark/light
└── types/
    └── api.ts                   # Tipos TypeScript espelhando todos os DTOs Java

orbit-x-backend/                 # Backend Spring Boot
├── domain/
│   ├── auth/                    # Login, registro, forgot-password, JWT
│   ├── dashboard/               # KPIs, alertas, telemetria simulada, predição IA
│   ├── infrastructure/          # Datacenters, satélites, monitoramento orbital
│   ├── reports/                 # Score ESG, exportação PDF
│   └── assistant/               # Chat IA (Spring AI + Groq / modo offline)
├── config/                      # Security, CORS, Swagger, RabbitMQ, ApplicationConfig
├── security/                    # JwtService, JwtAuthenticationFilter
└── shared/                      # ApiResponse<T>, GlobalExceptionHandler
>>>>>>> renato/main
```

---

<<<<<<< HEAD
## Vídeo Demonstração

YouTube:

[Adicionar link do vídeo]

---

## Repositório

GitHub:

https://github.com/fabioeduu/OrbitX

---

## Integrantes

| Nome                | RM       |
| ------------------- | -------- |
| FABIO H S EDUARDO   | RM560416 |
| GABRIEL WU CASTRO   | RM560210 |
| LUCAS B CHICOTE     | RM559366 |
| RENATO KENJI SUGAKI | RM559810 |

---

## Disciplina

Mobile Application Development

Projeto desenvolvido para a Global Solution 2026 da FIAP.

FIAP - Análise e Desenvolvimento de Sistemas.
=======
## Configuração e Execução

### Pré-requisitos
- Node.js 18+
- Java 17+
- Maven 3.9+

### Frontend

```bash
cd OrbitX
npm install --legacy-peer-deps
npx expo start
```

O app aponta automaticamente para `https://orbitx-api-ve63.onrender.com` (produção).
Para usar backend local, crie `.env.local`:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

### Backend

```bash
cd orbit-x-backend
cp .env.example .env
# Preencha as variáveis no .env
mvn spring-boot:run
```

---

## Variáveis de Ambiente

### Backend (`.env`)
| Variável | Descrição |
|---|---|
| `DATABASE_USERNAME` | Usuário Oracle FIAP |
| `DATABASE_PASSWORD` | Senha Oracle FIAP |
| `DATABASE_SCHEMA` | Schema Oracle (ex: `RM560416`) |
| `JWT_SECRET` | Secret para assinar tokens JWT |
| `GROQ_API_KEY` | Chave da API Groq — [console.groq.com](https://console.groq.com) |
| `GROQ_AI_ENABLED` | `true` para ativar Spring AI + llama-3.3-70b |
| `RABBITMQ_ENABLED` | `false` em produção (Render) |
| `RESEND_API_KEY` | Chave da API Resend para envio de e-mails — [resend.com](https://resend.com) |

---

## Deploy (Render)

O backend está configurado para deploy via Docker em [render.com](https://render.com).

1. Conecta o repositório no Render
2. Root Directory: `orbit-x-backend`
3. Adiciona as variáveis de ambiente no painel
4. Adiciona `SPRING_AUTOCONFIGURE_EXCLUDE=org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration`

URL de produção: `https://orbitx-api-ve63.onrender.com`

> O plano free do Render dorme após 15 min de inatividade. Acesse `/swagger-ui/index.html` antes de demonstrar para acordar o servidor.

---

## APIs Externas

| API | Uso | Docs |
|---|---|---|
| NASA EONET | Eventos naturais em tempo real | [eonet.gsfc.nasa.gov](https://eonet.gsfc.nasa.gov) |
| wheretheiss.at | Posição orbital da ISS | [wheretheiss.at](https://wheretheiss.at) |
| Groq | LLM llama-3.3-70b para o assistente IA | [console.groq.com](https://console.groq.com) |
| Resend | Envio de e-mails transacionais | [resend.com](https://resend.com) |

---

## Equipe

| Nome | Papel | RM |
|---|---|---|
| Fabio Eduardo | Mobile Developer | RM 560416 |
| Gabriel Wu Castro | Backend Developer | RM 560210 |
| Lucas Chicote | Backend Developer | RM 559366 |
| Renato Kenji Sugaki | Backend Developer | RM 559810 |

---

## Endpoints da API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Autenticação | ❌ |
| `POST` | `/api/v1/auth/register` | Cadastro empresarial | ❌ |
| `POST` | `/api/v1/auth/forgot-password` | Redefinição de senha | ❌ |
| `GET` | `/api/v1/dashboard/kpis` | KPIs em tempo real | ✅ |
| `GET` | `/api/v1/dashboard/alerts` | Alertas ativos | ✅ |
| `GET` | `/api/v1/infrastructure/datacenters` | Lista datacenters | ✅ |
| `GET` | `/api/v1/infrastructure/satellites` | Lista satélites | ✅ |
| `GET` | `/api/v1/reports/sustainability-score` | Score ESG | ✅ |
| `GET` | `/api/v1/reports/export/pdf` | Exportar PDF | ✅ |
| `POST` | `/api/v1/assistant/chat` | Chat com IA | ✅ |

Documentação interativa: `https://orbitx-api-ve63.onrender.com/swagger-ui/index.html`

---

*FIAP Global Solution 2026 — 2TDS Agosto*
>>>>>>> renato/main
