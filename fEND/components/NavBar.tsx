import { Link } from 'react-router-dom'

export default function NavBar(){
  
return(

<nav className="fixed top-0 left-0 w-full z-40 backdrop-blur-md bg-slate-900/40 border-b border-sky-400/10 h-[50px] flex items-center justify-between px-6">
      
      <ul className="flex gap-6 text-sm">
        <li>
          <Link to="/" className="hover:text-sky-400 text-white">Welcome</Link>
        </li>
        <li>
          <Link to="/Home" className="hover:text-sky-400 text-white">Home</Link>
        </li>
        <li>
          <Link to="/About" className="hover:text-sky-400 text-white">About</Link>
        </li>
        <li>
          <Link to="/Contact" className="hover:text-sky-400 text-white">Contact</Link>
        </li>

      </ul>
    </nav>



)




}