const express = require('express');
const app = express();

const parseToJS = require('xml2js').parseString;

const Pagseguro = require('pagseguro');
const bodyParser = require('body-parser');
const request = require('request-promise');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dados = {
    email: 'edsonbruno415@gmail.com',
    token: '80F92235A8B44D34AF1510422FEF61D4',
    mode: 'sandbox'
}

app.get('/', (req, res) => {
    res.send('pagseguro');
});

app.get('/pagar', (req, res) => {
    const pagseguro = new Pagseguro(dados);

    pagseguro.currency('BRL');
    pagseguro.reference('55555');
    pagseguro.addItem({
        id: 1,
        description: 'Bola Quadrada',
        amount: '12.00',
        quantity: 4,
        weight: 1
    });
    pagseguro.setRedirectURL('http://localhost/pagok');
    pagseguro.setNotificationURL('http://localhost/notify');
    pagseguro.send((err, pags) => {
        parseToJS(pags, (err, result) => {
            const codeCheckout = result.checkout.code;
            const url = `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${codeCheckout}`;
            res.redirect(url);
        });
    });
});

app.post('/notify', async (req, res) => {
    const notification = req.body.notificationCode;
    const payment = await request({
        url: `https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/${notification}?email=${dados.email}&token=${dados.token}`,
        method: 'get'
    });
    const paymentObj = parseToJS(payment, (err, result)=>{
        const strObj = JSON.stringify(result, null, ' ');
        console.log(strObj);
    });
    res.send('OK');
});

app.listen(80, () => console.log('running...'));