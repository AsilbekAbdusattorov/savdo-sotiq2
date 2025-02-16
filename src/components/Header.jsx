import React from 'react'
import {Link, NavLink} from 'react-router-dom'

const Header = () => {
  return (
    <header className='py-5'>
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto px-5">
        <Link className='text-2xl font-bold' to="/">Logo</Link>

        <nav className='space-x-8 font-semibold'>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header