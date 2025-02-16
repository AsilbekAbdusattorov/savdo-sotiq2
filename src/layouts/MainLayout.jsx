import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='flex flex-col bg-slate-500 text-white w-full min-h-screen'>
      <Header/>
      <main className='bg-slate-400 grow py-10'>
        <div className="w-full max-w-5xl mx-auto px-5">
          <Outlet/>
        </div>
      </main>
      <Footer/>
    </div>
  )
}

export default MainLayout