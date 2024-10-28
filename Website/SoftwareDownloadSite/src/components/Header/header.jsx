import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [opacity, setOpacity] = useState("bg-opacity-100");
  const [top, setTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setOpacity("bg-opacity-85");
      } else {
        setOpacity("bg-opacity-100");
      }

      if (window.scrollY > 2000) {
        setTop(false);
      } else {
        setTop(true);
      }
    };

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="mb-[70px]">
      <header
        className={`bg-blue-950 backdrop-blur-xl shadow-md shadow-blue-500 w-full h-16 px-16 flex fixed items-center transition-all duration-200 ease-in-out
        ${top ? "fixed top-0 translate-y-0" : "fixed top-[-76px] translate-y-2"}
        ${opacity}`}
      >
        <Link
          className="text-2xl font-semibold text-white tracking-wider hover:text-blue-400"
          to={"/"}
        >
          👨🏼‍💻 ResuParse
        </Link>
        <div className="text-lg font-semibold text-white ml-auto space-x-4">
          <Link className="hover:text-blue-400" to={"/downloads"}>
            Download
          </Link>
          <Link className="hover:text-blue-400" to={"/documentation"}>
            Documentation
          </Link>
          <Link className="hover:text-blue-400" to={"/support"}>
            Support
          </Link>
          <Link className="hover:text-blue-400" to={"/about"}>
            About
          </Link>
        </div>
        <div className="space-x-4 ml-auto text-white text-lg">
          <a className="" href="/">
            <button className="border-2 px-5 py-[6px] rounded-lg hover:text-blue-950 hover:bg-white">
              Signup
            </button>
          </a>
        </div>
      </header>
    </div>
  );
}

export default Header;
