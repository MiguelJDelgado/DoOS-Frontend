import { useState, useEffect } from 'react';
import styled from 'styled-components';
import ClienteIcon from "./icons/ClienteOS.png";
import { getAllClients, getClientById } from '../../../services/ClienteService';

const Section = styled.div`
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin-bottom: 24px;
  padding: 16px;
`;

const Icon = styled.img`
  width: 20px;
  height: 25px;
  vertical-align: middle;
  margin-right: 5px;
`;

const SectionHeader = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2b3e50;
  margin-bottom: 12px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #0f2f43;
  font-size: 13px;
`;

const Input = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 1px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: #f3f6f9;
  color: #0f2f43;
  font-size: 14px;

  &:disabled {
    background: #f0f2f5;
    color: #8a8a8a;
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
  z-index: 1000;
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

// ------------------
// MÁSCARAS
// ------------------
const maskCpfCnpj = (value) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const maskTelefone = (value) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

// ------------------

const ClienteOS = ({ clientId, setClientId, isLocked }) => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [dadosCliente, setDadosCliente] = useState({
    nome: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    numero: "",
    municipio: "",
    uf: "",
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await getAllClients();
        setClientes(res || []);
        setFilteredClientes(res || []);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const termo = (busca || "").toLowerCase();
    const filtrados = clientes.filter((c) =>
      (c.name || "").toLowerCase().includes(termo) ||
      (c.cpf || c.cnpj || "").toString().toLowerCase().includes(termo) ||
      (c.cellphone || "").toLowerCase().includes(termo)
    );
    setFilteredClientes(filtrados);
  }, [busca, clientes]);

  useEffect(() => {
    const fetchById = async (id) => {
      if (!id) return;

      try {
        const client = await getClientById(id);
        if (!client) return;

        setClienteSelecionado(client);
        setBusca(client.name || "");
        setDadosCliente({
          nome: client.name || "",
          cpfCnpj: maskCpfCnpj(client.cpf || client.cnpj || ""),
          telefone: maskTelefone(client.cellphone || client.phone || ""),
          email: client.email || "",
          endereco: client.address || client.street || "",
          numero: client.number || client.addressNumber || "",
          municipio: client.city || client.town || "",
          uf: client.state || client.uf || "",
        });
      } catch (err) {
        console.error("Erro ao buscar cliente por id:", err);
      }
    };

    if (clientId) fetchById(clientId);
  }, [clientId]);

  const handleSelectCliente = (cliente) => {
    if (isLocked) return;

    setClienteSelecionado(cliente);
    setClientId(cliente._id);
    setBusca(cliente.name || "");

    setDadosCliente({
      nome: cliente.name || "",
      cpfCnpj: maskCpfCnpj(cliente.cpf || cliente.cnpj || ""),
      telefone: maskTelefone(cliente.cellphone || cliente.phone || ""),
      email: cliente.email || "",
      endereco: cliente.address || cliente.street || "",
      numero: cliente.number || cliente.addressNumber || "",
      municipio: cliente.city || cliente.town || "",
      uf: cliente.state || cliente.uf || "",
    });
  };

  return (
    <Section style={{ opacity: isLocked ? 0.6 : 1 }}>
      <SectionHeader>
        <Icon src={ClienteIcon} alt="Cliente" />
        Cliente
      </SectionHeader>

      <FormGrid>
        <Field style={{ position: "relative" }}>
          <Label>Nome / Razão Social</Label>
          <Input
            type="text"
            value={busca}
            onChange={(e) => {
              if (isLocked) return;
              setBusca(e.target.value);
              setClienteSelecionado(null);
              setClientId(null);
            }}
            placeholder="Digite para buscar..."
            autoComplete="off"
            disabled={isLocked}
          />

          {!isLocked &&
            busca &&
            !clienteSelecionado &&
            filteredClientes.length > 0 && (
              <Dropdown>
                {filteredClientes.slice(0, 8).map((cliente) => (
                  <DropdownItem
                    key={cliente._id}
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    {cliente.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
        </Field>

        <Field>
          <Label>CPF / CNPJ</Label>
          <Input value={dadosCliente.cpfCnpj} disabled />
        </Field>

        <Field>
          <Label>Telefone</Label>
          <Input value={dadosCliente.telefone} disabled />
        </Field>

        <Field>
          <Label>Email</Label>
          <Input value={dadosCliente.email} disabled />
        </Field>

        <Field>
          <Label>Endereço</Label>
          <Input value={dadosCliente.endereco} disabled />
        </Field>

        <Field>
          <Label>Número</Label>
          <Input value={dadosCliente.numero} disabled />
        </Field>

        <Field>
          <Label>Município</Label>
          <Input value={dadosCliente.municipio} disabled />
        </Field>

        <Field>
          <Label>UF</Label>
          <Input value={dadosCliente.uf} disabled />
        </Field>
      </FormGrid>
    </Section>
  );
};

export default ClienteOS;
