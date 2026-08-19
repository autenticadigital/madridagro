'use client';

import { useState } from 'react';
import EditorDeRedacao from "@/components/EditorDeRedacao";

export default function Home() {
  const [activeDoc, setActiveDoc] = useState("2191725");
  const [isCreating, setIsCreating] = useState(false);

  // Função "Vibe Coder" que aciona o backend invisível
  const handleCreateNewDoc = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/docspace/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Nova_Redacao_${new Date().getTime()}.docx` })
      });
      
      const data = await response.json();
      
      if (data.success && data.id) {
        // Se a API for fake (nosso mock), ela retorna data.isMock
        if (data.isMock) {
          alert("Documento criado em modo de SIMULAÇÃO. Cadastre suas chaves no .env.local para criar de verdade.");
        }
        // Muda o documento ativo para a nova ID instantaneamente
        setActiveDoc(data.id);
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Falha na comunicação com o servidor.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 flex font-sans selection:bg-orange-500 selection:text-white">
      {/* Sidebar Interativa */}
      <aside className="w-64 border-r border-gray-800/60 bg-black/40 backdrop-blur flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">Edu CRM Pro</h1>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          
          <p className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Ações</p>
          
          {/* Botão Premium: Criar via API */}
          <button 
            onClick={handleCreateNewDoc}
            disabled={isCreating}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2
              ${isCreating 
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:scale-[1.02]'}`}
          >
            {isCreating ? (
              <span className="animate-pulse">Gerando...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nova Redação em Branco
              </>
            )}
          </button>

          <button 
            onClick={() => setActiveDoc(null)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium flex items-center gap-3 mt-2
              ${activeDoc === null 
                ? 'bg-gray-800/80 text-white border-gray-700' 
                : 'text-gray-400 border-transparent hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Explorar Painel DocSpace
          </button>

          <div className="h-px bg-gray-800/60 my-4 mx-2"></div>
          <p className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Documentos Recentes</p>

          <button 
            onClick={() => setActiveDoc("2191725")}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium flex items-center gap-3
              ${activeDoc === "2191725" 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                : 'text-gray-400 border-transparent hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Redação - João (ID: 2191725)
          </button>

        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b border-gray-800/60 bg-black/20 backdrop-blur flex items-center px-8 justify-between z-10 sticky top-0">
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wider">
              {activeDoc ? 'MODO DE CORREÇÃO' : 'MODO DE GERENCIAMENTO'}
            </p>
            <h2 className="text-lg font-semibold">
              {activeDoc ? 'Visualizando Documento' : 'Painel de Arquivos DocSpace'}
            </h2>
          </div>
          {activeDoc && (
            <button className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg border border-gray-700 transition-colors shadow-lg">
              Finalizar Correção
            </button>
          )}
        </header>

        <div className="flex-1 p-8 overflow-hidden flex flex-col">
          <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col relative">
            
            {/* Loading Overlay State para feedback visual premium */}
            {isCreating && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur flex flex-col items-center justify-center rounded-xl border border-gray-700">
                <svg className="animate-spin h-10 w-10 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-orange-400 font-bold text-lg">Criando na Nuvem...</p>
                <p className="text-gray-400 text-sm mt-2">Comunicando com a API do DocSpace</p>
              </div>
            )}

            <EditorDeRedacao key={activeDoc || 'manager'} fileId={activeDoc} />
          </div>
        </div>
      </div>
    </main>
  );
}
