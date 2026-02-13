import { Button } from "../components/ui/button";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import LeaguesSlider from "../components/leaguesSlider";
import HomepageFeatures from "../components/homepageFeatures";
import FeatureGuide from "../components/featureGuide";
import Footer from "../components/footer";
import "./home.css";


export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero/>
      {/* League Cards Section */}
      <LeaguesSlider />
      {/* Features Section */}
      <HomepageFeatures />
      {/* Feature Guide / FAQ Section */}
      <FeatureGuide />
    </>
  );
}
