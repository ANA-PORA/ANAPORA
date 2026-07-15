import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

import {
  FiArrowLeft,
  FiCreditCard,
  FiDollarSign,
  FiCheckCircle
} from "react-icons/fi";

import "../styles/pagamento.css";

type MetodoPagamento =
  | "pix"
  | "credito"
  | "debito"
  | "boleto";

export default function Pagamento() {

  const [metodo, setMetodo] =
    useState<MetodoPagamento>("pix");

  const finalizarPagamento = async () => {
    try {
      const response = await api.post("/pagamento/checkout");

      window.location.href = response.data.init_point;
    } catch (error: any) {
        console.log(error.response);
        console.log(error.response?.data);
      alert(JSON.stringify(error.response?.data));
    }
    };

  return (
    <section className="pagamento-page">

      <div className="container">

        <Link
          to="/carrinho"
          className="voltar-carrinho"
        >
          <FiArrowLeft />
          Voltar ao Carrinho
        </Link>

        <h1 className="titulo-pagamento">
          Finalizar Compra
        </h1>

        <div className="row g-4">

          {/* Resumo */}

          <div className="col-lg-5">

            <div className="card shadow-sm resumo-card">

              <div className="card-body">

                <h4>
                  Resumo do Pedido
                </h4>

                <hr />

                <div className="linha-resumo">

                  <span>Produtos</span>

                  <strong>
                    R$ 200,00
                  </strong>

                </div>

                <div className="linha-resumo">

                  <span>Frete</span>

                  <strong>
                    R$ 20,00
                  </strong>

                </div>

                <hr />

                <div className="linha-total">

                  <span>Total</span>

                  <strong>
                    R$ 220,00
                  </strong>

                </div>

                <button
                  className="btn btn-success w-100 mt-4"
                  onClick={finalizarPagamento}
                >
                  Finalizar Pagamento
                </button>

              </div>

            </div>

          </div>

          {/* Pagamento */}

          <div className="col-lg-7">

            <div className="card shadow-sm pagamento-card">

              <div className="card-body">

                <h4>
                  Forma de Pagamento
                </h4>

                <hr />

                <div className="metodos">

                  <label>

                    <input
                      type="radio"
                      checked={metodo==="pix"}
                      onChange={()=>
                        setMetodo("pix")
                      }
                    />

                    PIX

                  </label>

                  <label>

                    <input
                      type="radio"
                      checked={metodo==="credito"}
                      onChange={()=>
                        setMetodo("credito")
                      }
                    />

                    Cartão de Crédito

                  </label>

                  <label>

                    <input
                      type="radio"
                      checked={metodo==="debito"}
                      onChange={()=>
                        setMetodo("debito")
                      }
                    />

                    Cartão de Débito

                  </label>

                  <label>

                    <input
                      type="radio"
                      checked={metodo==="boleto"}
                      onChange={()=>
                        setMetodo("boleto")
                      }
                    />

                    Boleto

                  </label>

                </div>

                <hr />

                {metodo==="pix" && (

                  <div className="pix-box">

                    <FiDollarSign
                      size={55}
                    />

                    <h5>

                      Pagamento via PIX

                    </h5>

                    <p>

                      Escaneie o QR Code
                      ou copie a chave Pix.

                    </p>

                    <div className="qr-placeholder">

                      QR CODE

                    </div>

                    <button
                      className="btn btn-outline-success"
                    >

                      Copiar Código PIX

                    </button>

                  </div>

                )}

                {metodo==="credito" && (

                  <div className="cartao-box">

                    <FiCreditCard
                      size={45}
                    />

                    <div className="row mt-4">

                      <div className="col-12 mb-3">

                        <input
                          className="form-control"
                          placeholder="Nome do Titular"
                        />

                      </div>

                      <div className="col-12 mb-3">

                        <input
                          className="form-control"
                          placeholder="Número do Cartão"
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <input
                          className="form-control"
                          placeholder="Validade"
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <input
                          className="form-control"
                          placeholder="CVV"
                        />

                      </div>

                    </div>

                  </div>

                )}

                {metodo==="debito" && (

                  <div className="cartao-box">

                    <FiCreditCard
                      size={45}
                    />

                    <div className="row mt-4">

                      <div className="col-12 mb-3">

                        <input
                          className="form-control"
                          placeholder="Nome do Titular"
                        />

                      </div>

                      <div className="col-12 mb-3">

                        <input
                          className="form-control"
                          placeholder="Número do Cartão"
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <input
                          className="form-control"
                          placeholder="Validade"
                        />

                      </div>

                      <div className="col-md-6 mb-3">

                        <input
                          className="form-control"
                          placeholder="CVV"
                        />

                      </div>

                    </div>

                  </div>

                )}

                {metodo==="boleto" && (

                  <div className="boleto-box">

                    <FiCheckCircle
                      size={55}
                    />

                    <h5>

                      Pagamento por Boleto

                    </h5>

                    <p>

                      Clique em finalizar
                      para gerar o boleto.

                    </p>

                    <button
                      className="btn btn-outline-success"
                    >

                      Gerar Boleto

                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );

}