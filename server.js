const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Permite que seu HTML fale com este servidor
app.use(express.json());

app.post('/calcular', (req, res) => {
    try {
        const d = req.body;

        // --- LÓGICA DE PROTEÇÃO DE MARGEM (O SEGREDO) ---
        // Calculando o Custo Total MG (Entrada)
        const baseOperacao = d.valor + d.frete;
        const valorIpi = baseOperacao * (d.ipi / 100);
        
        // Simulação simplificada do imposto de entrada (DIFAL/ST)
        // Aqui vai toda aquela lógica matemática que discutimos
        const custoTotalMG = baseOperacao + valorIpi + (d.impostoEntrada || 0);

        // Markup Divisor para Blindagem
        // À Vista
        const divVista = (1 - (d.simples / 100) - (d.margem / 100) - (d.taxaVista / 100));
        const precoVista = custoTotalMG / divVista;
        const lucroAlvo = precoVista * (d.margem / 100);

        // 12x (Blindado: o lucro em R$ é o mesmo do à vista)
        const div12x = (1 - (d.simples / 100) - (d.taxa12x / 100));
        const preco12x = (custoTotalMG + lucroAlvo) / div12x;

        // Retorna apenas os resultados finais
        res.json({
            sucesso: true,
            precoVista: precoVista,
            preco12x: preco12x,
            lucroReal: lucroAlvo,
            parcela12x: preco12x / 12
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));