# Projeto SaborAdmin - Site de Vendas Alimentares

Este projeto foi construído com **React (Vite) + TypeScript** no frontend e **Supabase** no backend.

## 🚀 Como começar

### 1. Configurar o Banco de Dados (Supabase)

Para que o site funcione corretamente, você precisa executar o script SQL de criação das tabelas no seu painel do Supabase:

1. Acesse o seu projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** no menu lateral.
3. Clique em **New Query**.
4. Copie o conteúdo do arquivo [supabase_schema.sql](file:///c:/Users/eunue/Downloads/SITE-ADMAIORAIS/supabase_schema.sql) e cole no editor.
5. Clique em **Run**.

Isso criará as tabelas de produtos, categorias, pedidos e itens de pedido, além de inserir algumas categorias iniciais.

### 2. Configurar Variáveis de Ambiente

O arquivo [.env](file:///c:/Users/eunue/Downloads/SITE-ADMAIORAIS/.env) já foi configurado com as credenciais que você forneceu. Caso precise alterar, edite as variáveis:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Rodar o Projeto Localmente

No terminal, dentro da pasta do projeto, execute:

```bash
npm install
npm run dev
```

O site estará disponível em `http://localhost:5173`.

## 📁 Estrutura do Projeto

- `src/pages/`: Contém as páginas principais (Home, Checkout, AdminDashboard, etc).
- `src/components/`: Componentes reutilizáveis separados por área (Admin/Client).
- `src/context/`: Gerenciamento de estado do carrinho de compras.
- `src/lib/`: Configuração do cliente Supabase.
- `src/types/`: Definições de tipos TypeScript.
- `index.css`: Sistema de design (Cores Azul e Branco, Variáveis, Estilos Globais).

## ✨ Funcionalidades

### Área do Cliente
- **Home**: Lista de produtos com busca e filtro por categoria.
- **Carrinho**: Adição de produtos de forma dinâmica.
- **Checkout**: Formulário completo com método de pagamento (Pix, Cartão, Dinheiro) e troco.

### Área do Administrador
- **Dashboard**: Gráficos e estatísticas de pedidos (Pendentes, Aprovados, Entregues, Cancelados).
- **Gestão de Produtos**: CRUD completo (Nome, Descrição, Preço, Categoria, Imagem, Disponibilidade).
- **Gestão de Pedidos**: Visualização detalhada e alteração de status em tempo real.
- **Localização e Configurações**: Estrutura pronta para expansão.
