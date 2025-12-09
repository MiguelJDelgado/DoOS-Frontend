import { useEffect, useState } from "react";
import styled from "styled-components";
import SolicitarProdutoModal from "./SolicitarProdutos";
import ProdutoIcon from "./icons/ProdutoOS.png";
import xIcon from '../../../assets/XIcon.png';
import { getProducts } from "../../../services/ProdutoService";

const Section = styled.div`
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin-bottom: 24px;
  padding: 16px;
  width: 100%;
  overflow-x: visible;
  box-sizing: border-box;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

const Icon = styled.img`
  width: 23px;
  height: 25px;
  vertical-align: middle;
`;

const SectionHeader = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #2b3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequestButton = styled.button`
  background: #1e862cff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  padding: 6px 12px;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    background: #46e08c;
  }

  &:disabled {
    background: #9cc8a8;
    cursor: not-allowed;
  }
`;

const FormWrapper = styled.div`
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  background: #fafafa;
  overflow-x: visible;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 3px;
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  min-width: 600px;

  @media (max-width: 768px) {
    min-width: 500px;
  }
`;

const Field = styled.div`
  display: flex;
  position: relative;
  z-index: 2;
  flex-direction: column;
  min-width: 150px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 4px;
`;

const Input = styled.input`
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: ${(props) => (props.disabled ? "#e9ecef" : "#f3f6f9")};
  font-size: 14px;
  color: #333;
`;

const AddButton = styled.button`
  width: 100%;
  background: #00c853;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  padding: 6px 0;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #00b248;
  }

  &:disabled {
    background: #9be7af;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 64px;
  left: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
  list-style: none;
  padding: 4px 0;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  font-size: 14px;
  color: #0f2f43;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f3f6f9;
  }
`;

function ProdutosSection({ products, setProducts, isLocked, serviceOrderId, serviceOrderCode }) {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [buscas, setBuscas] = useState([""]);
  const [dropdownAtivo, setDropdownAtivo] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await getProducts();
        setTodosProdutos(res?.data || []);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setTodosProdutos([]);
      }
    };
    fetchProdutos();
  }, []);

  useEffect(() => {
    setBuscas(products.map((p) => p.name || ""));
  }, [products]);

  const adicionarProduto = () => {
    if (isLocked) return;
    setProducts([...products, {}]);
    setBuscas([...buscas, ""]);
  };

  const removerProduto = (index) => {
    if (isLocked) return;
    const novosProdutos = products.filter((_, i) => i !== index);
    const novasBuscas = buscas.filter((_, i) => i !== index);
    setProducts(novosProdutos);
    setBuscas(novasBuscas);
  };

  const handleBuscaChange = (index, termo) => {
    if (isLocked) return;

    const novasBuscas = [...buscas];
    novasBuscas[index] = termo;
    setBuscas(novasBuscas);
    setDropdownAtivo(index);

    const novosProdutos = [...products];
    novosProdutos[index] = { ...novosProdutos[index], name: termo };
    setProducts(novosProdutos);
  };

  const handleSelectProduto = (index, produto) => {
    if (isLocked) return;

    const novosProdutos = [...products];
    novosProdutos[index] = {
      productId: produto._id,
      code: produto.code,
      name: produto.name,
      quantity: 1,
      costUnitPrice: produto.costUnitPrice || 0,
      salePrice: produto.salePrice || 0,
      grossProfitMargin: produto.grossProfitMargin ?? 0,
      providerIds: produto.providerIds || [],
      observations: produto.observations || "",
      totalValue: produto.salePrice || 0,
    };
    setProducts(novosProdutos);

    const novasBuscas = [...buscas];
    novasBuscas[index] = produto.name;
    setBuscas(novasBuscas);
    setDropdownAtivo(null);
  };

  const handleQuantidadeChange = (index, quantidade) => {
    if (isLocked) return;

    const novosProdutos = [...products];
    const p = novosProdutos[index] || {};
    p.quantity = quantidade;
    p.totalValue = (p.salePrice || 0) * (quantidade || 0);
    novosProdutos[index] = p;
    setProducts(novosProdutos);
  };

  const produtosFiltrados = (termo) => {
    if (!termo) return [];
    const lower = termo.toLowerCase();
    return todosProdutos.filter((p) => p.name?.toLowerCase().includes(lower));
  };

  useEffect(() => {
    const produtosCorrigidos = products.map((p) => {
    const salePrice = Number(p.salePrice) || 0;
    const quantity = Number(p.quantity) || 1;
    const totalValue = salePrice * quantity;
    return {
      ...p,
      salePrice,
      quantity,
      totalValue,
    };
  });

  if (JSON.stringify(produtosCorrigidos) !== JSON.stringify(products)) {
    setProducts(produtosCorrigidos);
  }
}, [products, setProducts]);


  return (
    <Section disabled={isLocked}>
      <SectionHeader>
        <Icon src={ProdutoIcon} alt="Produto" />
        Produtos
      </SectionHeader>

      <RequestButton disabled={isLocked} onClick={() => setModalAberto(true)}>
        + Solicitar Produto
      </RequestButton>

      {modalAberto && (
        <SolicitarProdutoModal
          onClose={() => setModalAberto(false)}
          onAdd={() => {}}
          serviceOrderId={serviceOrderId}
          serviceOrderCode={serviceOrderCode}
        />
      )}

      {products.map((produto, index) => (
        <FormWrapper key={index}>
          <RemoveButton
            onClick={() => removerProduto(index)}
            disabled={isLocked}
          >
            <img src={xIcon} alt="Remover" />
          </RemoveButton>

          <FormGrid>
            <Field style={{ position: "relative" }}>
              <Label>Descrição</Label>
              <Input
                type="text"
                placeholder="Digite para buscar..."
                value={buscas[index] || ""}
                onChange={(e) => handleBuscaChange(index, e.target.value)}
                onFocus={() => setDropdownAtivo(index)}
                autoComplete="off"
                disabled={isLocked}
              />

              {dropdownAtivo === index &&
                buscas[index] &&
                produtosFiltrados(buscas[index]).length > 0 &&
                !isLocked && (
                  <Dropdown>
                    {produtosFiltrados(buscas[index])
                      .slice(0, 8)
                      .map((p) => (
                        <DropdownItem
                          key={p._id}
                          onClick={() => handleSelectProduto(index, p)}
                        >
                          {p.name}
                        </DropdownItem>
                      ))}
                  </Dropdown>
                )}
            </Field>

            <Field>
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={produto.quantity || ""}
                onChange={(e) =>
                  handleQuantidadeChange(index, Number(e.target.value))
                }
                disabled={isLocked}
              />
            </Field>

            <Field>
              <Label>Valor unitário</Label>
              <Input
                disabled={isLocked}
                value={
                  produto.salePrice !== undefined
                    ? `R$ ${Number(produto.salePrice).toFixed(2)}`
                    : ""
                }
              />
            </Field>

            <Field>
              <Label>Valor total</Label>
              <Input
                disabled={isLocked}
                value={
                  produto.totalValue !== undefined
                    ? `R$ ${Number(produto.totalValue).toFixed(2)}`
                    : ""
                }
              />
            </Field>
          </FormGrid>
        </FormWrapper>
      ))}

      <AddButton onClick={adicionarProduto} disabled={isLocked}>
        +
      </AddButton>
    </Section>
  );
}

export default ProdutosSection;
