import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import editarIcon from '../../assets/editar.png'
import excluirIcon from '../../assets/excluir.png'
import olhoIcon from '../../assets/olho.png'
import aprovarIcon from '../../assets/aprovar.png'
import imprimirIcon from '../../assets/imprimir.png'
import clockIcon from '../../assets/clock.png'
import Header from '../Header/Header'
import { getAllServiceOrders, scheduleTimeReportEmailSender, stopTimeReportEmailSender, deleteServiceOrder, downloadServiceOrderPDF } from '../../services/OrdemServicoService.jsx'
import { getAllClients, getClientById } from '../../services/ClienteService.jsx'
import { getVehicleById } from '../../services/VeiculoService.jsx'
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext.jsx';
import ConfirmModal from "../../modals/Confirmacao/ConfirmacaoModal.jsx"; 
import SuccessModal from "../../modals/Sucesso/SucessoModal.jsx";


const MainContent = styled.div`
  background-color:rgb(253, 253, 253);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`

const ClockButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    opacity: 0.8;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`

const ModalButton = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &.cancel {
    background-color: #ddd;
  }

  &.save {
    background-color: #007bff;
    color: white;
  }

  &:hover {
    opacity: 0.9;
  }
`

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
  padding: 20px;
`

const SearchSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
`

const SearchTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
`

const SearchForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  align-items: end;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
  font-weight: 500;
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }

  &.status-select {
    background-color:#333;
    color: #ffffff;
    border-color: #1f2937;
  }

  &.paid-select {
    background-color:#333;
    color: #ffffff;
    border-color: #1f2937;
  }
`

const FilterButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #0056b3;
  }
`

const TableSection = styled.div`
  padding: 20px;
`

const TableTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`

const Th = styled.th`
  background-color:#7f929d;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  color:rgb(255, 255, 255);
  font-weight: 600;
`

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #333;
`

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  
  &.analise {
    background-color:rgb(224, 187, 64);
    color: #856404;
  }
  
  &.finalizado {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.pendente {
    background-color: #f8d7da;
    color: #721c24;
  }
`

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  margin: 0 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
`

const IconImage = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
`

