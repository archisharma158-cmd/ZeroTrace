import Navbar from "./Navbar";
import Footer from "../common/Footer";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="zt-main-content">
        {children}
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;
