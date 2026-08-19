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
      const errorText = await response.text();
      let errorMsg = `ONLYOFFICE retornou status ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = `${errorMsg}. Resposta: ${errorText.substring(0, 50)}...`;
      }
      throw new Error(errorMsg);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch(e) {
      throw new Error(`Falha ao ler resposta de sucesso do DocSpace. Resposta não é JSON: ${responseText.substring(0, 50)}...`);
    }
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
