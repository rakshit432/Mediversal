import React from 'react';
import Header from '../components/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import 'tailwind-scrollbar-hide';

const Home = () => {
  return (
    <div className="scrollbar-hide">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner/>
    </div>
  );
};

export default Home;
