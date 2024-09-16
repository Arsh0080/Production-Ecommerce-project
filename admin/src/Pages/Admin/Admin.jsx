import React from 'react'
import './Admin.css'
import Sidebar from '../../Componenets/Navbar/Sidebar/Sidebar'
import {Routes , Route} from 'react-router-dom'
import AddProduct from '../../Componenets/Navbar/AddProduct/AddProduct'
import ListProduct from '../../Componenets/Navbar/ListProduct/ListProduct'
const Admin = () => {
  return (
    <div className='admin'>
       <Sidebar/>
       <Routes>
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
       </Routes>
    </div>
  )
}

export default Admin
