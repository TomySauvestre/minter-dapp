let accounts;
/*
// METAMASK CONNECTION
window.addEventListener("DOMContentLoaded", async () => {
  //const welcomeH1 = document.getElementById("welcomeH1");
  const welcomeH2 = document.getElementById("welcomeH2");
  //const welcomeP = document.getElementById("welcomeP");

  //welcomeH1.innerText = welcome_h1;
  welcomeH2.innerText = welcome_h2;
  //welcomeP.innerHTML = welcome_p;

  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    checkChain();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  }

  if (window.web3) {
    // Check if User is already connected by retrieving the accounts
    await window.web3.eth.getAccounts().then(async (addr) => {
      accounts = addr;
    });
  }


  updateConnectStatus();
  if (MetaMaskOnboarding.isMetaMaskInstalled()) {
    window.ethereum.on("accountsChanged", (newAccounts) => {
      accounts = newAccounts;
      updateConnectStatus();
    });
  }
});
const updateConnectStatus = async () => {
  const onboarding = new MetaMaskOnboarding();
  const onboardButton = document.getElementById("connectWallet");
  const notConnected = document.querySelector('.not-connected');
  //const spinner = document.getElementById("spinner");
  if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    onboardButton.innerText = "Install MetaMask !";
    onboardButton.onclick = () => {
      onboardButton.innerText = "Connecting...";
      onboardButton.disabled = true;
      onboarding.startOnboarding();
      // HIDE SPINNER
      //spinner.classList.add('hidden');
      notConnected.classList.remove('hidden');
      notConnected.classList.add('show-not-connected');
    };
  } else if (accounts && accounts.length > 0) {
    onboardButton.innerText = `✔ ...${accounts[0].slice(-4)}`;
    window.address = accounts[0];
    onboardButton.disabled = true;
    onboarding.stopOnboarding();
    notConnected.classList.remove('show-not-connected');
    notConnected.classList.add('hidden');
    // SHOW SPINNER
    //spinner.classList.remove('hidden');
    window.contract = new web3.eth.Contract(abi, contractAddress);
    loadInfo();
  } else {
    onboardButton.innerText = "Connect MetaMask!";
    // HIDE SPINNER
    //spinner.classList.add('hidden');
    notConnected.classList.remove('hidden');
    notConnected.classList.add('show-not-connected');
    onboardButton.onclick = async () => {
      await window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .then(function (accts) {
          onboardButton.innerText = `✔ ...${accts[0].slice(-4)}`;
          notConnected.classList.remove('show-not-connected');
          notConnected.classList.add('hidden');
          // SHOW SPINNER
          //spinner.classList.remove('hidden');
          onboardButton.disabled = true;
          window.address = accts[0];
          accounts = accts;
          window.contract = new web3.eth.Contract(abi, contractAddress);
          loadInfo();
        });
    };
  }
};

async function checkChain() {
  let chainId = 0;
  if(chain === 'rinkeby') {
    chainId = 4;
  } else if(chain === 'polygon') {
    chainId = 137;
  }
  if (window.ethereum.networkVersion !== chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(chainId) }],
      });
      updateConnectStatus();
    } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask.
      if (err.code === 4902) {
        try {
          if(chain === 'rinkeby') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Rinkeby Test Network',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                  rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                },
              ],
            });
          } else if(chain === 'polygon') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Polygon Mainnet',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                  rpcUrls: ['https://polygon-rpc.com/'],
                },
              ],
            });
          }
          updateConnectStatus();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}

async function loadInfo() {
  window.info = await window.contract.methods.getInfo().call();
  const publicMintActive = await contract.methods.mintingActive().call();
  const presaleMintActive = await contract.methods.presaleActive().call();
  const mainHeading = document.getElementById("mainHeading");
  const subHeading = document.getElementById("subHeading");
  const mainText = document.getElementById("mainText");
  const actionButton = document.getElementById("actionButton");
  const mintContainer = document.getElementById("mintContainer");
  const mintButton = document.getElementById("mintButton");
  //const spinner = document.getElementById("spinner");

  let startTime = "";
  if (publicMintActive) {
    mainHeading.innerText = h1_public_mint;
    mainText.innerText = p_public_mint;
    actionButton.classList.add('hidden');
    mintButton.innerText = button_public_mint;
    mintContainer.classList.remove('hidden');
    setTotalPrice();
  } else if (presaleMintActive) {
    startTime = window.info.runtimeConfig.publicMintStart;
    mainHeading.innerText = h1_presale_mint;
    subHeading.innerText = h2_presale_mint;
    
    try {
      // CHECK IF WHITELISTED
      const merkleData = await fetch(
        `/.netlify/functions/merkleProof/?wallet=${window.address}&chain=${chain}&contract=${contractAddress}`
      );
      const merkleJson = await merkleData.json();
      const whitelisted = await contract.methods.isWhitelisted(window.address, merkleJson).call();
      if(!whitelisted) {
        mainText.innerText = p_presale_mint_not_whitelisted;
        actionButton.innerText = button_presale_mint_not_whitelisted;
      } else {
        mainText.innerText = p_presale_mint_whitelisted;
        actionButton.classList.add('hidden');
        mintButton.innerText = button_presale_mint_whitelisted;
        mintContainer.classList.remove('hidden');
      }
    } catch(e) {
      // console.log(e);
      mainText.innerText = p_presale_mint_already_minted;
      actionButton.innerText = button_presale_already_minted;
    }
    setTotalPrice();
  } else {
    startTime = window.info.runtimeConfig.presaleMintStart;
    mainHeading.innerText = h1_presale_coming_soon;
    subHeading.innerText = h2_presale_coming_soon;
    mainText.innerText = p_presale_coming_soon;
    actionButton.innerText = button_presale_coming_soon;
  }

  const clockdiv = document.getElementById("countdown");
  clockdiv.setAttribute("data-date", startTime);
  countdown();

  // HIDE SPINNER
  //spinner.classList.add('hidden');

  // SHOW CARD
  setTimeout(() => {
    const countdownCard = document.querySelector('.countdown');
    countdownCard.classList.add('show-card');
  }, 1000);

  let priceType = '';
  if(chain === 'rinkeby') {
    priceType = 'ETH';
  } else if (chain === 'polygon') {
    priceType = 'MATIC';
  }
  const price = web3.utils.fromWei(info.deploymentConfig.mintPrice, 'ether');
  const pricePerMint = document.getElementById("pricePerMint");
  const maxPerMint = document.getElementById("maxPerMint");
  const totalSupply = document.getElementById("totalSupply");
  const mintInput = document.getElementById("mintInput");
  
  pricePerMint.innerText = `${price} ${priceType}`;
  maxPerMint.innerText = `${info.deploymentConfig.tokensPerMint}`;
  totalSupply.innerText = `${info.deploymentConfig.maxSupply}`;
  mintInput.setAttribute("max", info.deploymentConfig.tokensPerMint);

  // MINT INPUT
  const mintIncrement = document.getElementById("mintIncrement");
  const mintDecrement = document.getElementById("mintDecrement");
  const setQtyMax = document.getElementById("setQtyMax");
  const min = mintInput.attributes.min.value || false;
  const max = mintInput.attributes.max.value || false;
  mintDecrement.onclick = () => {
    let value = parseInt(mintInput.value) - 1 || 1;
    if(!min || value >= min) {
      mintInput.value = value;
      setTotalPrice()
    }
  };
  mintIncrement.onclick = () => {
    let value = parseInt(mintInput.value) + 1 || 1;
    if(!max || value <= max) {
      mintInput.value = value;
      setTotalPrice()
    }
  };
  setQtyMax.onclick = () => {
    mintInput.value = max;
    setTotalPrice()
  };
  mintInput.onchange = () => {
    setTotalPrice()
  };
  mintInput.onkeyup = async (e) => {
    if (e.keyCode === 13) {
      mint();
    }
  };
  mintButton.onclick = mint;
}

function setTotalPrice() {
  const mintInput = document.getElementById("mintInput");
  const mintInputValue = parseInt(mintInput.value);
  const totalPrice = document.getElementById("totalPrice");
  const mintButton = document.getElementById("mintButton");
  if(mintInputValue < 1 || mintInputValue > info.deploymentConfig.tokensPerMint) {
    totalPrice.innerText = 'INVALID QUANTITY';
    mintButton.disabled = true;
    mintInput.disabled = true;
    return;
  }
  const totalPriceWei = BigInt(info.deploymentConfig.mintPrice) * BigInt(mintInputValue);
  
  let priceType = '';
  if(chain === 'rinkeby') {
    priceType = 'ETH';
  } else if (chain === 'polygon') {
    priceType = 'MATIC';
  }
  const price = web3.utils.fromWei(totalPriceWei.toString(), 'ether');
  totalPrice.innerText = `${price} ${priceType}`;
  mintButton.disabled = false;
  mintInput.disabled = false;
}

async function mint() {
  const mintButton = document.getElementById("mintButton");
  mintButton.disabled = true;
  //const spinner = '<div class="dot-elastic"></div><span>Waiting for transaction...</span>';
  //mintButton.innerHTML = spinner;

  const amount = parseInt(document.getElementById("mintInput").value);
  const value = BigInt(info.deploymentConfig.mintPrice) * BigInt(amount);
  const publicMintActive = await contract.methods.mintingActive().call();
  const presaleMintActive = await contract.methods.presaleActive().call();

  if (publicMintActive) {
    // PUBLIC MINT
    try {
      const mintTransaction = await contract.methods
        .mint(amount)
        .send({ from: window.address, value: value.toString() });
      if(mintTransaction) {
        if(chain === 'rinkeby') {
          const url = `https://rinkeby.etherscan.io/tx/${mintTransaction.transactionHash}`;
          const mintedContainer = document.querySelector('.minted-container');
          const countdownContainer = document.querySelector('.countdown');
          const mintedTxnBtn = document.getElementById("mintedTxnBtn");
          mintedTxnBtn.href = url;
          countdownContainer.classList.add('hidden');
          mintedContainer.classList.remove('hidden');
        }
        console.log("Minuted successfully!", `Transaction Hash: ${mintTransaction.transactionHash}`);
      } else {
        const mainText = document.getElementById("mainText");
        mainText.innerText = mint_failed;
        mintButton.innerText = button_public_mint;
        mintButton.disabled = false;

        console.log("Failed to mint!");
      }
    } catch(e) {
      const mainText = document.getElementById("mainText");
      mainText.innerText = mint_failed;
      mintButton.innerText = button_public_mint;
      mintButton.disabled = false;

      console.log(e);
    }
  } else if (presaleMintActive) {
    // PRE-SALE MINTING
    try {
      const merkleData = await fetch(
        `/.netlify/functions/merkleProof/?wallet=${window.address}&chain=${chain}&contract=${contractAddress}`
      );
      const merkleJson = await merkleData.json();
      const presaleMintTransaction = await contract.methods
        .presaleMint(amount, merkleJson)
        .send({ from: window.address, value: value.toString() });
      if(presaleMintTransaction) {
        if(chain === 'rinkeby') {
          const url = `https://rinkeby.etherscan.io/tx/${presaleMintTransaction.transactionHash}`;
          const mintedContainer = document.querySelector('.minted-container');
          const countdownContainer = document.querySelector('.countdown');
          const mintedTxnBtn = document.getElementById("mintedTxnBtn");
          mintedTxnBtn.href = url;
          countdownContainer.classList.add('hidden');
          mintedContainer.classList.remove('hidden');
        }
        console.log("Minuted successfully!", `Transaction Hash: ${presaleMintTransaction.transactionHash}`);
      } else {
        const mainText = document.getElementById("mainText");
        mainText.innerText = mint_failed;
        mintButton.innerText = button_presale_mint_whitelisted;
        mintButton.disabled = false;

        console.log("Failed to mint!");
      }
    } catch(e) {
      const mainText = document.getElementById("mainText");
      mainText.innerText = mint_failed;
      mintButton.innerText = button_presale_mint_whitelisted;
      mintButton.disabled = false;

      // console.log(e);
    }
  }
}*/


