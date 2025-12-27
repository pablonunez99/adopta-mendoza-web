'use client';

import { Facebook, Link as LinkIcon, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ title, text }: { title: string, text: string }) {
  const handleShareWhatsapp = () => {
    const url = window.location.href;
    const message = `${title}\n${text}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback or just ignore if not supported (buttons are already there)
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Compartir:
      </span>
      <div className="flex gap-3">
        {/* WhatsApp */}
        <button 
          onClick={handleShareWhatsapp}
          className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
          title="Compartir en WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </button>

        {/* Facebook */}
        <button 
          onClick={handleShareFacebook}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
          title="Compartir en Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        
        {/* Copy Link */}
        <button 
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
          title="Copiar Enlace"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
