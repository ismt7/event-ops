import React from "react";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-white text-lg font-bold">Event Ops</div>
          <div>
            <a href="#" className="text-gray-300 hover:text-white px-3">Home</a>
            <a href="#" className="text-gray-300 hover:text-white px-3">About</a>
            <a href="#" className="text-gray-300 hover:text-white px-3">Contact</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
