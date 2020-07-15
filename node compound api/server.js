require('dotenv').config();
const Koa = require('koa');
const app = new Koa();
const router = require('./router.js');
app.use(router.routes());

app.listen(3000,()=>{
    console.log('the server is up and running on post 3000');
});

