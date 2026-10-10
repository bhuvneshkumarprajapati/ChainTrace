import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import Hero from "../sections/Hero";
import HowItWorks from "../sections/HowItWorks";
import VerifyPreview from "../sections/VerifyPreview";
import ProductRegistry from "../sections/ProductRegistry";
import Stats from "../sections/Stats";

function Home() {
  return (
    <div className="min-h-screen bg-[#05090b] text-white">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>

        {/* Hero + 3D Blockchain */}
        <Hero />

        {/* Product Journey */}
        <HowItWorks />

        {/* Product Verification */}
        <VerifyPreview />

        {/* Product Registry */}
        <ProductRegistry />

        {/* Platform Stats */}
        <Stats />

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Home;