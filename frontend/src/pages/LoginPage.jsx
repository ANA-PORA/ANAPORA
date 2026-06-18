import "./LoginPage.css";
import photo from "./assets/photografy.jpeg";

function LoginPage() {
  return (
    <div className="container">
      <div className="left-panel">
        <img src={photo} alt="banner" />
      </div>

      <div className="right-panel">
        <div className="support">
          <span>Pagina Inicial</span>
          <span>Fale Conosco</span>
          <span>Sobre Nós</span>
        </div>

        <div className="login-card">
          <h1>AÑA PORÃ</h1>
          <h2>Iniciar Sessão</h2>

            <label for="nome">Nome</label>
            <input type="text" id="nome" />

            <label for="email">Email</label>
            <input type="email" id="email" />

            <label for="senha">Senha</label>
            <input type="password" id="senha" />

          <button>Login</button>

        <div className="register">
            <h3>Não tem conta?</h3>
            <h4>Cadastre-se.</h4>

        </div>

        
        </div>
      </div>
    </div>
  );
}

export default LoginPage;