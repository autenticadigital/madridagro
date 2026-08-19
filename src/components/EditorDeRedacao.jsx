'use client';

import { DocSpace } from "@onlyoffice/docspace-react";

export default function EditorDeRedacao({ fileId }) {
  const onAppReady = () => {
    console.log("ONLYOFFICE DocSpace Carregado com sucesso! 🎉");
  };

  // Se o fileId for passado, abrimos o editor direto naquele arquivo.
  // Se não, abrimos o "manager" (que é essa tela de Salas que você está vendo).
  const configMode = fileId ? "editor" : "manager";

  return (
    <div className="w-full h-full min-h-[700px] rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl relative">
      <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center animate-pulse -z-10">
          <p className="text-gray-400 font-medium">Carregando interface do DocSpace...</p>
      </div>
      
      <DocSpace 
        url="https://sergioaraujo.onlyoffice.com/" 
        config={{
          "frameId": "onlyoffice-docspace",
          "mode": configMode, 
          // Se estamos no modo editor, passamos o ID do arquivo. Se não, undefined.
          "id": fileId ? fileId : undefined, 
          "width": "100%",
          "height": "100%",
          "events": {
            "onAppReady": onAppReady,
          }
        }}
      />
    </div>
  );
}
