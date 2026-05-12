import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
