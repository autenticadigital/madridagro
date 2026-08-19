import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Pegamos o nome do arquivo enviado pelo frontend
    const body = await request.json();
    const fileName = body.title || "Nova_Redacao.docx";
    
    const baseUrl = process.env.NEXT_PUBLIC_DOCSPACE_URL;
    const token = process.env.DOCSPACE_API_TOKEN;
    const folderId = process.env.DOCSPACE_DEFAULT_ROOM_ID;

    // Se as variáveis não foram configuradas (estamos testando o MVP)
    if (!token || token === 'fake_token_para_teste' || !folderId || folderId === 'fake_room_id') {
      console.log(`[MOCK API] Simulando criação do arquivo '${fileName}'...`);
      // Simulamos um pequeno delay de rede para ver a tela de loading premium
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      return NextResponse.json({ 
        success: true, 
        // Esta ID é falsa. O frontend tratará isso.
        id: "mock_id_123",
        isMock: true 
      });
    }

    // ==========================================
    // CHAMADA REAL PARA A API DO ONLYOFFICE
    // ==========================================
    const response = await fetch(`${baseUrl}/api/2.0/files/${folderId}/file`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Geralmente o ONLYOFFICE usa o header de Autorização com JWT ou Token
        'Authorization': token 
      },
      body: JSON.stringify({
        title: fileName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao conectar com ONLYOFFICE');
    }

    // O retorno padrão do ONLYOFFICE geralmente encapsula os dados dentro de "response"
    const data = await response.json();
    const newFileId = data.response?.id || data.id;
    
    return NextResponse.json({ 
      success: true, 
      id: newFileId 
    });

  } catch (error) {
    console.error('Erro na API de Criação:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
