import {React, useState, useEffect} from 'react'
import {ethers} from 'ethers'
import styles from './Bank.module.css'
import simple_token_abi from './Contracts/business_app_abi.json'
//import Interactions from './Interactions';

const BankApp = () => {

	// deploy simple token contract and paste deployed contract address here. This value is local ganache chain
	let contractAddress = '0xB70b96c4f045B2f05B51928793041B7E74ff4542';
	//let contractAddress = '0xD23405e03d9ca430c4F57198f92aDe8c853183e5';

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState("unreachable.Please connect to Metamask");

	const [connButtonText, setConnButtonText] = useState('Connect Wallet');

	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const [transferHash, setTransferHash] = useState(null);
	const [checkAcc, setCheckAcc] = useState("false");
	const [accStatus, setAccStatus]= useState("");
	const [ownerAddress, setOwnerAddress]= useState("Unreachable.Please connect to Metamask");
	const [price, setPrice]= useState("Unreachable.Please connect to Metamask");
	


	const connectWalletHandler = () => {
		if (window.ethereum && window.ethereum.isMetaMask) {

			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
				accountChangedHandler(result[0]);
				setConnButtonText('Wallet Connected');
				
			})
			.catch(error => {
				setErrorMessage(error.message);
			
			});

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	// update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();		
	}
	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}

	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);

	const updateEthers = () => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new ethers.Contract(contractAddress, simple_token_abi, tempSigner);

		console.log("cont:"+tempContract.address);
		setContract(tempContract);	
	}


	const Buy = async()=>{
		///e.preventDefault();
		if(defaultAccount.toLowerCase()!==ownerAddress.toLowerCase())
		{
			let txt = await contract.buy({value: ethers.utils.parseUnits(price, "ether") });
			console.log(txt);
		}
		else{
			alert("The contract already belongs to you.")
		}
		
	}
	const ContractDetails = async()=>{
		console.log("cont:"+contract.address);

		let txt= await contract.businessOwner();
		let price= await contract.price();
		console.log(defaultAccount);
		console.log(txt);

		setOwnerAddress(''+txt);
		setPrice(''+price);
		
	}

	const SetPrice = async(e)=>{
		if(defaultAccount.toLowerCase()===ownerAddress.toLowerCase())
		{
			e.preventDefault();
		let setPrice = e.target.setPrice.value;
		
		let txt = await contract.setPrice(setPrice);
		}
		else{
			e.preventDefault();

			alert("Only owner can perform this action.")
		}
		
	}
	const transferHandler = async (e) => {
		if(defaultAccount.toLowerCase()===ownerAddress.toLowerCase())
		{
		e.preventDefault();
		let recieverAddress = e.target.recieverAddress.value;
		let txt = await contract.transfer(recieverAddress);
		setTransferHash("Transfer confirmation hash: " + txt.hash);
		}
		else{
			e.preventDefault();

			alert("Only owner can perform this action.")
		}	
	}


	return (
	<div >
		<h2> Business Contract </h2>
		<h2> Your address is {defaultAccount} </h2>

		<button className={styles.button6} onClick={connectWalletHandler}>{connButtonText}</button>

		<div  className={styles.walletCard}>
        <div>
			 <h3>Business Owner: {ownerAddress} </h3>
		</div>
		<div>
			<h3>Price: {price}</h3>
		</div>
		
		
		<div style={{ display: 'flex', justifyContent: 'center' }}>
		<button className={styles.button6} onClick={ContractDetails}>Contract Details</button>
		</div>

		

		</div>
		<div style={{ padding: 20}}>

		</div>

		<div className={styles.walletCard}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
			 <h3>Only User Actions </h3>
		</div>
		
		<div style={{ display: 'flex', justifyContent: 'center' }}>
		<button className={styles.button6} onClick={Buy}>Purchase</button>
		</div>
        </div>

		<div style={{ padding: 20}}>

		</div>
		
		<div  className={styles.interactionsCard}>
		
				<form onSubmit={transferHandler}>
					<h3> Only Owner Actions </h3>
						<p> Reciever Address </p>
						<input type='text' id='recieverAddress' className={styles.addressInput}/>

						

						<button type='submit' className={styles.button6}>Transfer</button>
						<div>
							{transferHash}
						</div>
			</form>
			<form onSubmit={SetPrice}>
						<p> Set Price </p>
						<input type='number' id='setPrice' min='0' step='1'/>
						<button type='submit' className={styles.button6}>Set</button>

			</form>
			</div>

	</div>
	)
}

export default BankApp;