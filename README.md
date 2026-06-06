# OrbitX — Monitoramento Inteligente de Datacenters

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

- Monitoramento de satélites
- Visualização da posição da ISS
- Consulta de eventos ambientais monitorados pela NASA
- Relatórios e indicadores
- Assistente inteligente para consulta de informações
- Dashboard com dados em tempo real
- Gestão de usuários

---

## Relação com a Global Solution

O OrbitX conecta dados da indústria espacial com aplicações práticas na Terra, oferecendo informações sobre satélites, eventos ambientais e monitoramento espacial.

### Objetivos de Desenvolvimento Sustentável (ODS)

- ODS 9 — Indústria, Inovação e Infraestrutura
- ODS 11 — Cidades e Comunidades Sustentáveis
- ODS 13 — Ação Contra a Mudança Global do Clima

---

## Telas do Aplicativo

- Splash Screen
- Onboarding
- Login
- Cadastro
- Recuperação de Senha
- Dashboard
- Assistente
- Satélites
- Mapa
- Relatórios
- Configurações

---

## Funcionalidades

### Autenticação
- Cadastro de usuário
- Login
- Logout
- Recuperação de senha

### Monitoramento Espacial
- Visualização de satélites
- Rastreamento da ISS
- Informações orbitais

### Eventos Ambientais
- Consulta de eventos monitorados pela NASA
- Visualização de dados ambientais

### Assistente Inteligente
- Interface conversacional
- Consulta de informações relevantes

### Dashboard
- Indicadores em tempo real
- Métricas da plataforma

### Configurações
- Gerenciamento de preferências
- Perfil do usuário

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
- React Native
- Expo
- TypeScript
- Expo Router

### Gerenciamento de Estado
- Zustand

### Comunicação HTTP
- Axios

### Estilização
- NativeWind
- Tailwind CSS

### APIs
- NASA Open APIs
- ISS Tracking API

---

## Como Executar

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Expo CLI

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

Configure as variáveis de ambiente criando um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_API_URL=https://orbitx-api-ve63.onrender.com
EXPO_PUBLIC_NASA_API_KEY=sua_chave_aqui
EXPO_PUBLIC_OPENROUTER_API_KEY=sua_chave_aqui
```

Execute a aplicação:

```bash
npx expo start
```

---

## Estrutura do Projeto

```text
mobile/
├── app/
├── components/
├── hooks/
├── services/
├── store/
├── theme/
├── types/
├── utils/
└── assets/

## Estrutura do backend

orbit-x-backend/
├── domain/
│   ├── auth/
│   ├── dashboard/
│   ├── infrastructure/
│   ├── reports/
│   └── assistant/
├── config/
├── security/
└── shared/
```

---

## Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/auth/login` | Autenticação | ✅ |
| POST | `/api/v1/auth/register` | Cadastro empresarial | ✅ |
| POST | `/api/v1/auth/forgot-password` | Redefinição de senha | ✅ |
| GET | `/api/v1/dashboard/kpis` | KPIs em tempo real | ✅ |
| GET | `/api/v1/dashboard/alerts` | Alertas ativos | ✅ |
| GET | `/api/v1/infrastructure/datacenters` | Lista datacenters | ✅ |
| GET | `/api/v1/infrastructure/satellites` | Lista satélites | ✅ |
| GET | `/api/v1/reports/sustainability-score` | Score ESG | ✅ |
| GET | `/api/v1/reports/export/pdf` | Exportar PDF | ✅ |
| POST | `/api/v1/assistant/chat` | Chat com IA | ✅ |

Documentação interativa: https://orbitx-api-ve63.onrender.com/swagger-ui/index.html

API: https://orbitx-api-ve63.onrender.com/

---

## Vídeo Demonstração

YouTube: [Adicionar link do vídeo]

---

## Repositório

GitHub: https://github.com/fabioeduu/OrbitX

---

## Integrantes

| Nome | RM |
|------|----|
| Fabio H S Eduardo | RM560416 |
| Gabriel Wu Castro | RM560210 |
| Lucas B Chicote | RM559366 |
| Renato Kenji Sugaki | RM559810 |

---

## Disciplina

Mobile Application Development

Projeto desenvolvido para a Global Solution 2026 da FIAP.

FIAP — Análise e Desenvolvimento de Sistemas.