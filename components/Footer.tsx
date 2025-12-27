import Link from 'next/link';
import { Heart, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              Adopta<span className="text-primary">Mendoza</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Conectamos corazones. Nuestra misión es encontrar un hogar amoroso para cada animal y reunir a las familias con sus mascotas perdidas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Explorar</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/adopta" className="hover:text-primary transition-colors">Adoptar Mascota</Link></li>
              <li><Link href="/encontra" className="hover:text-primary transition-colors">Mascotas Perdidas</Link></li>
              <li><Link href="/refugios" className="hover:text-primary transition-colors">Refugios Aliados</Link></li>
              <li><Link href="/historias" className="hover:text-primary transition-colors">Historias de Éxito</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Colaborá</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/donar" className="hover:text-primary transition-colors">Hacer Donación</Link></li>
              <li><Link href="/voluntariado" className="hover:text-primary transition-colors">Ser Voluntario</Link></li>
              <li><Link href="/transito" className="hover:text-primary transition-colors">Ofrecer Hogar de Tránsito</Link></li>
              <li><Link href="/empresas" className="hover:text-primary transition-colors">Alianzas Corporativas</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Contacto</h3>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>contacto@adoptamendoza.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Mendoza, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AdoptaMendoza. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacidad" className="hover:text-gray-600 dark:hover:text-gray-200">Privacidad</Link>
            <Link href="/terminos" className="hover:text-gray-600 dark:hover:text-gray-200">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}