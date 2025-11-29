import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import Services from './Pages/Services'
import ServiceDetail from './Components/ServiceDetail'
import Dashboard from './Components/Dashboard'

const App = () => {
  return (
    <div className='z-10'>
      {/** Navbar */}
      <Navbar />
      {/** Routes */}
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/Services' element={<Services />}></Route>
        <Route path='/service/:serviceId' element={<ServiceDetail />}></Route>
        <Route path='/dashboard' element={<Dashboard />}></Route>
      </Routes>
    </div>
  )
}

export default App