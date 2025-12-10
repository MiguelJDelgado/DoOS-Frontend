import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { createUser } from '../../services/CadastroService'; 

const Container = styled.div`
  background-color: #f9f8fb;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background-color: #00273d;
  padding: 40px;
  border-radius: 10px;
  display: flex;
  width: 800px;
  max-width: 90%;
  gap: 40px;
`;

const LogoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

const Titulo = styled.h2`
  color: #fff;
  font-size: 35px;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #061a1fff;
  color: #fff;
  width: 100%;
  max-width: 300px;

  &::placeholder {
    color: #ffffff;
  }
`;

const Select = styled.select`
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #061a1fff;
  color: #fff;
  width: 100%;
  max-width: 320px;
  cursor: pointer;

  option {
    color: #ffffffff;
  }
`;

const Botao = styled.button`
  background-color: #1e4550ff;
  color: #fff;
  border: none;
  margin-top: 20px;
  padding: 15px;
  width: 320px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #4d7985ff;
  }
`;

const ErroMsg = styled.p`
  color: red;
  margin-top: 10px;
  text-align: center;
`;

const Cadastro = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState('usuario');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");

    if (senha !== repetirSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    const roleMap = {
      administrador: "admin",
      gerente: "manager",
      usuario: "employer",
    };

    const novoUsuario = {
      name: nome,
      email,
      password: senha,
      cellphone: telefone,
      role: roleMap[role],
    };

    try {
      const token = localStorage.getItem("token"); 
      const data = await createUser(novoUsuario, token);

      if (data?._id) {
        if (role === "administrador") {
          navigate("/dashboard");
        } else {
          navigate("/configurações");
        }
        return;
      }

      setErro("Erro inesperado ao criar usuário");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar usuário");
    }
  }

  return (
    <>
      <Container>
        <Card>
          <LogoSection>
            <img
              src={logo}
              alt="Logo"
              style={{ width: '90%', marginBottom: '20px' }}
            />
          </LogoSection>

          <FormSection>
            <Titulo>Faça o seu cadastro</Titulo>

            <form onSubmit={handleCadastro}>
              <Input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="text"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />

              <Input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <Input
                type="password"
                placeholder="Repetir senha"
                value={repetirSenha}
                onChange={(e) => setRepetirSenha(e.target.value)}
                required
              />

              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="administrador">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="usuario">Usuário</option>
              </Select>

              <Botao type="submit">Confirmar</Botao>
            </form>

            {erro && <ErroMsg>{erro}</ErroMsg>}
          </FormSection>
        </Card>
      </Container>
    </>
  );
};

export default Cadastro;