var img = [];
img[0] = "../images/x-icon/img1.png";
img[1] = "../images/x-icon/img2.png";
img[2] = "../images/x-icon/img3.png";
img[3] = "../images/x-icon/img4.png";
img[4] = "../images/x-icon/img5.png";
img[5] = "../images/x-icon/img6.png";
img[6] = "../images/x-icon/img7.png";
img[7] = "../images/x-icon/img8.png";
var i = 0;
var timer = 800;

function changeImage(){
  document.diapo.src = img[i];
  if (i < 7)
  {
    i++;
  }
  else
  {
    i = 0;
  }
  setTimeout("changeImage()", timer);
}
window.onload = changeImage;


/* CAROUSEL */
const slider = document.querySelector('.slider');
const carousel = document.querySelector('.carousel');

const next = document.querySelector('#arrow');

var direction;

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

change();

function change() {
  direction = -1;
  carousel.style.justifyContent = 'flex-start';
  slider.style.transform = 'translate(-20%)';
  setTimeout(change, 4000);
}

next.addEventListener('click', function() {
  direction = -1;
  carousel.style.justifyContent = 'flex-start';
  slider.style.transform = 'translate(-20%)';
});



slider.addEventListener('transitionend', function() {
  if (direction === -1) {
    slider.appendChild(slider.firstElementChild);
  }
  else if (direction === 1){
    slider.prepend(slider.lastElementChild);
  }

  slider.style.transition = 'none';
  slider.style.transform = 'translate(0)';
  setTimeout(function() {
    slider.style.transition = 'all 0.5s';
  })
})




