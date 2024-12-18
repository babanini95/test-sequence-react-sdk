import { useState } from 'react'
import { ethers } from 'ethers'
import { sequence } from '0xsequence'
import { toHexString } from './helpers'
import './App.css'

function App() {
  const [inputAmount, setInputIngameToken] = useState(0)
  const [ingameTokenAmount, setIngameToken] = useState(0)

  const convertToken = async (signer?: sequence.provider.SequenceSigner) => {
    try{
      const wallet = sequence.getWallet()
      signer = signer || wallet.getSigner() // select DefaultChain signer by default
      const contractInterface = new ethers.Interface(['function claimToken(uint256 amountToken)']);
      const amountTokenConvert = ethers.parseUnits('1', 18)
      const transactionData = contractInterface.encodeFunctionData('claimToken', [toHexString(amountTokenConvert)])
      const contractAddress = '0x5F5A4a3265b11Ac296Da9B661901D39ACF6217bA'      
      const transaction: sequence.transactions.Transaction = {
        delegateCall: false,
        revertOnError: false,
        gasLimit: '0x55555',
        to: contractAddress,
        value: 0,
        data: transactionData
      }

      const txnResponse = await signer.sendTransaction(transaction)
      setIngameToken(0)
      console.log(`txnResponse: ${JSON.stringify(txnResponse)}`)
      console.log(`ingame token: ${ingameTokenAmount}`)
    }
    catch(e){
      console.error(e)
    }
  }

  return (
    <>
      <h1>Test Sequence SDK</h1>
      <div className="card">
        <label>
        Ingame Token:
        <input
          value={inputAmount}
          onChange={e => {
            setInputIngameToken(e.target.valueAsNumber)           
            if (e.target.valueAsNumber < 0)
              setInputIngameToken(0) 
          }}
          type="number"
        />
        <button onClick={() => setIngameToken(ingameTokenAmount + inputAmount)}>
          Add Ingame Token
        </button>
      </label>
      {ingameTokenAmount > 0 &&
        <p>Ingame Token: {ingameTokenAmount}</p> /* &&
        <button onClick={() => setIngameToken(ingameTokenAmount + 10)}>
          Add 10 years
        </button> */
      }
      {ingameTokenAmount > 0 &&
        // <p>Ingame Token: {ingameTokenAmount}</p> &&
        <button onClick={() => setIngameToken(ingameTokenAmount + 10)}>
          Add 10 years
        </button>
      }
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
