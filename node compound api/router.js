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


router.get('/tokenBalance/:cToken', async ctx =>{
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
        .balanceOf(adminAddress)
        .call();
        const a = ctokenBalance*10;
        const b = a.toString();
        const balance = web3.utils.fromWei(b,'gwei');
        
        ctx.body = {
            cToken: ctx.params.cToken,
            address : adminAddress,
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
   
    const tx1 = token.methods.approve(cToken.options.address,ctx.params.amount);
    const gas1 = await tx1.estimateGas({from: adminAddress});
    const gasPrice1 = await web3.eth.getGasPrice();
    const data1 = tx1.encodeABI();
    const nonce1 = await web3.eth.getTransactionCount(adminAddress);

    const signedTx1 = await web3.eth.accounts.signTransaction(
        {
           to: token.options.address, 
           data1,
           gas1,
           gasPrice1,
           nonce1, 
           chainId: 42
           },
           process.env.PRIVATE_KEY
         );

        
    await web3.eth.sendSignedTransaction(signedTx1.rawTransaction);
    // await token
    // .methods
    // .approve(cToken.options.address,ctx.params.amount)
    // .send({from :adminAddress ,gas:});

    try{
        
    const tx = cToken.methods.mint(ctx.params.amount);
    const gas = await tx.estimateGas({from: adminAddress});
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(adminAddress);

    const signedTx = await web3.eth.accounts.signTransaction(
        {
           to: cToken.options.address, 
           data,
           gas:'30000',
           gasPrice:'30000',
           nonce, 
           chainId: 42
           },
           process.env.PRIVATE_KEY
         );
    
       await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
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

    const tx = cToken.methods.redeem(ctx.params.amount);
    const gas = await tx.estimateGas({from: adminAddress});
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(adminAddress);

    try{

    const signedTx = await web3.eth.accounts.signTransaction(
    {
       to: cToken.options.address, 
       data,
       gas,
       gasPrice,
       nonce, 
       chainId: 42
       },
       process.env.PRIVATE_KEY
     );

  
     await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    //  console.log(`Transaction hash: ${receipt.transactionHash}`);
        // await cToken
        // .methods
        // .redeem(ctx.params.amount)
        // .send({from:adminAddress});
        
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