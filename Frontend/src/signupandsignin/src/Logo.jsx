import './Logo.css'
import Fleetlogo from './Fleet Logo.png'
import 'bootstrap/dist/css/bootstrap.min.css';

function Logo() {

  return (
    <>
    <div className='logo'>
      <img src={Fleetlogo} alt="Fleet Logo" />
      <h1>FLEET</h1>
      <p>DRIVE YOUR JOURNEY ANYTIME, ANYWHERE</p>
    </div>
    </>
    
  )
}

export default Logo;