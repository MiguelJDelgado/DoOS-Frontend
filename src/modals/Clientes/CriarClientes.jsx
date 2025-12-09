import { useState, useEffect } from "react";
import styled from "styled-components";
import xIcon from "../../assets/XIcon.png";
import SuccessModal from "../Sucesso/SucessoModal";
import ErrorModal from "../Erro/ErroModal";

import {
  createClient,
  getClientById,
  updateClient,
} from "../../services/ClienteService";

import {
  createVehicle,
  getVehicleById,
  updateVehicle,
  getConsultarPlacaApi,
} from "../../services/VeiculoService";
import { getAddressByCep } from "../../services/CepService";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  width: 900px;
  max-width: 95%;
  max-height: 90%;
  overflow-y: auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 10px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #2b3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #555;
`;

const Section = styled.div`
  background: #fff;
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #2b3e50;
  margin-bottom: 10px;
`;

const FormWrapper = styled.div`
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 18px;
    height: 18px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns}, 1fr)`};
  gap: 12px;
  margin-bottom: 10px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
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
  background: #f3f6f9;
  font-size: 14px;
  color: #333;
`;

const InputUF = styled.input`
  height: 32px;
  width: 77px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f3f6f9;
  font-size: 14px;
  color: #333;
`;

const TextArea = styled.textarea`
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f3f6f9;
  padding: 8px 10px;
  font-size: 14px;
  color: #333;
`;

const AddButton = styled.button`
  width: 100%;
  background: #00bf63;
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
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  background: #ccc;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
`;

const ConfirmButton = styled.button`
  background: #7ed957;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
`;

