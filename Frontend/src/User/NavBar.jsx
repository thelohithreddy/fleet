import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/AuthStore.js';
import useAdminAuthStore from '../../store/AdminAuthStore.js';

const NavBar = ({ isAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isBookingPage = location.pathname.includes('/home/active') || location.pathname.includes('/home/past');
    const { userlogout } = useAuthStore();
    const { adminlogout } = useAdminAuthStore();

    const handleHelpButtonClick = e => {
        e.preventDefault();
        Swal.fire({
            title: 'Need Help?',
            html: `
                <p>Email: fleet@gmail.com</p>
                <p>Contact us anytime</p>
            `,
            icon: 'info',
            customClass: {
                popup: 'custom-popup',
                title: 'custom-title',
                confirmButton: 'custom-button'
            }
        });
    };

    const handleLogout = () => {
        if (isAdmin) {
            adminlogout(); // Call admin logout function
        } else {
            userlogout(); // Call user logout function
        }
        };

    return (
        <div>
            <header className="header_nav">
                <NavLink to={isAdmin ? '/admin' : '/home'}>
                    <div className="logo_nav">
                        <img src="/Logo.png" alt="🚗 FLEET" />
                    </div>
                </NavLink>
                <div className="links_nav">
                    {!isAdmin ? (
                        <>
                            <NavLink to='/home/help' className="help_nav" onClick={handleHelpButtonClick}>Help</NavLink>
                            <NavLink to='/home/active' className={isBookingPage ? "booking_nav active" : "booking_nav"}>Booking</NavLink>
                            <span onClick={handleLogout} className="logout_nav" style={{ cursor: "pointer" }}>Logout</span>
                            <NavLink to='/home/profile' className="profile_nav">👤</NavLink>
                        </>
                    ) : (
                        <>
                            <span onClick={handleLogout} className="logout_nav" style={{ cursor: "pointer" }}>Logout</span>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
};

export default NavBar;



// import React from 'react';
// import { NavLink, useLocation, useNavigate } from 'react-router-dom';
// import './NavBar.css';
// import Swal from 'sweetalert2';

// const NavBar = ({ isAdmin }) => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const isBookingPage = location.pathname.includes('/home/active') || location.pathname.includes('/home/past');

//     const handleHelpButtonClick = e => {
//         e.preventDefault();
//         Swal.fire({
//             title: 'Need Help?',
//             html: `
//                 <p>Email: fleet@gmail.com</p>
//                 <p>Contact us anytime</p>
//             `,
//             icon: 'info',
//             customClass: {
//                 popup: 'custom-popup',
//                 title: 'custom-title',
//                 confirmButton: 'custom-button'
//             }
//         });
//     };

//     const handleLogout = () => {
//         // Clear auth token (or any other relevant user data)
//         localStorage.removeItem('token');
//         sessionStorage.clear(); // Optional

//         // Redirect to /auth and replace current history
//         navigate('/auth', { replace: true });

//         // // Prevent browser back button from returning to protected route
//         // window.history.pushState(null, '', '/auth');
//         // window.addEventListener('popstate', () => {
//         //     navigate('/auth', { replace: true });
//         // });
//          // Push a dummy state to the history so that back button stays at /auth
//     window.history.pushState(null, null, '/auth');

//     // Prevent navigating back to /home or /admin
//     const preventBack = () => {
//         window.history.pushState(null, null, '/auth');
//     };
//     window.addEventListener('popstate', preventBack);
//     };

//     return (
//         <div>
//             <header className="header_nav">
//                 <NavLink to={isAdmin ? '/admin' : '/home'}>
//                     <div className="logo_nav">
//                         <img src="/Logo.png" alt="🚗 FLEET" />
//                     </div>
//                 </NavLink>
//                 <div className="links_nav">
//                     {!isAdmin ? (
//                         <>
//                             <NavLink to='/home/help' className="help_nav" onClick={handleHelpButtonClick}>Help</NavLink>
//                             <NavLink to='/home/active' className={isBookingPage ? "booking_nav active" : "booking_nav"}>Booking</NavLink>
//                             <button onClick={handleLogout} className="logout_nav">Logout</button>
//                             <NavLink to='/home/profile' className="profile_nav">👤</NavLink>
//                         </>
//                     ) : (
//                         <>
//                             <button onClick={handleLogout} className="logout_nav">Logout</button>
//                         </>
//                     )}
//                 </div>
//             </header>
//         </div>
//     );
// };

// export default NavBar;