import express from "express";
import usuarios from "./usuarios.js";
import servicos from "./services.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";





dotenv.config();


const  secret_key = process.env.secret_key;

const app = express();
app.use(express.json());
app.get("/usuarios", (req, res) => {
    res.json(usuarios);
});



app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
        const token = jwt.sign({ id: usuario.id, nome: usuario.nome, elevation: usuario.elevation }, secret_key, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ message: "Credenciais inválidas" });
    }
});


app.get("/servicos/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, secret_key);
        const servico = req.params.id ? servicos.find(s => s.id === parseInt(req.params.id)) : null;
        if (servico) {
            res.json(servico);
        } else {
            res.status(404).json({ message: "Serviço não encontrado" });
        }
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
});

app.get("/cadastros/:id", (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Token não fornecido"
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, secret_key);

        if (decoded.elevation !== "admin") {
            return res.status(403).json({
                message: "Acesso negado"
            });
        }

        const cadastro = usuarios.find(
            u => u.id === Number(req.params.id)
        );

        if (!cadastro) {
            return res.status(404).json({
                message: "Cadastro não encontrado"
            });
        }

        return res.json(cadastro);

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido"
        });
    }
});



app.use((req, res) => {
    res.status(404).sendFile("C:\\Users\\jean.fsilva6\\Documents\\Auth-Jean\\404.html");
});

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Servidor rodando na porta " + port);
});