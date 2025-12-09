import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import LayoutModal from "../Layout";
import {
  createMechanic,
  updateMechanic,
} from "../../services/MecanicoService";
import { getAddressByCep } from "../../services/CepService";

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  max-width: 800px;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d5dde3;
  width: 90%;
  background: ${({ disabled }) => (disabled ? "#e9edf0" : "#fff")};
  &:focus {
    outline: none;
    border-color: #999;
    background: #fff;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 40px;
  border-radius: 6px;
  border: 1px solid #d5dde3;
  width: 40%;
  min-height: 80px;
  resize: vertical;
  background: ${({ disabled }) => (disabled ? "#e9edf0" : "#fff")};
  &:focus {
    outline: none;
    border-color: #999;
    background: #fff";
  }
`;

const ErrorMsg = styled.small`
  color: crimson;
  margin-top: 4px;
`;

const CriarColaborador = ({
  mode = "create",
  initialData = null,
  onClose = () => {},
  onSaved = () => {},
}) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cargo: "",
    cep: "",
    endereco: "",
    numero: "",
    municipio: "",
    uf: "",
    email: "",
    telefone: "",
    anotacao: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.Nome || initialData.name || "",
        cpf: initialData.CPF || initialData.cpf || "",
        cargo: initialData.Cargo || initialData.position || "",
        cep: initialData.CEP || initialData.cep || "",
        endereco: initialData.Endereço || initialData.address || "",
        numero: initialData.Número || initialData.number || "",
        municipio: initialData.Município || initialData.city || "",
        uf: initialData.UF || initialData.state || "",
        email: initialData.Email || initialData.email || "",
        telefone: initialData.Telefone || initialData.cellphone || "",
        anotacao: initialData.Anotação || initialData.notes || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    const digits = (form.cep || "").replace(/\D/g, "");
    if (digits.length === 8) {
      getAddressByCep(digits)
        .then((addr) => {
          if (!addr) return;
          setForm((prev) => ({
            ...prev,
            endereco: addr.logradouro || prev.endereco,
            municipio: addr.localidade || prev.municipio,
            uf: addr.uf || prev.uf,
          }));
        })
        .catch(() => {});
    }
  }, [form.cep]);

  const formatCPF = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  const formatCEP = (v) =>
    v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

  const formatTelefone = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");

  const handleChange = (field) => (e) => {
    if (isView) return;

    let value = e.target.value;

    if (field === "cpf") value = formatCPF(value);
    if (field === "cep") value = formatCEP(value);
    if (field === "telefone") value = formatTelefone(value);

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (isView) return true;
    const err = {};
    if (!form.nome.trim()) err.nome = "Nome é obrigatório";
    if (!form.cpf.trim()) err.cpf = "CPF é obrigatório";
    if (!form.cargo.trim()) err.cargo = "Cargo é obrigatório";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      err.email = "E-mail válido é obrigatório";
    if (!form.telefone.trim()) err.telefone = "Telefone é obrigatório";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (isView) return onClose();
    if (!validate()) return;
    setLoading(true);

  const payload = {
    name: form.nome,
    cpf: form.cpf.replace(/\D/g, ""),
    position: form.cargo,
    cep: form.cep.replace(/\D/g, ""),
    address: form.endereco,
    number: form.numero,
    city: form.municipio,
    state: form.uf,
    email: form.email,
    cellphone: form.telefone,
    notes: form.anotacao,
  };



    try {
      if (isEdit) {
        await updateMechanic(initialData._id, payload);
      } else {
        await createMechanic(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutModal
      title={
        mode === "view"
          ? "Visualizar Mecânico"
          : mode === "edit"
          ? "Editar Mecânico"
          : "Adicionar Novo Mecânico"
      }
      onClose={onClose}
      onSave={isView ? null : handleSave}
      disableSave={loading}
      hideSaveButton={isView}
    >
      <FormGrid>
        <Row>
          <Field>
            <Label>Nome</Label>
            <Input
              ref={firstInputRef}
              value={form.nome}
              onChange={handleChange("nome")}
              placeholder="Nome completo"
              disabled={loading || isView}
            />
            {errors.nome && <ErrorMsg>{errors.nome}</ErrorMsg>}
          </Field>

          <Field>
            <Label>CPF</Label>
            <Input
              value={form.cpf}
              onChange={handleChange("cpf")}
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={loading || isView}
            />
            {errors.cpf && <ErrorMsg>{errors.cpf}</ErrorMsg>}
          </Field>

          <Field>
            <Label>Cargo</Label>
            <Input
              value={form.cargo}
              onChange={handleChange("cargo")}
              placeholder="Cargo"
              disabled={loading || isView}
            />
            {errors.cargo && <ErrorMsg>{errors.cargo}</ErrorMsg>}
          </Field>
        </Row>

        <Row>
          <Field>
            <Label>CEP</Label>
            <Input
              value={form.cep}
              onChange={handleChange("cep")}
              placeholder="00000-000"
              maxLength={9}
              disabled={loading || isView}
            />
          </Field>

          <Field style={{ flex: 2 }}>
            <Label>Endereço</Label>
            <Input
              value={form.endereco}
              onChange={handleChange("endereco")}
              placeholder="Rua, Avenida..."
              disabled={loading || isView}
            />
          </Field>

          <Field style={{ maxWidth: "120px" }}>
            <Label>Número</Label>
            <Input
              value={form.numero}
              onChange={handleChange("numero")}
              placeholder="Nº"
              disabled={loading || isView}
            />
          </Field>
        </Row>

        <Row>
          <Field>
            <Label>Município</Label>
            <Input
              value={form.municipio}
              onChange={handleChange("municipio")}
              placeholder="Cidade"
              disabled={loading || isView}
            />
          </Field>

          <Field style={{ maxWidth: "100px" }}>
            <Label>UF</Label>
            <Input
              value={form.uf}
              onChange={handleChange("uf")}
              placeholder="SP"
              maxLength={2}
              disabled={loading || isView}
            />
          </Field>

          <Field>
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={handleChange("telefone")}
              placeholder="(11) 99999-9999"
              maxLength={15}
              disabled={loading || isView}
            />
            {errors.telefone && <ErrorMsg>{errors.telefone}</ErrorMsg>}
          </Field>

          <Field>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={handleChange("email")}
              placeholder="email@empresa.com"
              disabled={loading || isView}
            />
            {errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
          </Field>
        </Row>

        <Field>
          <Label>Anotação</Label>
          <TextArea
            value={form.anotacao}
            onChange={handleChange("anotacao")}
            placeholder="Observações adicionais..."
            disabled={loading || isView}
          />
        </Field>
      </FormGrid>
    </LayoutModal>
  );
};

export default CriarColaborador;
