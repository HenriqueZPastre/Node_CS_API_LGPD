var express = require('express');
var pg = require("pg");

var sw = express();

sw.use(express.json());

sw.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.');
});

sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});

//Configuração POSTGRES

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'Counter_Strike',
    password: 'postgres',
    port: 5432
};

const postgres = new pg.Pool(config);

//Tabela Partida

sw.get('/tb_partida', function (req, res) {

    postgres.connect(function (err, client, done) {

        if (err) {
            console.log("Não conseguiu acessar o BD :" + err);
            res.status(400).send('{' + err + '}');
        } else {

            client.query('SELECT p.codigo, p.jogador_nickname, to_char(p.data_inicio,\'yyyy-mm-dd\') as data_inicio, to_char(p.data_fim,\'yyyy-mm-dd\')as data_fim, p.modo_codigo FROM tb_partida p order by p.codigo asc', function (err, result) {

                done(); 
                if (err) {

                    console.log(err);

                    res.status(400).send('{' + err + '}');

                } else {

                    res.status(200).send(result.rows);
                }

            });
        }
    });
});

//Tabela Round

sw.get('/tb_round', function (req, res) {

    postgres.connect(function (err, client, done) {

        if (err) {
            console.log("Não conseguiu acessar o BD :" + err);
            res.status(400).send('{' + err + '}');
        } else {

            client.query('select r.numero,r.partida_codigo,r.qtd_tentativa, to_char(r.data_inicio, \'yyyy-mm-dd\') as data_inicio,to_char(r.data_fim,\'yyyy-mm-dd\') as data_fim,r.qtd_estrela,r.qtd_assistencia,r.qtd_dinheiro,r.qtd_ponto,r.qtd_morte,r.qtd_vitima,r.status from tb_round r order by r.partida_codigo asc;', function (err, result) {

                done(); 
                if (err) {

                    console.log(err);

                    res.status(400).send('{' + err + '}');

                } else {

                    res.status(200).send(result.rows);
                }

            });
        }
    });
});

//Insert Rounds

sw.post('/insertround', function (req, res, next) {

    postgres.connect(function (err, client, done) {

        if (err) {

            console.log("Nao conseguiu acessar o  BD " + err);
            res.status(400).send('{' + err + '}');
        } else {

            var q = {
                text: 'INSERT INTO tb_round (numero, partida_codigo, qtd_tentativa, data_inicio, data_fim, qtd_estrela, qtd_assistencia, qtd_dinheiro, qtd_ponto, qtd_morte, qtd_vitima, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
                values: [req.body.numero, req.body.partida, req.body.qtd_tentativa, req.body.data_inicio, req.body.data_fim, req.body.qtd_estrela, req.body.qtd_assistencia, req.body.qtd_dinheiro, req.body.qtd_ponto, req.body.qtd_morte, req.body.qtd_vitima, req.body.status]
            }
            console.log(q);

            client.query(q, function (err, result) {
                done(); 
                if (err) {
                    console.log('retornou 400 no insert');
                    console.log(err);
                    console.log(err.data);
                    res.status(400).send('{' + err + '}');
                } else {

                    console.log('retornou 201 no insert');
                    res.sendStatus(201);
                }
            });
        }
    });
});

//Update Rounds

sw.post('/updateround', (req, res) => {

    postgres.connect(function (err, client, done) {
        if (err) {

            console.log("Não conseguiu acessar o BD: " + err);
            res.status(400).send('{' + err + '}');

        } else {

            var q = {
                text: 'UPDATE tb_round SET qtd_tentativa = $3, data_inicio = $4, data_fim = $5, qtd_estrela = $6, qtd_assistencia = $7, qtd_dinheiro = $8, qtd_ponto = $9, qtd_morte = $10, qtd_vitima = $11, status = $12 WHERE ( numero = $1 AND partida_codigo = $2 )',
                values: [req.body.numero, req.body.partida, req.body.qtd_tentativa, req.body.data_inicio, req.body.data_fim, req.body.qtd_estrela, req.body.qtd_assistencia, req.body.qtd_dinheiro, req.body.qtd_ponto, req.body.qtd_morte, req.body.qtd_vitima, req.body.status]
            }
            console.log(q);

            client.query(q, function (err, result) {
                done();
                if (err) {
                    console.log("Erro no updateround: " + err);
                    res.status(400).send('{' + err + '}');
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

//Delete Rounds

sw.get('/deleteround/:numero/:partida_codigo', (req, res) => {

    postgres.connect(function (err, client, done) {
        if (err) {
            console.log("Não conseguiu acessar o serviço deleteround!" + err);
            res.status(400).send('{' + err + '}');
        } else {

            var q = {
                text: 'DELETE FROM tb_round  WHERE (numero = $1 AND partida_codigo = $2)',
                values: [req.params.numero, req.params.partida_codigo]
            }
            console.log(q);

            client.query(q, function (err, result) {
                done(); 
                if (err) {
                    console.log(err);
                    res.status(400).send('{' + err + '}');
                } else {
                    res.status(200).send({ 'numero': req.params.numero });
                }

            });
        }
    });

});