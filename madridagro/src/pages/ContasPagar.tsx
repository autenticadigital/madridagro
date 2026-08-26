import { useState } from 'react';
import { ArrowDownRight, Clock, CheckCircle2, Plus } from 'lucide-react';

export function ContasPagar() {
  const mockPayables = [
    { id: '1', supplier: 'Fazenda Boa Vista', amount: 25000, dueDate: '28/08/2026', status: 'pending', loadRef: 'VG-1042' },
    { id: '2', supplier: 'Sítio São José', amount: 18500, dueDate: '20/08/2026', status: 'paid', loadRef: 'VG-1040' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Contas a Pagar</h2>
          <p className="text-palette-2 text-sm">Gestão de pagamentos das safras aos produtores.</p>
        </div>
        <button className="flex items-center gap-2 bg-palette-1 text-white px-4 py-2 rounded-xl font-bold hover:bg-palette-2 transition-colors shadow-sm">
          <Plus size={20} /> Nova Conta
        </button>
      </header>

      <div className="bg-white border border-palette-4 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-palette-4 flex gap-4 bg-palette-5/10">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-200">
            <ArrowDownRight size={20} />
            <span className="font-black text-sm uppercase tracking-wider">Total a Pagar: R$ 25.000,00</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-palette-4 text-palette-2 text-sm">
                <th className="p-4 font-bold uppercase tracking-wider">Produtor</th>
                <th className="p-4 font-bold uppercase tracking-wider">Ref. Carga</th>
                <th className="p-4 font-bold uppercase tracking-wider">Vencimento</th>
                <th className="p-4 font-bold uppercase tracking-wider">Valor</th>
                <th className="p-4 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayables.map((item) => (
                <tr key={item.id} className="border-b border-palette-5 hover:bg-palette-5/20 transition-colors">
                  <td className="p-4 font-bold text-text-main">{item.supplier}</td>
                  <td className="p-4 text-sm font-medium text-palette-3">{item.loadRef}</td>
                  <td className="p-4 text-sm font-medium text-palette-2">{item.dueDate}</td>
                  <td className="p-4 font-black text-text-main">R$ {item.amount.toLocaleString('pt-BR')}</td>
                  <td className="p-4">
                    {item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold uppercase">
                        <Clock size={14} /> Aguardando
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase">
                        <CheckCircle2 size={14} /> Pago
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
