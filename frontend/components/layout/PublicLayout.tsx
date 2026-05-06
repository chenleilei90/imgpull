import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoNotice } from "@/components/ui/DemoNotice";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto mt-4 w-[min(1240px,calc(100vw-32px))]">
        <DemoNotice compact />
      </div>
      <main className="page-shell">{children}</main>
      <Footer />
    </>
  );
}