const ModalCliente = ({ mode, data, onClose, onSave }) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    cnpj: "",
    stateRegistration: "",
    cep: "",
    address: "",
    number: "",
    city: "",
    state: "",
    email: "",
    cellphone: "",
    notes: "",
  });

  const [veiculos, setVeiculos] = useState([{}]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const formatCPFouCNPJ = (value) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const formatCEP = (value) =>
    value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);

  const formatTelefone = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);

  const formatInscricaoEstadual = (value) =>
    value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").substring(0, 14);

  const apenasNumerosPositivos = (value) => value.replace(/\D/g, "");

  useEffect(() => {
    if (!data || isCreate) return;

    async function loadAll() {
      try {
        const cliente = await getClientById(data._id);

        setForm({
          name: cliente.name || "",
          cpf: cliente.cpf || "",
          cnpj: cliente.cnpj || "",
          stateRegistration: cliente.stateRegistration || "",
          cep: cliente.cep || "",
          address: cliente.address || "",
          number: cliente.number || "",
          city: cliente.city || "",
          state: cliente.state || "",
          email: cliente.email || "",
          cellphone: cliente.cellphone || "",
          notes: cliente.notes || "",
        });

        if (cliente.vehicleIds?.length > 0) {
          const allVehicles = [];

          for (const id of cliente.vehicleIds) {
            const v = await getVehicleById(id);

            allVehicles.push({
              _id: v._id,
              licensePlate: v.licensePlate || "",
              brand: v.brand || "",
              name: v.name || "",
              year: v.year || "",
              fuel: v.fuel || "",
              chassi: v.chassi || "",
              km: v.km || "",
            });
          }

          setVeiculos(allVehicles);
        } else {
          setVeiculos([{}]);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
      }
    }

    loadAll();
  }, [data, mode]);

  // Buscar endereço pelo CEP automaticamente
  useEffect(() => {
    const rawCep = form.cep?.replace(/\D/g, "");

    if (rawCep?.length === 8) {
      async function fetchAddress() {
        try {
          const data = await getAddressByCep(rawCep);

          setForm((prev) => ({
            ...prev,
            address: data.logradouro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));

        } catch (err) {
          console.error("Erro ao buscar CEP:", err);
          setErrorMessage("CEP não encontrado.");
        }
      }

      fetchAddress();
    }
  }, [form.cep]);

  // Autocompletar veículo pela placa AAA0000
  useEffect(() => {
    if (isView) return;

    veiculos.forEach((v, index) => {
      const placa = (v.licensePlate || "").toUpperCase().trim();

      if (placa === "AAA0000" && !v._fetched) {
        async function fetchVehicleData() {
          try {
            const response = await getConsultarPlacaApi(placa);
            const dados = response?.dados?.informacoes_veiculo?.dados_veiculo;
            if (!dados) return;

            const updated = [...veiculos];

            updated[index] = {
              ...updated[index],
              licensePlate: dados.placa || "",
              brand: dados.marca || "",
              name: dados.modelo || "",
              year: dados.ano_modelo || "",
              fuel: dados.combustivel || "",
              chassi: dados.chassi || "",
              km: updated[index].km || "",
              _fetched: true,
            };

            setVeiculos(updated);
          } catch (err) {
            console.error("Erro ao consultar placa:", err);
          }
        }

        fetchVehicleData();
      }
    });
  }, [veiculos, isView]);




  const handleChange = (field, value) => {
    if (isView) return;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (index, field, value) => {
    if (isView) return;
    const updated = [...veiculos];
    updated[index] = { ...updated[index], [field]: value };
    setVeiculos(updated);
  };

  const addVehicle = () => {
    if (isView) return;
    setVeiculos([...veiculos, {}]);
  };

  const removeVehicle = (index) => {
    if (isView) return;
    setVeiculos(veiculos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isView) return;
    try {
      const savedVehicleIds = [];

      for (const v of veiculos) {
        if (!v.licensePlate) continue;

        if (v._id) {
          const updated = await updateVehicle(v._id, v);
          savedVehicleIds.push(updated._id);
        } else {
          const created = await createVehicle({
            ...v,
            name: v.name || v.model || "",
          });
          savedVehicleIds.push(created._id);
        }
      }

      const payload = {
        ...form,
        vehicleIds: savedVehicleIds,
      };

      if (isEdit) await updateClient(data._id, payload);
      if (isCreate) await createClient(payload);

      setSuccessMessage("Cliente salvo com sucesso!");

    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      setErrorMessage(
        err?.response?.data?.message || "Erro ao salvar cliente."
      );
    }
  };

  return (
    <>
    {successMessage && (
      <SuccessModal
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
          if (onSave) onSave();
          onClose();
        }}
      />
    )}

    {errorMessage && (
      <ErrorModal
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    )}
    <Overlay>
      <ModalContainer>
        <Header>
          <Title>
            {isCreate && "Adicionar Novo Cliente"}
            {isEdit && "Editar Cliente"}
            {isView && "Visualizando Cliente"}
          </Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Section>
          <FormGrid columns="3">
            <Field>
              <Label>Nome/Razão Social</Label>
              <Input
                disabled={isView}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Field>

            <Field>
              <Label>CPF/CNPJ</Label>
              <Input
                disabled={isView}
                value={formatCPFouCNPJ(form.cpf || form.cnpj || "")}
                onChange={(e) =>
                  handleChange("cpf", e.target.value.replace(/\D/g, ""))
                }
              />
            </Field>

            <Field>
              <Label>Inscrição Estadual</Label>
              <Input
                disabled={isView}
                value={formatInscricaoEstadual(form.stateRegistration || "")}
                onChange={(e) =>
                  handleChange(
                    "stateRegistration",
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </Field>
          </FormGrid>

          <FormGrid columns="6">
            <Field>
              <Label>CEP</Label>
              <Input
                disabled={isView}
                value={formatCEP(form.cep || "")}
                onChange={(e) =>
                  handleChange("cep", e.target.value.replace(/\D/g, ""))
                }
              />
            </Field>

            <Field>
              <Label>Endereço</Label>
              <Input
                disabled={isView}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Field>

            <Field>
              <Label>Número</Label>
              <Input
                disabled={isView}
                value={form.number}
                onChange={(e) => handleChange("number", e.target.value)}
              />
            </Field>

            <Field>
              <Label>Município</Label>
              <Input
                disabled={isView}
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </Field>

            <Field>
              <Label>UF</Label>
              <InputUF
                disabled={isView}
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </Field>
          </FormGrid>

          <FormGrid columns="2">
            <Field>
              <Label>Email</Label>
              <Input
                disabled={isView}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Field>

            <Field>
              <Label>Telefone</Label>
              <Input
                disabled={isView}
                value={formatTelefone(form.cellphone || "")}
                onChange={(e) =>
                  handleChange("cellphone", e.target.value.replace(/\D/g, ""))
                }
              />
            </Field>
          </FormGrid>

          <Field>
            <Label>Anotação</Label>
            <TextArea
              disabled={isView}
              rows="2"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </Field>
        </Section>

        <Section>
          <SubTitle>Adicionar veículos ao cliente</SubTitle>

          {veiculos.map((v, i) => (
            <FormWrapper key={i}>
              {!isView && (
                <RemoveButton onClick={() => removeVehicle(i)}>
                  <img src={xIcon} alt="Remover veículo" />
                </RemoveButton>
              )}

              <FormGrid columns="4">
                <Field>
                  <Label>Placa</Label>
                  <Input
                    disabled={isView}
                    value={v.licensePlate || ""}
                    onChange={(e) =>
                    handleVehicleChange(i, "licensePlate", e.target.value.toUpperCase())
                    }
                  />
                </Field>

                <Field>
                  <Label>Marca</Label>
                  <Input
                    disabled={isView}
                    value={v.brand || ""}
                    onChange={(e) =>
                      handleVehicleChange(i, "brand", e.target.value)
                    }
                  />
                </Field>

                <Field>
                  <Label>Modelo</Label>
                  <Input
                    disabled={isView}
                    value={v.name || ""}
                    onChange={(e) =>
                      handleVehicleChange(i, "name", e.target.value)
                    }
                  />
                </Field>

                <Field>
                  <Label>Ano</Label>
                  <Input
                    disabled={isView}
                    value={v.year || ""}
                    onChange={(e) =>
                      handleVehicleChange(
                        i,
                        "year",
                        apenasNumerosPositivos(e.target.value)
                      )
                    }
                  />
                </Field>
              </FormGrid>

              <FormGrid columns="4">
                <Field>
                  <Label>Tipo de combustível</Label>
                  <Input
                    disabled={isView}
                    value={v.fuel || ""}
                    onChange={(e) =>
                      handleVehicleChange(i, "fuel", e.target.value)
                    }
                  />
                </Field>

                <Field>
                  <Label>Chassi</Label>
                  <Input
                    disabled={isView}
                    value={v.chassi || ""}
                    onChange={(e) =>
                      handleVehicleChange(i, "chassi", e.target.value)
                    }
                  />
                </Field>

                <Field>
                  <Label>Km</Label>
                  <Input
                    disabled={isView}
                    value={v.km || ""}
                    onChange={(e) =>
                      handleVehicleChange(i, "km", e.target.value)
                    }
                  />
                </Field>
              </FormGrid>
            </FormWrapper>
          ))}

          {!isView && <AddButton onClick={addVehicle}>+</AddButton>}
        </Section>

        <Footer>
          <CancelButton onClick={onClose}>Cancelar</CancelButton>
          {!isView && (
            <ConfirmButton onClick={handleSubmit}>Salvar</ConfirmButton>
          )}
        </Footer>
      </ModalContainer>
    </Overlay>
    </>
  );
};

export default ModalCliente;