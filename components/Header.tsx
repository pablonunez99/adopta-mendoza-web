'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, LogOut, User as UserIcon, Heart } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Adopta', href: '/adopta' },
    { name: 'Refugios', href: '/refugios' },
    { name: 'Encontrá', href: '/encontra' },
    { name: 'Doná', href: '/donar' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src={'/logo-adopta-mza-black.png'} 
              alt="Logo AdoptaMendoza" 
              width={40} 
              height={40} 
              className="h-10 w-auto dark:hidden transition-transform group-hover:scale-110" 
            />
            <Image 
              src={'/logo-adopta-mza-white.png'} 
              alt="Logo AdoptaMendoza" 
              width={40} 
              height={40} 
              className="h-10 w-auto hidden dark:block transition-transform group-hover:scale-110" 
            />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-800 dark:text-gray-100">
              Adopta<span className="text-primary">Mendoza</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              href="/favoritos"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors"
              title="Mis Favoritos"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                 <Link href="/perfil" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
                   <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                     <UserIcon className="w-4 h-4" />
                   </div>
                   <span className="max-w-[100px] truncate">{user.email}</span>
                 </Link>
                 <button 
                   onClick={() => signOut()}
                   className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                   title="Cerrar Sesión"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="hidden md:block bg-primary hover:bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Ingresar
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111]">
          <nav className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-lg font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-gray-100 dark:border-gray-800" />
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 text-lg font-bold text-gray-600 dark:text-gray-300 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5" /> Mi Perfil
                </Link>
                <button 
                  onClick={() => { signOut(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 text-lg font-bold text-red-500"
                >
                  <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <Link 
                 href="/login"
                 className="text-lg font-bold text-primary"
                 onClick={() => setIsMenuOpen(false)}
              >
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
