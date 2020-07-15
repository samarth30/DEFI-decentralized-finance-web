const Web3 = require('web3');
const Router = require('@koa/router');
const config = require('./config.json');
const router = new Router();

const web3 = new Web3(process.env.INFURA_URL);
const cTokens = {
    cBat: new web3.eth.Contract(config.cTokenAbi,config.cBatAddress),
    cDai: new web3.eth.Contract(config.cTokenAbi,config.cDaiAddress)
}

// const cTokens = {
//     cBat: new web3.eth.Contract(config.cBatAbi,config.cBatAddress),
//     cDai: new web3.eth.Contract(config.cDaiAbi,config.cDaiAddress)
// }

// router.get('/tokenBalance/:cToken/:address', async ctx =>{
//     const cToken = cTokens[ctx.params.cToken];
//     if(typeof cToken === 'undefined'){
//         ctx.status = 400;
//         ctx.body = {
//             error:`cToken ${ctx.params.cToken} does not exist`
//         };
//         return;
//     }

//     try{
//         const tokenBalance = await cToken
//         .methods
//         .balanceOfUnderlying(ctx.params.address)
//         .call();
        
//         const balance = web3.utils.fromWei(tokenBalance,'ether');
        
//         ctx.body = {
//             cToken: ctx.params.cToken,
//             address : ctx.params.address,
//             balance
//         }
//     }catch(e){
//         console.log(e);
//         ctx.state = 500;
//         ctx.body = {
//             error:'internal server error'
//         }
//     }
// })


router.get('/tokenBalance/:cToken/:address', async ctx =>{
    const cToken = cTokens[ctx.params.cToken];
    if(typeof cToken === 'undefined'){
        ctx.status = 400;
        ctx.body = {
            error:`cToken ${ctx.params.cToken} does not exist`
        };
        return;
    }

    try{
        const ctokenBalance = await cToken
        .methods
        .balanceOf(ctx.params.address)
        .call();
        
        // const balance = web3.utils.fromWei(ctokenBalance,'ether');
        
        ctx.body = {
            cToken: ctx.params.cToken,
            address : ctx.params.address,
            ctokenBalance
        }
    }catch(e){
        console.log(e);
        ctx.state = 500;
        ctx.body = {
            error:'internal server error'
        }
    }
})


router.get('/',ctx => {
    ctx.body = 'hello world';
});


module.exports = router;