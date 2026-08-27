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

- **v1.4 - Segurança e Refinamentos (26/08/2026):**
  - **CRUD Completo de Contatos:** Criação da tabela `logistics_contacts` no Supabase. Cadastro, edição e exclusão de contatos reais (Borracharia, Guincho, Polícia, etc).
  - **GPS SOS 100% Funcional:** O botão "Capturar Minha Localização GPS" agora funciona visualmente como no *Escudo Lilás*, pegando as coordenadas e mostrando ao usuário antes de enviar o SMS de alerta.
  - **Aba Histórico:** Removido os dados de teste (mock). O histórico agora exibe apenas as viagens com status "Concluída", com cálculo de lucro líquido (Receita - Custos) totalmente automatizado.
  - **Segurança de Login:** Removida a opção "Criar Conta" do app. Somente o gestor cadastra novos usuários pelo painel, prevenindo invasões.
  - **Blindagem do Banco de Dados (RLS):** Todas as tabelas (`logistics_trips`, `logistics_notes`, `logistics_contacts`, `accounts_payable`) receberam blindagem Row Level Security. O acesso anônimo/público foi apagado, e os dados só podem ser lidos/gravados pelo grupo `authenticated` (usuários logados no app).

- **v1.3 - Edição e Exclusão (26/08/2026):**
  - Implementação completa dos botões de **Editar (✏️)** e **Excluir (🗑️)** para Cargas Ativas e Contas a Pagar.
  - Sincronização em tempo real das alterações para todos os celulares.

- **v1.2 - 26/08/2026:**
  - Integração Completa da Central Logística com Supabase (`logistics_trips` e `logistics_notes`).
  - Integração Completa do Contas a Pagar com Supabase (`accounts_payable`).
  - Lógica final de SMS SOS ativada e disparando pro app de mensagens nativo.

- **v1.1 (Branch: feature-logistica) - 25/08/2026:**
  - Criação da `CentralLogistica.tsx` com Abas (Cargas, Histórico, Contatos).
  - Implementação de Diário de Bordo nas cargas ativas.
  - Alerta de Emergência SOS (Estilo Escudo Lilás) com GPS.
  - Criação da tela de `ContasPagar.tsx`.
  - Otimização do Menu Mobile (Remoção da rota configuracoes da barra inferior, inserida no header do Dashboard).

- **v1.0 - Inicial:**
  - Layout limpo, autenticação, telas de Dashboard, Vendas, Estoque, Clientes e Fiados.
