import type {Metadata} from 'next';
import {Navigation} from '@/components/navigation';
import './globals.css';
export const metadata:Metadata = {title:{default:'Umbral — Tu espacio, a salvo',template:'%s · Umbral'},description:'Crea tu cuenta y accede a tu espacio personal con autenticación segura.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000')};
export const dynamic = 'force-dynamic';
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><Navigation/><div id="contenido">{children}</div><footer className="site-footer"><span>© {new Date().getFullYear()} Umbral</span><span>Hecho para dar el siguiente paso.</span><LinkFooter/></footer></body></html>;
}
function LinkFooter(){return <a href="/privacidad">Privacidad y seguridad ↗</a>;}
