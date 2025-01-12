import React,{useContext, useRef, useState} from 'react'
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { ShopContext } from '../../Context/ShopContext';
import drop_icon from '../Assets/dd.png'
const Navbar = () => {
    const [menu,setMenu] = useState("shop");
    const {getTotalCartItems} = useContext(ShopContext);
    const menuRef = useRef();
   
    const dropdown_toggle = (e) =>{
     menuRef.current.classList.toggle('nav-menu-visible');
     e.target.classList.toggle('open');
    }

  return (
    <div className='navbar'>
      <div className='nav-logo'>
       <img src={logo} alt="" />
       <p>ClothKart</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={drop_icon} alt="" />
      <ul ref={menuRef} className='nav-menu'>
                <li onClick={() => setMenu("shop")}><Link to='/'>Shop</Link>
                     {menu === "shop" ? <hr /> : null}
                </li>
                <li onClick={() => setMenu("men")}><Link to='/mens'>Men</Link>
                     {menu === "men" ? <hr /> : null}
                </li>
                <li onClick={() => setMenu("women")}><Link to='/womens'>Women</Link>
                     {menu === "women" ? <hr /> : null}
                </li>
                <li onClick={() => setMenu("kids")}><Link to='/kids'>Kid</Link>
                     {menu === "kids" ? <hr /> : null}
                </li>
            </ul>
      <div className='nav-login-cart'>
        {localStorage.getItem('auth-token')
        ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button>
      :<Link to='/login'><button>Login</button></Link>}
        
        <Link to='/cart'><img src={cart_icon} alt="" /></Link>
        <div className='nav-cart-count'>
        {getTotalCartItems()}
        </div>
      </div>
    </div>
  )
}

export default Navbar
