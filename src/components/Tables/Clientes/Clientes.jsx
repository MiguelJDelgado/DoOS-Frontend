import { useState, useEffect } from "react";
import Table from "../Table";
import Header from "../../Header/Header";
import ModalCliente from "../../../modals/Clientes/CriarClientes";
import ConfirmModal from "../../../modals/Confirmacao/ConfirmacaoModal";
import SuccessModal from "../../../modals/Sucesso/SucessoModal"
import ErrorModal from "../../../modals/Erro/ErroModal";

import { 
  getAllClients, 
  getClientById, 
  deleteClient 
} from "../../../services/ClienteService";

import { deleteVehicle } from "../../../services/VeiculoService";

const TelaClientes = () => {
  const columns = [
    "Nome",
    "CPF/CNPJ",
    "Telefone",
    "E-mail",
    "Endereço",
    "Número",
    "Município",
    "Veículos",
    "CEP",
  ];

  const [selectedClient, setSelectedClient] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ➕ Estados dos novos modais
  const [confirmData, setConfirmData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const searchOptions = [
    { label: "Nome", value: "name" },
    { label: "CPF", value: "cpf" },
    { label: "CNPJ", value: "cnpj" },
    { label: "E-mail", value: "email" },
    { label: "Telefone", value: "cellphone" },
    { label: "Município", value: "city" },
  ];

  const formatClients = (clientsArray) =>
    clientsArray.map((client) => ({
      _id: client._id,
      Nome: client.name ?? "-",
      "CPF/CNPJ": client.cpf || client.cnpj || "-",
      Telefone: client.cellphone ?? "-",
      "E-mail": client.email ?? "-",
      Endereço: client.address ?? "-",
      Número: client.number ?? "-",
      Município: client.city ?? "-",
      Veículos: client.vehicleIds ? client.vehicleIds.length : 0,
      CEP: client.cep ?? "-",
    }));

  const fetchClients = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await getAllClients({
        page: 1,
        limit: 10,
        ...filters,
      });

      const clientsArray = response.data || response;
      setData(formatClients(clientsArray));
    } catch (error) {
      console.error("Erro ao carregar clientes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = async ({ identifier, search }) => {
    if (!identifier || !search) {
      await fetchClients();
      return;
    }
    await fetchClients({ identifier, search });
  };

  const handleView = async (row) => {
    try {
      const fullClient = await getClientById(row._id);
      setSelectedClient(fullClient);
      setModalMode("view");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    }
  };

  const handleEdit = async (row) => {
    try {
      const fullClient = await getClientById(row._id);
      setSelectedClient(fullClient);
      setModalMode("edit");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    }
  };

  const handleDelete = (row) => {
    setConfirmData({
      id: row._id,
      message: "Tem certeza que deseja excluir este cliente e todos os veículos associados?"
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmData) return;

    try {
      const client = await getClientById(confirmData.id);

      if (client.vehicleIds && client.vehicleIds.length > 0) {
        for (const vehicleId of client.vehicleIds) {
          await deleteVehicle(vehicleId);
        }
      }

      await deleteClient(confirmData.id);

      await fetchClients();
      setSuccessMessage("Cliente excluído com sucesso!");

    } catch (error) {
      console.log("ERRO COMPLETO:", error);
  console.log("error.response:", error.response);
  console.log("error.request:", error.request);
  console.log("error.message:", error.message);

      console.error("Erro ao excluir cliente:", error);

      let extractedMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao excluir cliente.";

      setErrorMessage(extractedMessage);

    } finally {
      setConfirmData(null);
    }
  };


  const handleSaveCliente = () => {
    fetchClients();
  };

  return (
    <div>
      <Header title="Clientes" onNew={() => {
        setSelectedClient(null);
        setModalMode("create");
        setIsModalOpen(true);
      }}>
        + Novo Cliente
      </Header>

      <Table
        columns={columns}
        data={data}
        searchOptions={searchOptions}
        onSearch={handleSearch}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {isModalOpen && (
        <ModalCliente
          mode={modalMode}
          data={selectedClient}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCliente}
        />
      )}

      {/* 🟡 Modal de confirmação */}
      {confirmData && (
        <ConfirmModal
          title="Confirmação"
          message={confirmData.message}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmData(null)}
        />
      )}

      {/* 🟢 Modal de sucesso */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* 🔴 Modal de erro */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

    </div>
  );
};

export default TelaClientes;
