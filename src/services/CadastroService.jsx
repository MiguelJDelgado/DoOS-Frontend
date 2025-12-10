// src/services/userService.js

const API_URL = import.meta.env.VITE_API + "/auth/users";

// Buscar todos
export const getUsers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erro ao buscar usuários");
  return res.json();
};

// Buscar por ID
export const getUserById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar usuário");
  return res.json();
};

// Criar
export const createUser = async (userData, token) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Erro ao criar usuário");
  return res.json();
};


