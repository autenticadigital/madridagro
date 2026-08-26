# Madrid Agro - CRM e Logística (B2B)

## Objetivo do Projeto
Sistema de Gestão e Logística Atacadista voltado para o controle operacional de caminhões, compras na roça e vendas no CEASA. Focado na "Gestão por Viagem" para calcular o Lucro Líquido por carga, controlando frete, pedágio, alimentação, e pagamentos a produtores (Contas a Pagar).

## Tech Stack
- Frontend: React + TypeScript + Vite
- Estilização: Tailwind CSS v4 + Lucide React (Ícones)
- Backend/DB: Supabase (PostgreSQL)
- Deploy: Surge.sh

## Como rodar o projeto
1. Certifique-se de ter o Node.js instalado.
2. Rode `npm install` para instalar as dependências.
3. Rode `npm run dev` para iniciar o servidor local.
4. Acesse http://localhost:5173

## Changelog / Histórico
- **v1.2 - 26/08/2026:**
  - Integração Completa da Central Logística com Supabase (`logistics_trips` e `logistics_notes`).
  - Integração Completa do Contas a Pagar com Supabase (`accounts_payable`).
  - Lógica final de SMS SOS ativada e disparando pro app de mensagens nativo.
- **v1.1 (Branch: feature-logistica) - 25/08/2026:**
  - Criação da `CentralLogistica.tsx` com Abas (Cargas, Histórico, Contatos).
  - Implementação de Diário de Bordo nas cargas ativas.
  - Alerta de Emergência SOS (Estilo Escudo Lilás) com GPS.
  - Criação da tela de `ContasPagar.tsx`.
  - Otimização do Menu Mobile (Remoção da rota configurações da barra inferior, inserida no header do Dashboard).
- **v1.0 - Inicial:**
  - Layout limpo, autenticação mockada, telas de Dashboard, Vendas, Estoque, Clientes e Fiados.
