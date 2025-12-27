'use client';

import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { Heart, Coffee, Home, Stethoscope, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

// Initialize MP with your PUBLIC KEY
// You should add NEXT_PUBLIC_MP_PUBLIC_KEY to your .env.local
// Example: TEST-00000000-0000-0000-0000-000000000000
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'TEST-000000-000000-000000-000000'; 

export default function DonatePage() {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (MP_PUBLIC_KEY && MP_PUBLIC_KEY !== 'TEST-000000-000000-000000-000000') {
      initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
    } else {
      console.warn('Mercado Pago Public Key no configurada. Los pagos no funcionarán.');
    }
  }, []);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    createPreference(value);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setAmount(null);
    setPreferenceId(null); // Reset button until user stops typing
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount);
    if (val > 0) {
      setAmount(val);
      createPreference(val);
    }
  };

  const createPreference = async (value: number) => {
    setLoading(true);
    try {
      // In a real app, you should create the preference on your BACKEND
      // to keep your Access Token secure.
      // For this demo/MVP, we will simulate the backend call or assume there is an API route.
      
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Donación a AdoptaMendoza',
          quantity: 1,
          price: value,
        }),
      });

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        console.error('Error creating preference:', data);
        toast.error('Error al generar el pago. Intenta más tarde.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const copyAlias = () => {
    navigator.clipboard.writeText('adopta.mendoza.mp');
    setCopied(true);
    toast.success('Alias copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        
        <div className="text-center mb-12">
          <span className="inline-block p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500 mb-4">
            <Heart className="w-8 h-8 fill-current" />
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Tu ayuda transforma vidas
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Somos una organización sin fines de lucro. Todo lo recaudado va directamente a alimento, atención veterinaria y refugio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Donation Form */}
          <div className="bg-white dark:bg-[#151515] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Elige un monto</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <DonationCard 
                icon={<Coffee className="w-6 h-6" />} 
                title="Cafecito" 
                amount={1000} 
                selected={amount === 1000}
                onClick={() => handleAmountSelect(1000)}
              />
              <DonationCard 
                icon={<Home className="w-6 h-6" />} 
                title="Refugio" 
                amount={2500} 
                selected={amount === 2500}
                onClick={() => handleAmountSelect(2500)}
              />
              <DonationCard 
                icon={<Stethoscope className="w-6 h-6" />} 
                title="Salud" 
                amount={5000} 
                selected={amount === 5000}
                onClick={() => handleAmountSelect(5000)}
              />
              <DonationCard 
                icon={<Heart className="w-6 h-6" />} 
                title="Padrino" 
                amount={10000} 
                selected={amount === 10000}
                onClick={() => handleAmountSelect(10000)}
              />
            </div>

            <form onSubmit={handleCustomSubmit} className="mb-8">
              <label className="block text-sm font-bold text-gray-500 mb-2">Otro monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
                  placeholder="0"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  onBlur={handleCustomSubmit} // Trigger on leave
                />
              </div>
            </form>

            <div className="min-h-[60px]">
              {loading && (
                <div className="w-full bg-[#009ee3] h-12 rounded-lg flex items-center justify-center gap-3 animate-pulse shadow-md">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span className="text-white font-bold text-sm">Generando pago...</span>
                </div>
              )}
              
              {!loading && preferenceId && (
                <Wallet initialization={{ preferenceId: preferenceId }} />
              )}

              {!loading && !preferenceId && (
                <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                  Selecciona un monto para donar con Mercado Pago
                </div>
              )}
            </div>
          </div>

          {/* Info & Alias */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">Transferencia Directa</h3>
              <p className="text-blue-700 dark:text-blue-400 mb-6">
                Si prefieres transferir directamente desde tu banco o billetera virtual sin comisiones.
              </p>
              
              <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30 cursor-pointer hover:border-primary transition-colors group" onClick={copyAlias}>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Alias CBU / MP</p>
                  <p className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">adopta.mendoza.mp</p>
                </div>
                <button className="text-gray-400 hover:text-primary">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#151515] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">¿A dónde va tu dinero?</h3>
              <ul className="space-y-4">
                <ListItem text="Compra de alimento balanceado de calidad." />
                <ListItem text="Vacunas, desparasitación y castraciones." />
                <ListItem text="Tratamientos médicos para animales rescatados heridos." />
                <ListItem text="Mejoras en la infraestructura de los refugios aliados." />
              </ul>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function DonationCard({ icon, title, amount, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        selected 
          ? 'border-primary bg-primary/5 text-primary' 
          : 'border-gray-100 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-800'
      }`}
    >
      <div className={`${selected ? 'text-primary' : 'text-gray-400'}`}>{icon}</div>
      <span className="font-bold text-sm dark:text-gray-300">{title}</span>
      <span className="text-lg font-black dark:text-white">${amount.toLocaleString()}</span>
    </button>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}