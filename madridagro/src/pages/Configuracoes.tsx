import { useState } from 'react';
import { BookOpen, AlertCircle, Settings, LogOut, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function Configuracoes() {
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error('Erro ao atualizar: ' + error.message);
    } else {
      toast.success('Senha atualizada com sucesso!');
      setNewPassword('');
    }
    setUpdating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2">
          <Settings className="text-palette-1" /> Configurações & Ajuda
        </h1>
        <p className="text-palette-2 text-sm mt-1">Manual de uso e informações do sistema.</p>
      </header>

      <div className="bg-white border border-palette-4 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-palette-4 bg-palette-5/20">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <BookOpen className="text-palette-1" /> Manual de Uso Rápido
          </h2>
          <p className="text-palette-2 text-sm mt-2">
            O sistema agora é 100% online. Tudo que você fizer será atualizado instantaneamente na tela dos outros usuários.
          </p>
        </div>

        <div className="p-6 space-y-8 text-text-main">
          
          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">1. Conhecendo o Menu</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-palette-2">
              <li><strong>Painel:</strong> Resumo de tudo (faturamento, total a receber).</li>
              <li><strong>Vendas:</strong> Registre as vendas e emita os comprovantes.</li>
              <li><strong>Estoque:</strong> Cadastre produtos e dê entrada de mercadorias.</li>
              <li><strong>Clientes:</strong> Cadastros das pessoas que compram com você.</li>
              <li><strong>Fiados:</strong> Lista de clientes que compraram a prazo e estão devendo.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">2. Como Cadastrar um Novo Produto</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Toque em <strong>Estoque</strong>.</li>
              <li>Na parte de cima da tela, toque na aba <strong>Produtos Cadastrados</strong>.</li>
              <li>Clique no botão azul <strong>+ Cadastrar Novo Produto</strong>.</li>
              <li>Digite o <strong>Nome</strong> do produto e o <strong>Preço</strong> de venda.</li>
              <li>Clique em <strong>Salvar Produto</strong>.</li>
            </ol>
            <p className="text-xs text-palette-3 mt-1 italic">Dica: Se digitou algo errado, basta clicar no ícone do Lápis ao lado do produto para arrumar.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">3. Como Colocar Mercadoria no Estoque</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Toque em <strong>Estoque</strong>.</li>
              <li>Na aba <strong>Movimentações</strong>, clique em <strong>Nova Entrada/Saída</strong>.</li>
              <li>Selecione o Produto que acabou de cadastrar.</li>
              <li>Digite a <strong>Quantidade</strong> que chegou (Ex: 10).</li>
              <li>Deixe marcado a opção verde <strong>ENTRADA</strong>.</li>
              <li>Clique em <strong>Salvar Movimentação</strong>.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">4. Como Cadastrar um Cliente</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Toque em <strong>Clientes</strong>.</li>
              <li>Clique no botão <strong>+ Novo Cliente</strong>.</li>
              <li>Digite o <strong>Nome</strong> dele (os outros campos não são obrigatórios).</li>
              <li>Clique em <strong>Salvar Cliente</strong>.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">5. Fazer uma Venda Rápida</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Toque em <strong>Vendas</strong>.</li>
              <li>Na caixa "Adicionar Produto", escolha o produto na lista.</li>
              <li>Coloque a quantidade e clique em <strong>Incluir</strong>.</li>
              <li>Ao lado direito, em "Fechamento", escolha como ele pagou: <strong>Dinheiro, Cartão ou PIX</strong>.</li>
              <li>Clique no botão verde <strong>Registrar Venda</strong>. O estoque já baixou sozinho!</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">6. Fazer uma Venda a Prazo (Fiado)</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Coloque os produtos na venda como ensinado acima.</li>
              <li>Na hora do "Fechamento", escolha a opção <strong>A Prazo</strong>.</li>
              <li>O sistema vai exigir que você escolha um cliente! Clique em "Vincular Cliente" e escolha o nome.</li>
              <li>Clique em <strong>Registrar Venda</strong>. A dívida foi criada nos Fiados!</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">7. Imprimir Recibo (PDF)</h3>
            <p className="text-sm text-palette-2">
              Na hora de finalizar a venda, em vez de clicar no botão verde "Registrar Venda", clique no botão branco escrito <strong>Registrar e Gerar PDF</strong>. 
              O sistema vai salvar a venda e abrir o recibo em tela inteira, pronto para ser impresso ou enviado no WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">8. O Cliente veio Pagar o Fiado!</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Toque em <strong>Fiados</strong>.</li>
              <li>Procure o nome do cliente que veio pagar.</li>
              <li>Clique no botão branco <strong>Dar Baixa</strong>. A conta some e o dinheiro "entra" no caixa!</li>
            </ol>
            <p className="text-xs text-palette-3 mt-1 italic">Dica: Se ele veio dar apenas um pedaço do dinheiro, você pode clicar no ícone do Lápis para diminuir o valor.</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-lg text-palette-1 border-b border-palette-4 pb-2">9. Registrei uma Venda Errada! (Cancelar)</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-palette-2">
              <li>Vá até a tela de <strong>Vendas</strong>.</li>
              <li>No topo da tela, mude para a aba <strong>Histórico</strong>.</li>
              <li>Procure a venda que foi feita sem querer.</li>
              <li>Clique na <strong>lixeirinha vermelha</strong> e confirme.</li>
            </ol>
            <p className="text-sm text-palette-2 font-bold mt-1">O sistema devolve a mercadoria para a prateleira e apaga qualquer dívida fiada automaticamente.</p>
          </section>

          <div className="bg-palette-5/30 border border-palette-4 rounded-xl p-4 mt-8 flex items-start gap-4">
            <AlertCircle className="text-palette-1 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-text-main text-sm">Atenção sobre a Conexão</h4>
              <p className="text-sm text-palette-2 mt-1">
                O aplicativo agora funciona 100% online e em tempo real. Você precisa estar conectado à internet para registrar vendas e consultar o estoque.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-palette-4 space-y-4">
            <h3 className="font-bold text-lg text-palette-1 flex items-center gap-2">
              <KeyRound size={20} /> Segurança e Acesso
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="password" 
                placeholder="Digite a nova senha..." 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="flex-1 bg-palette-5/20 border border-palette-4 rounded-xl p-3 text-text-main focus:outline-none focus:border-palette-1 focus:ring-1 focus:ring-palette-1 transition-all"
              />
              <button 
                onClick={handleUpdatePassword}
                disabled={updating}
                className="bg-palette-1 text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {updating ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 font-bold py-4 rounded-xl transition-all"
            >
              <LogOut size={20} /> Sair do Sistema
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