const arrow = document.querySelector('#arrow');

arrow.addEventListener("mouseenter", ()=> {
  arrow.src = "../images/x-icon/arrow_red.png";
})

arrow.addEventListener("mouseout", ()=> {
  arrow.src = "../images/x-icon/arrow.png";
})


/*
const opensea = document.querySelector('#opensea');

opensea.addEventListener("mouseenter", ()=> {
  opensea.src = "../images/header/opensea_red.png";
  opensea.style.width = "2.5vw";
})

opensea.addEventListener("mouseout", ()=> {
  opensea.src = "../images/header/opensea.png";
  opensea.style.width = "2vw";
})
MODIFIER*/



const twitter = document.querySelector('#twitter');

twitter.addEventListener("mouseenter", ()=> {
  twitter.src = "../images/header/twitter_red.png";
  twitter.style.width = "2.5vw";
})

twitter.addEventListener("mouseout", ()=> {
  twitter.src = "../images/header/twitter.png";
  twitter.style.width = "2vw";
})





const discord = document.querySelector('#discord');

discord.addEventListener("mouseenter", ()=> {
  discord.src = "../images/header/discord_red.png";
  discord.style.width = "2.5vw"
})

discord.addEventListener("mouseout", ()=> {
  discord.src = "../images/header/discord.png";
  discord.style.width = "2vw";
})

