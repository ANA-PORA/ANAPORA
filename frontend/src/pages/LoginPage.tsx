import "../styles/LoginPage.css";
import photo from "../assets/photografy.jpeg";

export default function LoginPage() {
  return (
    <div className="container">
      <div className="left-panel">
        <img src={photo} alt="banner" />
      </div>

      <div className="right-panel">
        <div className="support">
          <span>Página Inicial</span>
          <span>Fale Conosco</span>
          <span>Sobre Nós</span>
        </div>

        <div className="login-card">
          <h1>AÑA PORÃ</h1>
          <h2>Iniciar Sessão</h2>

          <label htmlFor="nome">Nome</label>
          <input type="text" id="nome" />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" />

          <button type="button">Login</button>

          <div className="register">
            <h3>Não tem conta?</h3>
            <h4>Cadastre-se.</h4>
          </div>
        </div>
      </div>
    </div>
  );
}