import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 px-4 sm:px-6 md:px-10 lg:px-20">
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img className="w-8 h-8" src={assets.logo} alt="" />
        <span className="text-xl font-semibold text-gray-800">MedDirect</span>
      </div>
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to={token ? "/" : "/login"}>
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        {token && (
          <>
            <NavLink to="/doctors">
              <li className="py-1">ALL DOCTORS</li>
              <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
            </NavLink>
            <NavLink to="/hospitals">
              <li className="py-1">HOSPITALS</li>
              <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
            </NavLink>
            <NavLink to="/medications">
              <li className="py-1">MEDICATIONS</li>
              <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
            </NavLink>
            <NavLink to="/health-assessment">
              <li className="py-1">HEALTH CHECK</li>
              <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
            </NavLink>
          </>
        )}
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={userData.image} alt="" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate("/my-profile")}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={logout} className="hover:text-black cursor-pointer">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => navigate("/login")}
              className="text-primary border border-primary px-6 py-2 rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-200 hidden sm:block"
            >
              Login
            </button> */}
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-all duration-200"
            >
              Create account
            </button>
          </div>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/* ---------- Mobile Menu ---------- */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <div className="flex items-center gap-2">
              <img className="w-8 h-8" src={assets.logo} alt="" />
              <span className="text-xl font-semibold text-gray-800">
                MedDirect
              </span>
            </div>
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink
              onClick={() => setShowMenu(false)}
              to={token ? "/" : "/login"}
            >
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            {token && (
              <>
                <NavLink onClick={() => setShowMenu(false)} to="/doctors">
                  <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/hospitals">
                  <p className="px-4 py-2 rounded inline-block">HOSPITALS</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to="/medications">
                  <p className="px-4 py-2 rounded inline-block">MEDICATIONS</p>
                </NavLink>
                <NavLink
                  onClick={() => setShowMenu(false)}
                  to="/health-assessment"
                >
                  <p className="px-4 py-2 rounded inline-block">HEALTH CHECK</p>
                </NavLink>
              </>
            )}
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
            {!token && (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/login");
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-full font-medium"
                >
                  Login / Create Account
                </button>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
