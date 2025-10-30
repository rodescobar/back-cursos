# back-Curso

Backend para sistema de cursos (JavaScript) — estrutura para gerenciar usuários e cursos.

Tudo em JavaScript, documentação em português.

## Visão geral

- API Express + MongoDB (mongoose)
- Cada usuário, ao se registrar, terá um banco MongoDB próprio com o nome igual ao `usuario` informado.
- CRUD completo de cursos. Cada curso possui título, descrição, array de imagens e um array de aulas. Cada aula tem número, título, descrição e tempo.
- Autenticação via JWT.
- Swagger disponível em `/api-docs` (em português).

## Requisitos

- Node.js 16+ (recomendado)
- MongoDB rodando localmente ou URI acessível

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `back-Curso` com pelo menos:

MONGODB_URI=mongodb://localhost:27017/admin
JWT_SECRET=sua_chave_secreta_aqui
PORT=3000

> Observação: `MONGODB_URI` é a conexão administrativa/central usada pela aplicação para checar bancos existentes; quando um usuário se registra, a aplicação cria uma conexão separada apontando para `mongodb://<host>:<port>/<usuario>`.

## Instalação

Abra o CMD na pasta `back-Curso` e rode:

```bat
cd back-Curso
npm install
```

## Rodando em desenvolvimento

```bat
npm run dev
```

ou

```bat
npm start
```

A API ficará disponível em `http://localhost:3000` (ou a porta definida em `.env`). A documentação Swagger ficará em `http://localhost:3000/api-docs`.

## Endpoints principais (resumo)

Formato de resposta de sucesso:
- Status HTTP 200 e JSON: `{ msg: "Mensagem de sucesso", ... }`

Formato de erros esperados:
- Status HTTP 400, 401, 404, 500 e JSON: `{ erro: "Mensagem de erro" }`

### Usuário

- POST /usuario/registro
  - Corpo (JSON): `{ "usuario": "joao", "senha": "123456", "email": "joao@email.com", "nome": "João Silva" }`
  - Respostas:
    - 200: `{ msg: "Usuário criado com sucesso" }`
    - 400: `{ erro: "Usuário já existe" }` (quando já existe um banco com esse nome)

- POST /usuario/login
  - Corpo: `{ "usuario": "joao", "senha": "123456" }`
  - Respostas:
    - 200: `{ token: "<jwt>", usuario: { nome, email, usuario } }`
    - 401: `{ erro: "Usuário ou senha inválidos" }`

- GET /usuario/perfil (protegido)
  - Headers: `Authorization: Bearer <token>`
  - Resposta 200: objeto usuário (sem a senha)

- PUT /usuario/atualizar (protegido)
  - Corpo: `{ "nome": "Novo Nome", "email": "novo@email.com" }`
  - Resposta 200: `{ msg: "Dados atualizados com sucesso", usuario: { ... } }`

- PUT /usuario/alterar-senha (protegido)
  - Corpo: `{ "senhaAtual": "123456", "novaSenha": "654321" }`
  - Respostas:
    - 200: `{ msg: "Senha alterada com sucesso" }`
    - 401: `{ erro: "Senha atual incorreta" }`

### Cursos
Todas as rotas de cursos exigem o header `Authorization: Bearer <token>` e operam no banco do usuário autenticado.

- GET /cursos
  - Lista todos os cursos do usuário
  - 200: array de cursos

- POST /cursos
  - Corpo (JSON): exemplo de curso

```json
{
  "titulo": "JavaScript Completo",
  "descricao": "Curso completo de JavaScript",
  "imagens": ["http://img.com/001.png", "http://img.com/002.png"],
  "aulas": [
    { "titulo": "Conhecendo o JS", "descricao": "Intro", "tempo": "15:00" },
    { "titulo": "Hello World", "descricao": "Primeiro programa", "tempo": "10:00" }
  ]
}
```

  - Respostas:
    - 200: `{ msg: "Curso criado com sucesso", curso: { ... } }`
    - 400: `{ erro: "Curso já existe" }`

- GET /cursos/{id}
  - Busca um curso pelo ObjectId
  - 200: curso
  - 404: `{ erro: "Curso não encontrado" }`

- PUT /cursos/{id}
  - Atualiza curso
  - 200: `{ msg: "Curso atualizado com sucesso", curso: { ... } }`
  - 404: `{ erro: "Curso não encontrado" }`

- DELETE /cursos/{id}
  - Remove curso
  - 200: `{ msg: "Curso deletado com sucesso" }`
  - 404: `{ erro: "Curso não encontrado" }`

## Observações importantes sobre o banco por usuário

- Ao registrar (`/usuario/registro`) o sistema verifica os bancos existentes (através da conexão administrativa definida em `MONGODB_URI`). Se já existir um banco com o mesmo nome do `usuario`, o registro falha com 400.
- Se o banco não existir, é criada uma nova conexão para `mongodb://<host>:<port>/<usuario>` e o documento do usuário é criado dentro desse banco (coleção `usuarios` / modelo `Usuario`).
- Todas as operações protegidas (cursos, perfil, atualização, senha) usam o token JWT para determinar o `usuario` e abrir conexão para o banco `mongodb://.../<usuario>`.

Atenção:
- Essa estratégia (um banco por usuário) é específica e pode complicar operações que precisem agregar dados entre usuários. Garanta backups e monitoramento do MongoDB.

## Swagger

A documentação Swagger está em: `http://localhost:3000/api-docs` (arquivo `api/swagger-ui/swagger.yaml`).

## Problema comum

- Erro `Cannot find module 'yamljs'`: execute `npm install yamljs` ou rode `npm install` para instalar todas as dependências listadas em `package.json`.

## Testes rápidos (ex.: usando curl no Windows via Git-Bash ou PowerShell)

1) Registrar usuário

```bat
curl -X POST http://localhost:3000/usuario/registro -H "Content-Type: application/json" -d "{\"usuario\":\"joao\",\"senha\":\"123456\",\"email\":\"joao@email.com\",\"nome\":\"João Silva\"}"
```

2) Login

```bat
curl -X POST http://localhost:3000/usuario/login -H "Content-Type: application/json" -d "{\"usuario\":\"joao\",\"senha\":\"123456\"}"
```

3) Usar token retornado para criar um curso

```bat
curl -X POST http://localhost:3000/cursos -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d "{ ...curso... }"
```

(Substitua `<token>` pelo token JWT retornado no login)

## Próximos passos sugeridos

- Ajustar políticas de validação de entrada (ex.: validar campos obrigatórios) e retornar mensagens detalhadas de validação.
- Implementar limite/controle para nomes de banco (evitar caracteres inválidos). Ex.: normalizar `usuario` para `user_<nome>` se preferir.
- Adicionar testes automáticos (Mocha/Jest).

---

Se quiser, posso:
- Rodar `npm install` aqui (se você permitir que eu execute comandos no terminal),
- Adicionar exemplos práticos no Swagger com respostas reais,
- Normalizar o nome do banco adicionando prefixo (ex.: `user_<usuario>`) para evitar conflitos com nomes reservados do MongoDB.

Diga o que prefere que eu faça a seguir.