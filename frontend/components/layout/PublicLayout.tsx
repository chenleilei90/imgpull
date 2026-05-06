import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="page-shell">{children}</main>
      <Footer />
    </>
  );
}
