import Navbar from "./Navbar";
import Footer from "../common/Footer";
import CosmicBackground from "./CosmicBackground";

function MainLayout({ children }) {
  return (
    <>
      <CosmicBackground />
      <Navbar />

      <main className="zt-main-content">
        {children}
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;
