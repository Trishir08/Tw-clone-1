import React from 'react'
import LoginPage from './pages/auth/login/LoginPage'
import HomePage from './pages/Home/HomePage'
import { Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/auth/signup/SignUpPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'

const App = () => {
  return (
    
    <div className='flex max-w-6xl mx-auto'>
      <Sidebar/>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/signup' element={<SignUpPage/>} />
      <Route path='/login' element={<LoginPage />} />
    </Routes>
    <RightPanel/>
    </div>
  )
}

export default App
