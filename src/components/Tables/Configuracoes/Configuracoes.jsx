import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Table from "../Table";
import Header from "../../Header/Header";
import {
  getAllUsers,
  deleteUser,
  updateUser,
} from "../../../services/UsuarioService";
import ConfirmModal from "../../../modals/Confirmacao/ConfirmacaoModal";
import ErrorModal from "../../../modals/Erro/ErroModal";
import SuccessModal from "../../../modals/Sucesso/SucessoModal";

const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Arrow = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  user-select: none;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 22px;
  left: 0;
  width: 120px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 50;
`;

const DropdownItem = styled.div`
  padding: 8px;
  cursor: pointer;
  border-bottom: ${(props) => (props.last ? "none" : "1px solid #eee")};

  &:hover {
    background: #f5f5f5;
  }
`;

const TelaConfiguracoes = () => {
  const navigate = useNavigate();

  const columns = ["Nome", "Email", "Perfil de acesso"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);
  const [showError, setShowError] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  const searchOptions = [
    { label: "Nome", value: "name" },
    { label: "Email", value: "email" },
    { label: "Perfil de Acesso", value: "role" },
  ];

  const toggleRole = async (user, newRole) => {
    try {
      await updateUser(user._id, { role: newRole });
      await fetchUsers();
      setOpenDropdownId(null);
    } catch (err) {
      console.error("Erro ao alterar perfil:", err);
      setShowError("Erro ao alterar perfil.");
    }
  };

  const formatUsers = (usersArray) =>
    usersArray.map((user) => ({
      Nome: user.name ?? "-",
      Email: user.email ?? "-",
      "Perfil de acesso":
        user.role === "admin" ? (
          "Administrador"
        ) : (
          <DropdownContainer>
            {user.role === "manager" ? "Gerente" : "Usuário"}

            <Arrow
              onClick={() =>
                setOpenDropdownId(
                  openDropdownId === user._id ? null : user._id
                )
              }
            >
              ▼
            </Arrow>

            {openDropdownId === user._id && (
              <Dropdown>
                {user.role === "manager" ? (
                  <DropdownItem
                    last
                    onClick={() => toggleRole(user, "employer")}
                  >
                    Usuário
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    last
                    onClick={() => toggleRole(user, "manager")}
                  >
                    Gerente
                  </DropdownItem>
                )}
              </Dropdown>
            )}
          </DropdownContainer>
        ),

      Ações: { id: user._id },
      rawData: user,
    }));

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await getAllUsers({
        page: 1,
        limit: 10,
        ...filters,
      });

      const usersArray = response.data || response;
      setData(formatUsers(usersArray));
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async ({ identifier, search }) => {
    if (!identifier || !search) {
      await fetchUsers();
      return;
    }

    const normalized = search.trim().toLowerCase();

    if (identifier === "role") {
      if (normalized === "administrador")
        return fetchUsers({ identifier, search: "admin" });
      if (normalized === "usuário" || normalized === "usuario")
        return fetchUsers({ identifier, search: "employer" });
      if (normalized === "gerente")
        return fetchUsers({ identifier, search: "manager" });
    }

    fetchUsers({ identifier, search });
  };

  const handleDelete = (row) => {
    const id = row.rawData?._id;
    if (!id) return;

    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);

    try {
      await deleteUser(deleteId);
      setData((prev) => prev.filter((u) => u.rawData._id !== deleteId));
      setShowSuccess("Usuário excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      setShowError("Erro ao excluir usuário.");
    }
  };

  return (
    <div>
      <Header title="Configurações" onNew={() => navigate("/cadastro")}>
        + Novo Colaborador
      </Header>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table
          columns={columns}
          data={data}
          searchOptions={searchOptions}
          onSearch={handleSearch}
          onDelete={handleDelete}
        />
      )}

      {/* 🔥 MODAIS */}
      {showConfirm && (
        <ConfirmModal
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este usuário?"
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message={showSuccess}
          onClose={() => setShowSuccess(null)}
        />
      )}

      {showError && (
        <ErrorModal
          message={showError}
          onClose={() => setShowError(null)}
        />
      )}
    </div>
  );
};

export default TelaConfiguracoes;