/* MODIIFER 
const wallet_btn = document.querySelector('.wallet-btn');

wallet_btn.addEventListener("mouseenter", () => {
  wallet_btn.style.color = "white";
  wallet_btn.style.background  = "#9d0012";
})

wallet_btn.addEventListener("mouseout", () => {
  wallet_btn.style.color = "#9d0012";
  wallet_btn.style.background  = "white";
})MODIFIER*/


const jDiscord = document.querySelector('.jDiscord');
const jTwitter = document.querySelector('.jTwitter');

jDiscord.addEventListener("mouseenter", () => {
  jDiscord.style.color = "white";
  jDiscord.style.background  = "#9d0012";
})

jDiscord.addEventListener("mouseout", () => {
  jDiscord.style.color = "#9d0012";
  jDiscord.style.background  = "white";
})


jTwitter.addEventListener("mouseenter", () => {
  jTwitter.style.color = "white";
  jTwitter.style.background  = "#9d0012";
})

jTwitter.addEventListener("mouseout", () => {
  jTwitter.style.color = "#9d0012";
  jTwitter.style.background  = "white";
})

/*
const actionBTN = document.querySelector('#actionButton');

actionBTN.addEventListener("mouseenter", () => {
  actionBTN.style.color = "white";
  actionBTN.style.background  = "#9d0012";
})

actionBTN.addEventListener("mouseout", () => {
  actionBTN.style.color = "#9d0012";
  actionBTN.style.background  = "white";
})

const mintBTN = document.querySelector('.mint-btn');

mintBTN.addEventListener("mouseenter", () => {
  mintBTN.style.color = "white";
  mintBTN.style.background  = "#9d0012";
})

mintBTN.addEventListener("mouseout", () => {
  mintBTN.style.color = "#9d0012";
  mintBTN.style.background  = "white";
})MODIFIER*/


const allCross = document.querySelectorAll('.visible-panel img');

