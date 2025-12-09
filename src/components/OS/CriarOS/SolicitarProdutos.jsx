import { useState, useEffect } from "react";
import styled from "styled-components";
import xIcon from "../../../assets/XIcon.png";
import { getProducts } from "../../../services/ProdutoService";
import { createSolicitacao } from "../../../services/SolicitacaoService";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 4px;
  width: 520px;
  max-width: 95%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  padding: 18px 22px;
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }
`;


const SearchInput = styled.input`
  height: 34px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #f3f6f9;
  font-size: 14px;
  color: #0f2f43;
  padding: 0 8px;
  width: 100%;
`;

const OptionsList = styled.ul`
  position: absolute;
  top: 68px;
  left: 0;
  width: 100%;
  max-height: 160px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  list-style: none;
  padding: 4px 0;
  z-index: 10;

  li {
    padding: 8px 10px;
    cursor: pointer;
    font-size: 14px;
    color: #0f2f43;

    &:hover {
      background: #f3f6f9;
    }
  }
`;

const ProductBlock = styled.div`
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #0f2f43;
  font-size: 13px;
  margin-bottom: 6px;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: #dcdfe6;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover {
    background: #c2c7cc;
  }
`;

const QuantityDisplay = styled.div`
  width: 50px;
  height: 34px;
  background: #f3f6f9;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
  font-size: 15px;
  line-height: 34px;
  color: #0f2f43;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 8px 20px;
  border-radius: 4px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 14px;
  ${({ variant }) =>
    variant === "cancel"
      ? `
        background: #e0e0e0;
        color: #333;
        &:hover { background: #c9c9c9; }
      `
      : `
        background: #00c853;
        color: #fff;
        &:hover { background: #00b248; }
      `}
`;

const AddButton = styled.button`
  width: 100%;
  background: #00c853;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  padding: 6px 0;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 8px;

  &:hover {
    background: #00b248;
  }
`;

function SolicitarProdutoModal({ onClose, serviceOrderId, serviceOrderCode }) {
  const [produtos, setProdutos] = useState([
    { produtoNome: "", produtoId: "", quantidade: 1, observacao: "" },
  ]);
  const [listaProdutos, setListaProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [showOptionsIndex, setShowOptionsIndex] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await getProducts();
        const arr = Array.isArray(response)
          ? response
          : response?.data ?? response?.products ?? [];
        setListaProdutos(arr);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    fetchProdutos();
  }, []);

  const handleSearch = (index, value) => {
    const updated = [...produtos];
    updated[index].produtoNome = value;
    setProdutos(updated);
    setFiltro(value);
    setShowOptionsIndex(index);
  };

  const handleSelectProduto = (index, produto) => {
    const updated = [...produtos];
    updated[index].produtoId = produto._id;
    updated[index].produtoNome = produto.name;
    updated[index].code = produto.code;
    setProdutos(updated);
    setShowOptionsIndex(null);
    setFiltro("");
  };

  const handleQuantidade = (index, op) => {
    setProdutos((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, quantidade: Math.max(1, p.quantidade + op) } : p
      )
    );
  };

  const adicionarProduto = () =>
    setProdutos([...produtos, { produtoNome: "", produtoId: "", quantidade: 1, observacao: "" }]);

  const removerProduto = (index) => setProdutos(produtos.filter((_, i) => i !== index));

  const handleAdd = async () => {
  if (produtos.some((p) => !p.produtoNome))
    return alert("Preencha todos os produtos!");

  try {
    const payload = {
      serviceOrderId,
      serviceOrderCode,
      status: "pending",
      products: produtos.map((p) => ({
        name: p.produtoNome,
        quantity: p.quantidade,
        productId: p.produtoId || undefined,
        code: p.code || undefined,
      })),
    };

    await createSolicitacao(payload);

    onClose();  // apenas fecha o modal, mais nada
  } catch (err) {
    console.error("Erro ao criar solicitação:", err);
    alert("Erro ao criar solicitação.");
  }
};



  return (
    <Overlay>
      <Modal>
        <h3>Solicitar Produto</h3>

        {produtos.map((produto, index) => (
          <ProductBlock key={index}>
            <RemoveButton onClick={() => removerProduto(index)}>
              <img src={xIcon} alt="Remover" />
            </RemoveButton>

            <Field>
              <Label>Produto</Label>
              <SearchInput
                type="text"
                placeholder="Digite para buscar..."
                value={produto.produtoNome}
                onChange={(e) => handleSearch(index, e.target.value)}
                onFocus={() => setShowOptionsIndex(index)}
              />

              {showOptionsIndex === index && filtro.length > 0 && (
                <OptionsList>
                  {listaProdutos
                    .filter((p) =>
                      p.name?.toLowerCase().includes(filtro.toLowerCase())
                    )
                    .map((p) => (
                      <li key={p._id} onClick={() => handleSelectProduto(index, p)}>
                        {p.name}
                      </li>
                    ))}
                </OptionsList>
              )}
            </Field>

            <Field>
              <Label>Quantidade O.S</Label>
              <QuantityContainer>
                <QuantityButton onClick={() => handleQuantidade(index, -1)}>
                  −
                </QuantityButton>
                <QuantityDisplay>{produto.quantidade}</QuantityDisplay>
                <QuantityButton onClick={() => handleQuantidade(index, 1)}>
                  +
                </QuantityButton>
              </QuantityContainer>
            </Field>
          </ProductBlock>
        ))}

        <AddButton onClick={adicionarProduto}>+</AddButton>

        <Footer>
          <Button variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd}>Adicionar</Button>
        </Footer>
      </Modal>
    </Overlay>
  );
}

export default SolicitarProdutoModal;