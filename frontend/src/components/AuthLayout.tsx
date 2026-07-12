import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/Logo_ANAPORA.png";
import "../styles/AuthLayout.css";
interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <nav className="auth-navbar">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    isActive ? "active" : ""
                }
            >
                Página Inicial
            </NavLink>

            <NavLink
                to="/sobre"
                className={({ isActive }) =>
                    isActive ? "active" : ""
                }
            >
                Sobre nós
            </NavLink>

            <NavLink
                to="/faleconosco"
                className={({ isActive }) =>
                    isActive ? "active" : ""
                }
            >
                Fale Conosco
            </NavLink>

        </nav>

        <div className="auth-card">

          <img
            src={Logo}
            alt="Añaporã"
            className="logo"
          />

          <h1>{title}</h1>

          {children}

          {footer}
        </div>
      </div>
    </div>
  );
}