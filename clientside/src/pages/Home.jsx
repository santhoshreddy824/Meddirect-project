import Headers from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import MedicalServices from "../components/MedicalServices";
import Questions from "../components/Questions";

const Home = () => {
  return (
    <div>
      <Headers />
      <SpecialityMenu />
      <TopDoctors />
      <MedicalServices />
      <Banner />
      <Questions />
    </div>
  );
};

export default Home;
