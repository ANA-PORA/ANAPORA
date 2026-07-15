import {
  useEffect,
  useRef,
  useState
} from "react";
import type {
  ChangeEvent,
  FormEvent
} from "react";
import axios from "axios";
import {
  FiCamera,
  FiCheck,
  FiInstagram,
  FiMapPin,
  FiSave,
  FiTrash2,
  FiUser
} from "react-icons/fi";

import {
  atualizarPerfilArtesao,
  buscarPerfilArtesao,
  uploadFotoPerfil
} from "../../services/artesaoService";

import "../../styles/PerfilArtesao.css";

const ESTADOS_BRASILEIROS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

function normalizarInstagram(valor: string): string {
  return valor
    .trim()
    .replace(
      /^https?:\/\/(www\.)?instagram\.com\//i,
      ""
    )
    .replace(/^@/, "")
    .replace(/\/$/, "");
}

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string
): string {
  if (!axios.isAxiosError(error)) {
    return mensagemPadrao;
  }

  const detalhe = error.response?.data?.detail;

  if (typeof detalhe === "string") {
    return detalhe;
  }

  if (Array.isArray(detalhe)) {
    return detalhe
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(", ");
  }

  return mensagemPadrao;
}

export default function PerfilArtesao() {
  const previewTemporarioRef =
    useRef<string | null>(null);

  const inputFotoRef =
    useRef<HTMLInputElement | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [nomeLoja, setNomeLoja] = useState("");
  const [biografia, setBiografia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [instagram, setInstagram] = useState("");

  const [novaFoto, setNovaFoto] =
    useState<File | null>(null);

  const [previewFoto, setPreviewFoto] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarPerfil() {
      try {
        setErro("");

        const perfil = await buscarPerfilArtesao();

        if (!componenteAtivo) {
          return;
        }

        setNome(perfil.nome ?? "");
        setEmail(perfil.email ?? "");
        setNomeLoja(perfil.nome_loja ?? "");
        setBiografia(perfil.biografia ?? "");
        setTelefone(perfil.telefone ?? "");
        setCep(perfil.cep ?? "");
        setLogradouro(perfil.logradouro ?? "");
        setNumero(perfil.numero ?? "");
        setComplemento(perfil.complemento ?? "");
        setBairro(perfil.bairro ?? "");
        setCidade(perfil.cidade ?? "");
        setEstado(perfil.estado ?? "");
        setFotoUrl(perfil.foto_url ?? "");
        setInstagram(perfil.instagram ?? "");
      } catch (error) {
        if (!componenteAtivo) {
          return;
        }

        setErro(
          obterMensagemErro(
            error,
            "Não foi possível carregar o perfil."
          )
        );
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      componenteAtivo = false;

      if (previewTemporarioRef.current) {
        URL.revokeObjectURL(
          previewTemporarioRef.current
        );
      }
    };
  }, []);

  function limparPreviewTemporario() {
    if (previewTemporarioRef.current) {
      URL.revokeObjectURL(
        previewTemporarioRef.current
      );

      previewTemporarioRef.current = null;
    }
  }

  function selecionarFoto(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = evento.target.files?.[0];

    setErro("");
    setSucesso("");

    if (!arquivo) {
      return;
    }

    if (
      !TIPOS_IMAGEM_PERMITIDOS.includes(
        arquivo.type
      )
    ) {
      setErro(
        "Envie uma imagem JPG, PNG ou WEBP."
      );

      evento.target.value = "";
      return;
    }

    if (arquivo.size <= 0) {
      setErro("A imagem selecionada está vazia.");

      evento.target.value = "";
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErro(
        "A imagem deve possuir no máximo 5 MB."
      );

      evento.target.value = "";
      return;
    }

    limparPreviewTemporario();

    const urlPreview =
      URL.createObjectURL(arquivo);

    previewTemporarioRef.current = urlPreview;

    setNovaFoto(arquivo);
    setPreviewFoto(urlPreview);

    evento.target.value = "";
  }

  function cancelarNovaFoto() {
    limparPreviewTemporario();

    setNovaFoto(null);
    setPreviewFoto("");

    if (inputFotoRef.current) {
      inputFotoRef.current.value = "";
    }
  }

  async function salvarPerfil(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErro("");
    setSucesso("");

    const nomeTratado = nome.trim();
    const nomeLojaTratado = nomeLoja.trim();
    const biografiaTratada = biografia.trim();
    const cepTratado = cep.replace(/\D/g, "");
    const logradouroTratado = logradouro.trim();
    const numeroTratado = numero.trim();
    const complementoTratado = complemento.trim();
    const bairroTratado = bairro.trim();
    const cidadeTratada = cidade.trim();
    const telefoneTratado = telefone.trim();
    const instagramTratado =
      normalizarInstagram(instagram);

    if (nomeTratado.length < 3) {
      setErro(
        "O nome deve possuir pelo menos 3 caracteres."
      );
      return;
    }

    if (
      nomeLojaTratado &&
      nomeLojaTratado.length < 3
    ) {
      setErro(
        "O nome da loja deve possuir pelo menos 3 caracteres."
      );
      return;
    }

    if (biografiaTratada.length > 1000) {
      setErro(
        "A biografia deve possuir no máximo 1000 caracteres."
      );
      return;
    }

    if (cepTratado && cepTratado.length !== 8) {
      setErro("O CEP deve possuir exatamente 8 números.");
      return;
    }

    if (cepTratado && !logradouroTratado) {
      setErro("Informe o logradouro do endereço.");
      return;
    }

    if (cepTratado && !numeroTratado) {
      setErro("Informe o número do endereço.");
      return;
    }

    if (cepTratado && !bairroTratado) {
      setErro("Informe o bairro do endereço.");
      return;
    }

    if (cidadeTratada && !estado) {
      setErro(
        "Selecione o estado correspondente à cidade."
      );
      return;
    }

    if (estado && !cidadeTratada) {
      setErro(
        "Informe a cidade correspondente ao estado."
      );
      return;
    }

    try {
      setSalvando(true);

      const perfilAtualizado =
        await atualizarPerfilArtesao({
          nome: nomeTratado,
          nome_loja: nomeLojaTratado || null,
          biografia: biografiaTratada || null,
          telefone: telefoneTratado || null,
          cep: cepTratado || null,
          logradouro: logradouroTratado || null,
          numero: numeroTratado || null,
          complemento: complementoTratado || null,
          bairro: bairroTratado || null,
          cidade: cidadeTratada || null,
          estado: estado || null,
          instagram: instagramTratado || null
        });

      let urlFotoAtualizada =
        perfilAtualizado.foto_url ?? fotoUrl;

      if (novaFoto) {
        const perfilComFoto =
          await uploadFotoPerfil(novaFoto);

        urlFotoAtualizada =
          perfilComFoto.foto_url ?? "";

        setFotoUrl(urlFotoAtualizada);
        setNovaFoto(null);
        setPreviewFoto("");

        limparPreviewTemporario();
      }

      setNome(perfilAtualizado.nome ?? "");
      setEmail(perfilAtualizado.email ?? "");
      setNomeLoja(
        perfilAtualizado.nome_loja ?? ""
      );
      setBiografia(
        perfilAtualizado.biografia ?? ""
      );
      setTelefone(
        perfilAtualizado.telefone ?? ""
      );
      setCep(perfilAtualizado.cep ?? "");
      setLogradouro(
        perfilAtualizado.logradouro ?? ""
      );
      setNumero(perfilAtualizado.numero ?? "");
      setComplemento(
        perfilAtualizado.complemento ?? ""
      );
      setBairro(perfilAtualizado.bairro ?? "");
      setCidade(perfilAtualizado.cidade ?? "");
      setEstado(perfilAtualizado.estado ?? "");
      setInstagram(
        perfilAtualizado.instagram ?? ""
      );
      setFotoUrl(urlFotoAtualizada);

      setSucesso(
        novaFoto
          ? "Perfil e foto atualizados com sucesso."
          : "Perfil atualizado com sucesso."
      );
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Não foi possível atualizar o perfil."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  const imagemExibida =
    previewFoto || fotoUrl;

  if (carregando) {
    return (
      <section className="artesao-profile-page">
        <div className="artesao-profile-loading">
          <div
            className="spinner-border text-success"
            role="status"
          >
            <span className="visually-hidden">
              Carregando perfil...
            </span>
          </div>

          <span>Carregando perfil...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="artesao-profile-page">
      <header className="artesao-page-header">
        <div>
          <span className="artesao-page-eyebrow">
            Minha conta
          </span>

          <h1>Perfil do artesão</h1>

          <p>
            Atualize as informações que representam você
            e seu trabalho no AnãPorã.
          </p>
        </div>
      </header>

      {erro && (
        <div className="alert alert-danger">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="alert alert-success artesao-profile-success">
          <FiCheck />
          <span>{sucesso}</span>
        </div>
      )}

      <form
        className="artesao-profile-form"
        onSubmit={salvarPerfil}
      >
        <div className="artesao-profile-grid">
          <aside className="artesao-profile-card artesao-profile-preview">
            <div className="artesao-profile-avatar">
              {imagemExibida ? (
                <img
                  key={imagemExibida}
                  src={imagemExibida}
                  alt={
                    nomeLoja ||
                    nome ||
                    "Perfil do artesão"
                  }
                  onError={(evento) => {
                    evento.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <FiUser />
              )}
            </div>

            <div className="artesao-profile-photo-actions">
              <label
                htmlFor="artesao-foto"
                className="artesao-profile-photo-button"
              >
                <FiCamera />

                <span>
                  {imagemExibida
                    ? "Trocar foto"
                    : "Adicionar foto"}
                </span>
              </label>

              <input
                ref={inputFotoRef}
                id="artesao-foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="artesao-profile-photo-input"
                onChange={selecionarFoto}
                disabled={salvando}
              />

              {novaFoto && (
                <button
                  type="button"
                  className="artesao-profile-photo-remove"
                  onClick={cancelarNovaFoto}
                  disabled={salvando}
                >
                  <FiTrash2 />
                  
                </button>
              )}
            </div>

            <small className="artesao-profile-photo-help">
              JPG, PNG ou WEBP, com no máximo 5 MB.
            </small>

            <div className="artesao-profile-preview-info">
              <h2>
                {nomeLoja || nome || "Seu perfil"}
              </h2>

              <p>
                {biografia ||
                  "Adicione um nome para apresentar seu trabalho."}
              </p>
            </div>

            {(cidade || estado) && (
              <div className="artesao-profile-preview-location">
                <FiMapPin />

                <span>
                  {[cidade, estado]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </div>
            )}

            {instagram && (
              <a
                href={`https://instagram.com/${normalizarInstagram(
                  instagram
                )}`}
                target="_blank"
                rel="noreferrer"
                className="artesao-profile-instagram-link"
              >
                <FiInstagram />

                <span>
                  @{normalizarInstagram(instagram)}
                </span>
              </a>
            )}
          </aside>

          <div className="artesao-profile-content">
            <div className="artesao-profile-card">
              <div className="artesao-profile-card-title">
                <h2>Informações pessoais</h2>

                <p>
                  Dados básicos da sua conta no
                  marketplace.
                </p>
              </div>

              <div className="artesao-profile-fields">
                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-nome"
                    className="form-label"
                  >
                    Nome
                  </label>

                  <input
                    id="artesao-nome"
                    type="text"
                    className="form-control"
                    value={nome}
                    onChange={(evento) =>
                      setNome(evento.target.value)
                    }
                    maxLength={150}
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-email"
                    className="form-label"
                  >
                    E-mail
                  </label>

                  <input
                    id="artesao-email"
                    type="email"
                    className="form-control"
                    value={email}
                    disabled
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-telefone"
                    className="form-label"
                  >
                    Telefone
                  </label>

                  <input
                    id="artesao-telefone"
                    type="tel"
                    className="form-control"
                    value={telefone}
                    onChange={(evento) =>
                      setTelefone(evento.target.value)
                    }
                    maxLength={20}
                    placeholder="(92) 99999-9999"
                    disabled={salvando}
                  />
                </div>
              </div>
            </div>

            <div className="artesao-profile-card">
              <div className="artesao-profile-card-title">
                <h2>Perfil público</h2>

                <p>
                  Informações que poderão aparecer para
                  os clientes.
                </p>
              </div>

              <div className="artesao-profile-field">
                <label
                  htmlFor="artesao-biografia"
                  className="form-label"
                >
                  Nome da loja ou ateliê
                </label>

                <textarea
                  id="artesao-biografia"
                  className="form-control artesao-profile-biography"
                  value={biografia}
                  onChange={(evento) =>
                    setBiografia(evento.target.value)
                  }
                  maxLength={1000}
                  placeholder="Ex.: Ateliê Florescer"
                  disabled={salvando}
                />

                <small>
                  {biografia.length}/1000 caracteres
                </small>
              </div>

              <div className="artesao-profile-fields">
                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-cidade"
                    className="form-label"
                  >
                    Cidade
                  </label>

                  <input
                    id="artesao-cidade"
                    type="text"
                    className="form-control"
                    value={cidade}
                    onChange={(evento) =>
                      setCidade(evento.target.value)
                    }
                    maxLength={100}
                    placeholder="Ex.: Manaus"
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-estado"
                    className="form-label"
                  >
                    Estado
                  </label>

                  <select
                    id="artesao-estado"
                    className="form-select"
                    value={estado}
                    onChange={(evento) =>
                      setEstado(evento.target.value)
                    }
                    disabled={salvando}
                  >
                    <option value="">
                      Selecione
                    </option>

                    {ESTADOS_BRASILEIROS.map(
                      (item) => (
                        <option
                          key={item.sigla}
                          value={item.sigla}
                        >
                          {item.nome}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="artesao-profile-card">
              <div className="artesao-profile-card-title">
                <h2>Endereço de origem</h2>

                <p>
                  Este endereço será usado para calcular o
                  frete dos produtos vendidos.
                </p>
              </div>

              <div className="artesao-profile-fields">
                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-cep"
                    className="form-label"
                  >
                    CEP
                  </label>

                  <input
                    id="artesao-cep"
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    value={cep}
                    onChange={(evento) =>
                      setCep(
                        evento.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8)
                      )
                    }
                    maxLength={8}
                    placeholder="69000000"
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-logradouro"
                    className="form-label"
                  >
                    Logradouro
                  </label>

                  <input
                    id="artesao-logradouro"
                    type="text"
                    className="form-control"
                    value={logradouro}
                    onChange={(evento) =>
                      setLogradouro(evento.target.value)
                    }
                    maxLength={150}
                    placeholder="Rua, avenida ou comunidade"
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-numero"
                    className="form-label"
                  >
                    Número
                  </label>

                  <input
                    id="artesao-numero"
                    type="text"
                    className="form-control"
                    value={numero}
                    onChange={(evento) =>
                      setNumero(evento.target.value)
                    }
                    maxLength={20}
                    placeholder="Ex.: 123 ou S/N"
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-complemento"
                    className="form-label"
                  >
                    Complemento
                  </label>

                  <input
                    id="artesao-complemento"
                    type="text"
                    className="form-control"
                    value={complemento}
                    onChange={(evento) =>
                      setComplemento(evento.target.value)
                    }
                    maxLength={100}
                    placeholder="Opcional"
                    disabled={salvando}
                  />
                </div>

                <div className="artesao-profile-field">
                  <label
                    htmlFor="artesao-bairro"
                    className="form-label"
                  >
                    Bairro
                  </label>

                  <input
                    id="artesao-bairro"
                    type="text"
                    className="form-control"
                    value={bairro}
                    onChange={(evento) =>
                      setBairro(evento.target.value)
                    }
                    maxLength={100}
                    placeholder="Ex.: Centro"
                    disabled={salvando}
                  />
                </div>
              </div>
            </div>

            <div className="artesao-profile-card">
              <div className="artesao-profile-card-title">
                <h2>Redes sociais</h2>

                <p>
                  Informe o perfil profissional do seu
                  ateliê.
                </p>
              </div>

              <div className="artesao-profile-field">
                <label
                  htmlFor="artesao-instagram"
                  className="form-label"
                >
                  Instagram
                </label>

                <div className="artesao-profile-input-icon">
                  <FiInstagram />

                  <input
                    id="artesao-instagram"
                    type="text"
                    className="form-control"
                    value={instagram}
                    onChange={(evento) =>
                      setInstagram(evento.target.value)
                    }
                    maxLength={150}
                    placeholder="@meuatelie"
                    disabled={salvando}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="artesao-profile-actions">
          <button
            type="submit"
            className="artesao-profile-submit"
            disabled={salvando}
          >
            <FiSave />

            <span>
              {salvando
                ? novaFoto
                  ? "Salvando e enviando foto..."
                  : "Salvando..."
                : "Salvar alterações"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}