const Dropdown = styled.ul`
  position: absolute;
  top: 100%; // logo abaixo do input
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

function Os({
  onApprove = () => {},
}) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ open: false, order: null });
  const [modalSuccess, setModalSuccess] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const canShowClock = user?.role === "admin" || user?.role === "manager";

  const formatCurrencyBRL = (value) => {
    if (value === null || value === undefined) return "";
    try {
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(numeric)) return String(value);
      return numeric.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });
    } catch {
      return String(value);
    }
  };

  const formatDateTimeBR = (value) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      const datePart = date.toLocaleDateString("pt-BR");
      const timePart = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `${datePart} ${timePart}`;
    } catch {
      return String(value);
    }
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await getAllClients();
        setClientes(res);
        setFilteredClientes(res);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const termo = buscaCliente.toLowerCase();
    const filtrados = clientes.filter((c) =>
      c.name.toLowerCase().includes(termo)
    );
    setFilteredClientes(filtrados);
  }, [buscaCliente, clientes]);

  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente(cliente.name);
  };

  const statusMap = {
    analise: "request",
    "pendente-produto": "pending_product",
    pendente: "budget",
    emprogresso: "in_progress",
    concluido: "completed",
    cancelado: "canceled",
  };

  const fetchServiceOrders = async ({ clientId, date, code, status, paid } = {}) => {
    try {
    setLoading(true);

    const filters = {};
    if (clientId) filters.clientId = clientId;
    if (date) filters.date = date;
    if (code) filters.code = code;
    if (status && status !== "todos") filters.status = statusMap[status] || status;
    if (paid && paid !== "todos") filters.paid = paid;

    const serviceOrders = await getAllServiceOrders(filters);

      const fullOrders = await Promise.all(
        serviceOrders.map(async (order) => {
          let clientName = "—";
          let vehicleDescription = "—";
          let vehiclePlate = "—";

          try {
            if (order.clientId) {
              const client = await getClientById(order.clientId);
              clientName = client.name || "Sem nome";
            }
          } catch {
            clientName = "Cliente não encontrado";
          }

          try {
            if (order.vehicleId) {
              const vehicle = await getVehicleById(order.vehicleId);
              vehicleDescription = vehicle.name || "—";
              vehiclePlate = vehicle.licensePlate || "—";
            }
          } catch {
            vehicleDescription = "Veículo não encontrado";
          }

          return {
            id: order._id,
            codigo: order.code,
            osNumero: order.code?.split("-")[1]?.trim() || "—",
            clienteNome: clientName,
            veiculoDescricao: vehicleDescription,
            placa: vehiclePlate,
            status: order.status,
            statusLabel: {
              request: "Solicitação",
              pending_product: "Pendente de Produto",
              budget: "Orçamento",
              in_progress: "Em Progresso",
              completed: "Concluído",
              canceled: "Cancelado",
            }[order.status] || "—",

            dataEntrada: order.entryDate,
            dataFinalizacao: order.deadline,
            valor: order.totalValueWithDiscount ?? order.totalValueGeneral,
          };
        })
      );

      setOrders(fullOrders);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar ordens de serviço:", err);
      setError("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceOrders();
  }, []);

    const handleView = (order) => {
      navigate("/criar-ordem-de-serviço", { 
        state: { orderId: order.id || order._id, mode: "view" } 
      });
    };

    const handleDelete = (order) => {
      setModalConfirm({ open: true, order });
    };

    const confirmDelete = async () => {
      const order = modalConfirm.order;
      if (!order) return;

      try {
        await deleteServiceOrder(order.id);

        setOrders((prev) => prev.filter((o) => o.id !== order.id));

        setModalConfirm({ open: false, order: null });
        setModalSuccess(true);
      } catch (err) {
        console.error("Erro ao excluir OS:", err);
        alert(err.message || "Erro ao excluir OS");
      }
    };

    const handlePrint = async (order) => {
      if (!order?.id) {
        alert("ID da ordem de serviço não encontrado.");
        return;
      }

      try {
        const pdfData = await downloadServiceOrderPDF(order.id);

        const blob = new Blob([pdfData], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `OS_${order.codigo || order.osNumero}.pdf`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        alert("Erro ao gerar PDF da Ordem de Serviço.");
      }
    };

  
  const handleFilter = () => {
    const date = document.querySelector('input[type="date"]').value;
    const code = document.querySelector('input[placeholder="Código"]').value;
    const status = document.querySelector('.status-select').value;
    const paid = document.querySelector('.paid-select').value;

    fetchServiceOrders({
      clientId: clienteSelecionado?._id,
      date,
      code,
      status,
      paid,
    });
  };

  


  return (

    <>
      {modalConfirm.open && (
      <ConfirmModal
        title="Excluir Ordem de Serviço"
        message={`Deseja realmente excluir a Ordem de Serviço ${modalConfirm.order?.codigo}?`}
        onConfirm={confirmDelete}
        onCancel={() => setModalConfirm({ open: false, order: null })}
      />
    )}

    {modalSuccess && (
      <SuccessModal
        title="Sucesso"
        message="Ordem de serviço excluída com sucesso!"
        onClose={() => setModalSuccess(false)}
      />
    )}
      <MainContent>
        <Header
          title={
            <>
              Ordem de Serviço
              {canShowClock && (
              <ClockButton onClick={() => setShowModal(true)}>
                <img src={clockIcon} alt="Configurar horário" />
              </ClockButton>
            )}
            </>
          }
          onNew={() => navigate("/criar-ordem-de-serviço")}
        >
          + Nova Ordem de Serviço
        </Header>

        {showModal && (
          <ModalOverlay>
            <ModalContent>
              <ModalTitle>Configurar horário do disparo</ModalTitle>

              <Label>Hora</Label>
              <Input
                type="number"
                placeholder="HH"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              />

              <Label>Minuto</Label>
              <Input
                type="number"
                placeholder="MM"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              />

              <ModalActions>
                <ModalButton
                  className="cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </ModalButton>

                
                <ModalButton
                  className="stop"
                  style={{ backgroundColor: "red", color: "#fff" }}
                  onClick={async () => {
                    try {
                      await stopTimeReportEmailSender();
                      alert("🛑 Disparo pausado com sucesso!");
                      setShowModal(false);
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao pausar disparo: " + err.message);
                    }
                  }}
                >
                  Pausar disparo
                </ModalButton>

                <ModalButton
                  className="save"
                  onClick={async () => {
                    try {
                      const h = parseInt(hour, 10);
                      const m = parseInt(minute, 10);

                      if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
                        alert("Informe um horário válido (0-23) e minuto (0-59).");
                        return;
                      }

                      await scheduleTimeReportEmailSender(h, m);
                      alert("⏰ Horário agendado com sucesso!");
                      setShowModal(false);
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao agendar horário: " + err.message);
                    }
                  }}
                >
                  Salvar
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        <SearchSection>
          <SearchTitle>Buscar</SearchTitle>
          <SearchForm>
            <FormGroup style={{ position: "relative" }}>
              <Label>Cliente</Label>
              <Input
                type="text"
                value={buscaCliente}
                onChange={(e) => {
                  setBuscaCliente(e.target.value);
                  setClienteSelecionado(null);
                }}
                placeholder="Digite para buscar..."
                autoComplete="off"
              />
              {buscaCliente && !clienteSelecionado && filteredClientes.length > 0 && (
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
            </FormGroup>
            <FormGroup>
              <Label>Código</Label>
              <Input type="text" placeholder="Código" />
            </FormGroup>
            <FormGroup>
              <Label>Data de Entrada</Label>
              <Input type="date" />
            </FormGroup>
            <FormGroup>
              <Label>Status</Label>
              <Select className="status-select">
                <option value="todos">Todos</option>
                <option value="analise">Solicitação</option>
                <option value="pendente">Orçamento</option>
                <option value="emprogresso">Em Progresso</option>
                <option value="pendente-produto">Pendente de Produto</option>
                <option value="cancelado">Cancelado</option>
                <option value="concluido">Concluído</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Pago</Label>
              <Select className="paid-select">
                <option value="todos">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <FilterButton onClick={handleFilter}>Filtrar</FilterButton>
            </FormGroup>
          </SearchForm>
        </SearchSection>

        <TableSection>
          <TableTitle>Ordens de Serviço</TableTitle>

          {loading ? (
            <p>Carregando ordens de serviço...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Código</Th>
                  <Th>O.S</Th>
                  <Th>Cliente</Th>
                  <Th>Veículo</Th>
                  <Th>Placa</Th>
                  <Th>Status</Th>
                  <Th>Data de Entrada</Th>
                  <Th>Valor</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <Td>{order.codigo}</Td>
                      <Td>{order.osNumero}</Td>
                      <Td>{order.clienteNome}</Td>
                      <Td>{order.veiculoDescricao}</Td>
                      <Td>{order.placa}</Td>
                      <Td>
                        <StatusBadge className={order.status}>
                          {order.statusLabel}
                        </StatusBadge>
                      </Td>
                      <Td>
                        {formatDateTimeBR(order.dataEntrada)}
                        <br />
                        <small>
                          {order.dataFinalizacao
                            ? `Finaliza em ${formatDateTimeBR(order.dataFinalizacao)}`
                            : "Sem data"}
                        </small>
                      </Td>
                      <Td>{formatCurrencyBRL(order.valor)}</Td>
                      <Td>
                        {order.status === "completed" && (
                          <ActionButton title="Aprovar" onClick={() => onApprove(order)}>
                            <IconImage src={aprovarIcon} alt="Aprovar" />
                          </ActionButton>
                        )}

                        <ActionButton title="Imprimir" onClick={() => handlePrint(order)}>
                          <IconImage src={imprimirIcon} alt="Imprimir" />
                        </ActionButton>

                        <ActionButton
                          title="Editar"
                          onClick={() => navigate("/criar-ordem-de-serviço", { state: { orderId: order.id, mode: "edit" } })}
                        >
                          <IconImage src={editarIcon} alt="Editar" />
                        </ActionButton>

                        <ActionButton title="Excluir" onClick={() => handleDelete(order)}>
                          <IconImage src={excluirIcon} alt="Excluir" />
                        </ActionButton>
                        
                        <ActionButton title="Visualizar" onClick={() => handleView(order)}>
                          <IconImage src={olhoIcon} alt="Visualizar" />
                        </ActionButton>

                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="9">Nenhuma ordem encontrada.</Td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </TableSection>
      </MainContent>
    </>
  );
}

export default Os;