allCross.forEach(element => {
  element.addEventListener('click', function(){

    const height = this.parentNode.parentNode.childNodes[3].scrollHeight;
    const currentChoice = this.parentNode.parentNode.childNodes[3];

    if (this.src.includes('plus')){
      this.src = '../images/x-icon/less.png';
      gsap.to(currentChoice, {duration: 0.2, height: height + 40, opacity: 1, padding: '20px 15px'})
    } else if (this.src.includes('less')){
      this.src = '../images/x-icon/plus.png';
      gsap.to(currentChoice, {duration: 0.2, height: 0, opacity: 0, padding: '0px 15px'})
    }
  })
})


/*


const d1 = document.querySelector('#d1');
const d2 = document.querySelector('#d2');
const d3 = document.querySelector('#d3');
const d4 = document.querySelector('#d4');
const more1 = document.querySelector('#more1');
const more2 = document.querySelector('#more2');
const more3 = document.querySelector('#more3');
const more4 = document.querySelector('#more4');

const close1 = document.querySelector('#close1');
const close2 = document.querySelector('#close2');
const close3 = document.querySelector('#close3');
const close4 = document.querySelector('#close4');

more1.addEventListener("mouseenter", () => {
  more1.style.color = "#ec001c";
})

more1.addEventListener("mouseout", () => {
  more1.style.color = "#9d0012";
})

more2.addEventListener("mouseenter", () => {
  more2.style.color = "#ec001c";
})

more2.addEventListener("mouseout", () => {
  more2.style.color = "#9d0012";
})

more3.addEventListener("mouseenter", () => {
  more3.style.color = "#ec001c";
})

more3.addEventListener("mouseout", () => {
  more3.style.color = "#9d0012";
})

more4.addEventListener("mouseenter", () => {
  more4.style.color = "##ec001c";
})

more4.addEventListener("mouseout", () => {
  more4.style.color = "#9d0012";
})



more1.addEventListener('click', function() {
  d1.style.opacity = 1;
  more1.style.opacity = 0;
  more1.style.zIndex = -2;
  close1.style.opacity = 1;
  close1.style.zIndex = 2;
})

more2.addEventListener('click', function() {
  d2.style.opacity = 1;
  more2.style.opacity = 0;
  more2.style.zIndex = -2;
  close2.style.opacity = 1;
  close2.style.zIndex = 2;
})

more3.addEventListener('click', function() {
  d3.style.opacity = 1;
  more3.style.opacity = 0;
  more3.style.zIndex = -2;
  close3.style.opacity = 1;
  close3.style.zIndex = 2;
})

more4.addEventListener('click', function() {
  d4.style.opacity = 1;
  more4.style.opacity = 0;
  more4.style.zIndex = -2;
  close4.style.opacity = 1;
  close4.style.zIndex = 2;
})





close1.addEventListener('click', function() {
  d1.style.opacity = 0;
  more1.style.opacity = 1;
  more1.style.zIndex = 2;
  close1.style.opacity = 0;
  close1.style.zIndex = -2;
})

close2.addEventListener('click', function() {
  d2.style.opacity = 0;
  more2.style.opacity = 1;
  more2.style.zIndex = 2;
  close2.style.opacity = 0;
  close2.style.zIndex = -2;
})

close3.addEventListener('click', function() {
  d3.style.opacity = 0;
  more3.style.opacity = 1;
  more3.style.zIndex = 2;
  close3.style.opacity = 0;
  close3.style.zIndex = -2;
})

close4.addEventListener('click', function() {
  d4.style.opacity = 0;
  more4.style.opacity = 1;
  more4.style.zIndex = 2;
  close4.style.opacity = 0;
  close4.style.zIndex = -2;
})



close1.addEventListener("mouseenter", () => {
  close1.style.color = "#ec001c";
})

close1.addEventListener("mouseout", () => {
  close1.style.color = "#9d0012";
})

close2.addEventListener("mouseenter", () => {
  close2.style.color = "#ec001c";
})

close2.addEventListener("mouseout", () => {
  close2.style.color = "#9d0012";
})


close3.addEventListener("mouseenter", () => {
  close3.style.color = "#ec001c";
})

close3.addEventListener("mouseout", () => {
  close3.style.color = "#9d0012";
})


close4.addEventListener("mouseenter", () => {
  close4.style.color = "#ec001c";
})

close4.addEventListener("mouseout", () => {
  close4.style.color = "#9d0012";
})

*/