import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className='py-5'>
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto px-5">
        <Link className='text-2xl font-bold' to="/AdminPanel">Admin Panel</Link>
      </div>
    </header>
  )
}

export default Header;
