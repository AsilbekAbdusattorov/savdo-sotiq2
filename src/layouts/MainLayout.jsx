import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='flex flex-col w-full min-h-screen'>
      <Header/>
      <main className=''>
        <div className="">
          <Outlet/>
        </div>
      </main>
      <Footer/>
    </div>
  )
}

export default MainLayout