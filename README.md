# Edu CRM Pro (ONLYOFFICE DocSpace Integration)

## 🎯 Objetivo do Projeto
Este projeto é a prova de conceito e fundação para o **Edu CRM Pro**. O objetivo principal é demonstrar a integração perfeita e segura do ecossistema **ONLYOFFICE DocSpace** dentro de um portal educacional moderno ("Vibe Coding").
Ele implementa a capacidade de visualizar salas, editar documentos embutidos (Modo Editor) e criar novas redações através de chamadas de API seguras no backend.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Estilização:** TailwindCSS v4 (Glassmorphism, Dark Mode, UI Premium)
- **Integração Documental:** `@onlyoffice/docspace-react` SDK
- **Linguagem:** JavaScript

## 🚀 Setup e Instruções de Uso

### 1. Requisitos Prévios
Para que a integração funcione, você precisa configurar a segurança do seu DocSpace:
- Acesse seu painel do ONLYOFFICE DocSpace.
- Vá em **Ferramentas de desenvolvedor -> SDK de Incorporação**.
- Adicione `http://localhost:3000` à lista de domínios permitidos para evitar bloqueios de CORS.

### 2. Variáveis de Ambiente
Crie ou edite o arquivo `.env.local` na raiz do projeto com as suas credenciais reais do DocSpace:
```env
NEXT_PUBLIC_DOCSPACE_URL=https://sua-url.onlyoffice.com
DOCSPACE_API_TOKEN=seu_token_de_api_backend
DOCSPACE_DEFAULT_ROOM_ID=id_da_sala_padrao
```

### 3. Rodando o Projeto Localmente
Instale as dependências e inicie o servidor:
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

## 🌐 Deploy
O projeto está otimizado para deploy *Zero Config* na **Vercel**.
1. Suba o repositório para o GitHub.
2. Importe na Vercel.
3. Cadastre as variáveis de ambiente (`NEXT_PUBLIC_DOCSPACE_URL`, `DOCSPACE_API_TOKEN`, `DOCSPACE_DEFAULT_ROOM_ID`) nas configurações do projeto na Vercel.

## 📜 Histórico de Modificações (Changelog)
- **v1.0.0 (18/08/2026):**
  - Setup inicial com Next.js 15 e TailwindCSS v4.
  - Interface Premium Glassmorphism com Dark Mode.
  - Implementação do SDK `@onlyoffice/docspace-react`.
  - Controle de estado dinâmico (Gerenciador vs. Editor focado).
  - Rota de backend `/api/docspace/create` para criação automatizada de documentos via REST API simulada.
