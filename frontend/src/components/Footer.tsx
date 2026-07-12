import { NavLink } from "react-router-dom";
import {
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiPhone,
  FiMail,
  FiTruck,
  FiShield,
  FiCreditCard,
} from "react-icons/fi";
import Logo from "../assets/Logo_ANAPORA.png";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column footer-about">
            <img
              src={Logo}
              alt="Añaporã"
              className="footer-logo"
            />

            <p>
              Valorizando o artesanato indígena e conectando culturas através de
              biojoias sustentáveis produzidas por artesãos nortistas.
            </p>

            <div className="footer-socials">

              <a href="#">
                <FiInstagram />
              </a>

              <a href="#">
                <FiFacebook />
              </a>

              <a href="#">
                <FiYoutube />
              </a>

            </div>

            <div className="footer-contact">

              <div className="contact-item">
                <FiPhone />
                <span>(92) 9 9999-9999</span>
              </div>

              <div className="contact-item">
                <FiMail />
                <span>contato@anaporabiojoias.com.br</span>
              </div>

            </div>

          </div>

          <div className="footer-column">
            <h5>NAVEGAÇÃO</h5>
            <NavLink to="/">
              Início
            </NavLink>
            <NavLink to="/produtos">
              Produtos
            </NavLink>
            <NavLink to="/quem-somos">
              Quem Somos
            </NavLink>
            <NavLink to="/contato">
              Fale Conosco
            </NavLink>
            <NavLink to="/blog">
              Blog
            </NavLink>
            <NavLink to="/politica-privacidade">
              Política de Privacidade
            </NavLink>
            <NavLink to="/trocas">
              Trocas e Devoluções
            </NavLink>
          </div>

          <div className="footer-column">
            <h5>ENTREGA & SEGURANÇA</h5>
            <div className="info-item">
              <FiTruck className="info-icon" />
              <div>
                <strong>Entrega para todo Brasil</strong>
                <span>
                  Frete grátis acima de R$150
                </span>
              </div>
            </div>

            <div className="info-item">
              <FiShield className="info-icon" />
              <div>
                <strong>Compra Segura</strong>
                <span>
                  Ambiente criptografado
                </span>
              </div>
            </div>

            <div className="info-item">
              <FiCreditCard className="info-icon" />
              <div>
                <strong>Formas de Pagamento</strong>
                <span>
                  Pix • Cartão • Boleto • Parcelamento
                </span>
              </div>
            </div>

            <div className="payment-methods">
              <span>Visa</span>
              <span>Master</span>
              <span>Pix</span>
              <span>Boleto</span>
              <span>Amex</span>
            </div>

          </div>

          <div className="footer-column">
            <h5>NEWSLETTER</h5>
            <p>
              Receba novidades, promoções exclusivas e histórias da floresta
              direto no seu e-mail.
           </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
              />
              <button type="submit">
                Quero Receber!
              </button>
            </form>

            <small>
              Ao se cadastrar você concorda com nossa Política de Privacidade.
              Sem spam!
            </small>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-content">

          <span>
            © 2025 Añaporã Biojoias Amazônicas. Todos os direitos reservados.
          </span>

          <span>
            🌿 Feito com amor no coração da Amazônia
          </span>
        </div>
      </div>
    </footer>
  );
}