import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Sale, type SaleItem, type Client, type Product } from './types';

// Converte a logo local para Base64 para embutir no PDF
const getLogoBase64 = async (): Promise<string | null> => {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${baseUrl}logo.jpeg`);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao carregar a logo para o PDF', error);
    return null;
  }
};

interface SaleWithDetails extends Sale {
  client?: Client;
  items: (SaleItem & { product?: Product })[];
}

export const generateSaleReceipt = async (sale: SaleWithDetails) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Cores da paleta (Madrid Agro)
  const PRIMARY_COLOR = '#0a996f'; // Verde
  const SECONDARY_COLOR = '#cf0638'; // Vermelho
  const TEXT_DARK = '#333333';
  const TEXT_LIGHT = '#666666';

  const logoBase64 = await getLogoBase64();

  // --- CABEÇALHO ---
  if (logoBase64) {
    // Adiciona a logo (ajuste as dimensões conforme o formato da sua imagem)
    doc.addImage(logoBase64, 'JPEG', 14, 10, 40, 20, undefined, 'FAST');
  }

  // Título da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(PRIMARY_COLOR);
  doc.text('MADRID AGRO', 60, 20);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(TEXT_LIGHT);
  doc.text('Comprovante de Venda / Romaneio', 60, 26);
  
  // Linha divisória
  doc.setDrawColor(PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // --- DADOS DA VENDA ---
  doc.setFontSize(11);
  doc.setTextColor(TEXT_DARK);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nº da Venda:', 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.id.slice(0, 8).toUpperCase(), 45, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Data:', 140, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(sale.date).toLocaleString('pt-BR'), 155, 45);

  // --- DADOS DO CLIENTE ---
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.client?.name || 'Venda Avulsa (Sem Cadastro)', 45, 55);

  if (sale.client?.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Telefone:', 140, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.client.phone, 160, 55);
  }

  // Método de Pagamento
  doc.setFont('helvetica', 'bold');
  doc.text('Pagamento:', 14, 65);
  doc.setFont('helvetica', 'normal');
  
  const paymentMethods: Record<string, string> = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    pix: 'PIX',
    term: 'A Prazo (Fiado)'
  };
  
  const paymentText = paymentMethods[sale.payment_method] || sale.payment_method;
  if (sale.payment_method === 'term') {
    doc.setTextColor(SECONDARY_COLOR); // Vermelho para fiado
    doc.setFont('helvetica', 'bold');
  }
  doc.text(paymentText.toUpperCase(), 45, 65);
  doc.setTextColor(TEXT_DARK); // Volta pra cor normal

  // --- TABELA DE ITENS ---
  const tableData = sale.items.map((item, index) => [
    index + 1,
    item.product?.name || 'Produto Excluído',
    item.quantity.toString(),
    `R$ ${item.unit_price.toFixed(2).replace('.', ',')}`,
    `R$ ${item.subtotal.toFixed(2).replace('.', ',')}`
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Item', 'Descrição do Produto', 'Qtd', 'V. Unit', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: '#ffffff',
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    }
  });

  // --- TOTAL ---
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DA VENDA:', 120, finalY + 15);
  
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_COLOR);
  doc.text(`R$ ${sale.total_amount.toFixed(2).replace('.', ',')}`, 160, finalY + 15);
  
  // --- ASSINATURA ---
  // Linha de assinatura obrigatória se for Fiado, ou opcional para recibos de carga
  doc.setDrawColor(TEXT_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(40, finalY + 50, 170, finalY + 50); // Linha

  doc.setFontSize(10);
  doc.setTextColor(TEXT_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Recebedor / Cliente', 105, finalY + 55, { align: 'center' });

  // --- RODAPÉ ---
  doc.setFontSize(8);
  doc.text('Gerado por Madrid Agro System', 105, 285, { align: 'center' });

  // --- DOWNLOAD ---
  const fileName = `Romaneio_${sale.client?.name?.replace(/\\s+/g, '_') || 'Avulso'}_${sale.id.slice(0,6)}.pdf`;
  doc.save(fileName);
};
