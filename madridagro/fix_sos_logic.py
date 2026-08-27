import re

file_path = '/home/sergio/Documentos/office/madridagro/src/pages/CentralLogistica.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add states for GPS
state_addition = """
  const [gpsLocation, setGpsLocation] = useState<GeolocationCoordinates | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation(position.coords);
          setIsCapturingGps(false);
          toast.success("Localização capturada com sucesso!");
        },
        (error) => {
          console.error("GPS Error", error);
          toast.error("Não foi possível capturar a localização.");
          setIsCapturingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocalização não suportada no seu navegador.");
      setIsCapturingGps(false);
    }
  };
"""
# inject after `const [selectedSOSContacts, setSelectedSOSContacts] = useState<number[]>([]);`
content = content.replace(
    "const [selectedSOSContacts, setSelectedSOSContacts] = useState<number[]>([]);",
    "const [selectedSOSContacts, setSelectedSOSContacts] = useState<number[]>([]);\n" + state_addition
)

# 2. Update the Capture button
old_button = """                    <button className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">
                      <Navigation size={16} /> Capturar Minha Localização GPS
                    </button>"""

new_button = """                    <button 
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isCapturingGps}
                      className={`w-full flex items-center justify-center gap-2 border font-bold py-2 rounded-lg text-sm transition-colors ${
                        gpsLocation 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Navigation size={16} className={isCapturingGps ? 'animate-pulse' : ''} /> 
                      {isCapturingGps ? 'Buscando satélites...' : gpsLocation ? 'Localização GPS Capturada!' : 'Capturar Minha Localização GPS'}
                    </button>"""
content = content.replace(old_button, new_button)

# 3. Update the sendSMS logic to use `gpsLocation`
old_send_logic = """                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const text = `🚨 ALERTA SOS - MADRID AGRO 🚨\\nEmergência na carga!\\nLocalização: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
                          sendSMS(text);
                        },
                        () => {
                          sendSMS(`🚨 ALERTA SOS - MADRID AGRO 🚨\\nEmergência na carga! Não foi possível obter a localização.`);
                        }
                      );
                    } else {
                      sendSMS(`🚨 ALERTA SOS - MADRID AGRO 🚨\\nEmergência na carga!`);
                    }"""

new_send_logic = """                    const text = gpsLocation
                      ? `🚨 ALERTA SOS - MADRID AGRO 🚨\\nEmergência na carga!\\nLocalização: https://maps.google.com/?q=${gpsLocation.latitude},${gpsLocation.longitude}`
                      : `🚨 ALERTA SOS - MADRID AGRO 🚨\\nEmergência na carga!`;
                    sendSMS(text);"""
content = content.replace(old_send_logic, new_send_logic)

# 4. Clear GPS state when closing modal
content = content.replace("setIsSOSMode(false); setSelectedSOSContacts([]);", "setIsSOSMode(false); setSelectedSOSContacts([]); setGpsLocation(null); setIsCapturingGps(false);")

with open(file_path, 'w') as f:
    f.write(content)

print("Logic fixed")
