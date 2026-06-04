import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import MainHeader from './MainHeader';
import SubNavbar from './SubNavbar';
import Footer from './Footer';
import ToastNotification from '../common/ToastNotification';

const AppLayout = () => {
  return (
    <>
      <TopBar />
      <MainHeader />
      <SubNavbar />
      <main className="app-wrapper">
        <Outlet />
      </main>
      <Footer />
      <ToastNotification />
    </>
  );
};

export default AppLayout;
