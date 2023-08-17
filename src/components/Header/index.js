import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">MegaLink</div>
      <nav className="menu">
        <Link to="/" className="link">Dashboard</Link>
        <Link to="/combustivel" className="link">Combustível</Link>
        <Link to="/despesa" className="link">Despesas</Link>
        <Link to="/admin" className="link">Admin</Link>
      </nav>
    </header>
  );
};

export default Header;
