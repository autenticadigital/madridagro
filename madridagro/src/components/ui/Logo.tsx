export function Logo({ className = "w-32 h-auto" }: { className?: string }) {
  // A imagem original enviada será carregada da pasta public.
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  return (
    <img 
      src={`${baseUrl}logo.jpeg`} 
      alt="Logo" 
      className={`object-contain mix-blend-multiply ${className}`} 
      onError={(e) => {
        // Fallback visual caso a imagem ainda não tenha sido salva na pasta public
        e.currentTarget.style.display = 'none';
        if (e.currentTarget.nextElementSibling) {
          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
        }
      }}
    />
  );
}
