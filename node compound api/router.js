const Web3 = require('web3');
const Router = require('@koa/router');
const config = require('./config1.json');
const router = new Router();

const web3 = new Web3(process.env.INFURA_URL);
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const adminAddress = web3.eth.accounts.wallet[0].address;
// let from = web3.toChecksumAddress(adminAddress);
// const cTokens = {
//     cBat: new web3.eth.Contract(config.cTokenAbi,config.cBatAddress),
//     cDai: new web3.eth.Contract(config.cTokenAbi,config.cDaiAddress)
// }

const cTokens = {
    cBat: new web3.eth.Contract(config.cBatAbi,config.cBatAddress),
    cDai: new web3.eth.Contract(config.cDaiAbi,config.cDaiAddress)
}

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
        const a = ctokenBalance*10;
        const b = a.toString();
        const balance = web3.utils.fromWei(b,'gwei');
        
        ctx.body = {
            cToken: ctx.params.cToken,
            address : ctx.params.address,
            balance
        }
    }catch(e){
        console.log(e);
        ctx.state = 500;
        ctx.body = {
            error:'internal server error'
        }
    }
})



router.post('/mint/:cToken/:amount', async ctx =>{
    const cToken = cTokens[ctx.params.cToken];
    if(typeof cToken === 'undefined'){
        ctx.status = 400;
        ctx.body = {
            error:`cToken ${ctx.params.cToken} does not exist`
        };
        return;
    }

    const tokenAddress = await cToken
    .methods
    .underlying()
    .call(); 
  
    const token = new web3.eth.Contract(
        config.ERC20Abi,
        tokenAddress
    )
   
    await token
    .methods
    .approve(cToken.options.address,ctx.params.amount)
    .send({from :adminAddress});

    try{
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await cToken.methods.myMethod().estimateGas({ from: account });  

        await cToken
        .methods
        .mint(ctx.params.amount)
        .send({from:from ,gasPrice: gasPrice ,gas: gasEstimate });
     
        // const balance = web3.utils.fromWei(ctokenBalance,'ether');
        
        ctx.body = {
            cToken: ctx.params.cToken,
            address : adminAddress,
            amountMinted : ctx.params.amount
        }
    }catch(e){
        console.log(e);
        ctx.state = 500;
        ctx.body = {
            error:'internal server error'
        }
    }
})

router.post('/redeem/:cToken/:amount', async ctx =>{
    const cToken = cTokens[ctx.params.cToken];
    if(typeof cToken === 'undefined'){
        ctx.status = 400;
        ctx.body = {
            error:`cToken ${ctx.params.cToken} does not exist`
        };
        return;
    }

    try{
        await cToken
        .methods
        .redeem(ctx.params.amount)
        .send({from:adminAddress});
        
        // const balance = web3.utils.fromWei(ctokenBalance,'ether');
        
        ctx.body = {
            cToken: ctx.params.cToken,
            address : adminAddress,
            amountRedeemed : ctx.params.amount
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