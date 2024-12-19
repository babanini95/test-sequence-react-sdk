import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { sequence } from '0xsequence'
import { toHexString } from './helpers'
import { ConnectOptions } from '0xsequence/dist/declarations/src/provider'
import { ChainId } from '@0xsequence/network'
import { Button } from '@0xsequence/design-system'
import './App.css'

const PROJECT_ACCESS_KEY = 'AQAAAAAAAKBmEu5Hfm-YJREu8IRIkJthHgY'
const defaultChainId = ChainId.SEPOLIA
const walletAppURL = 'https://sequence.app'

sequence.initWallet(PROJECT_ACCESS_KEY, { defaultNetwork: defaultChainId, transports: { walletAppURL } })

function App() {
  const wallet = sequence.getWallet().getProvider()
  const [inputAmount, setInputIngameToken] = useState(0)
  const [ingameTokenAmount, setIngameToken] = useState(0)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false)

  useEffect(() => {
    setIsWalletConnected(wallet.isConnected())
  }, [wallet])

  const defaultConnectOptions: ConnectOptions = {
    app: 'Test Sequence SDK',
    askForEmail: true
    // keepWalletOpened: true,
  }

  const connect = async (connectOptions: ConnectOptions = { app: 'Test Sequence SDK' }) => {
    if (isWalletConnected) {
      console.log('Wallet already connected!')
      return
    }

    connectOptions = {
      ...defaultConnectOptions,
      ...connectOptions,
      settings: {
        ...defaultConnectOptions.settings,
        ...connectOptions.settings
      }
    }

    try {
      console.log('Connecting')
      const wallet = sequence.getWallet()

      const connectDetails = await wallet.connect(connectOptions)

      
      if (connectDetails.connected) {
        console.log(`Wallet connected!\nshared email: ${connectDetails.email}`)
        setIsWalletConnected(true)
      } else {
        console.log('Failed to connect wallet - ' + connectDetails.error)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const disconnect = () => {
    const wallet = sequence.getWallet()
    wallet.disconnect()
    setIsWalletConnected(false)
  }

  const openWallet = () => {
    const wallet = sequence.getWallet()
    wallet.openWallet()
  }

  const closeWallet = () => {
    const wallet = sequence.getWallet()
    wallet.closeWallet()
  }

  const convertToken = async (signer?: sequence.provider.SequenceSigner) => {
    try{
      const wallet = sequence.getWallet()
      signer = signer || wallet.getSigner() // select DefaultChain signer by default
      const contractInterface = new ethers.Interface(['function claimToken(uint256 amountToken)']);
      const amountTokenConvert = ethers.parseUnits(String(ingameTokenAmount), 18)
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
      <Button label="Connect" onClick={() => connect(
        {
          app: 'Test Sequence SDK',
          authorize: true,
          settings: {
            signInOptions: ['email'],
            theme: 'dark',
            bannerUrl: `https://dummyimage.com/600x400/000/fff.png&text=test`,
            bannerSize: 'medium',
            defaultFundingCurrency: 'eth'
          }
        }
      )}/>
      <Button label='Disconnect' disabled={!isWalletConnected} onClick={() => disconnect()}/>
      <Button label='Open Wallet' disabled={!isWalletConnected} onClick={() => openWallet()}/>
      <Button label='Close Wallet' disabled={!isWalletConnected} onClick={() => closeWallet()}/>
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
        <button onClick={() => {
          setIngameToken(ingameTokenAmount + inputAmount)
          setInputIngameToken(0)
          }}>
          Add Ingame Token
        </button>
      </label>
      {ingameTokenAmount > 0 &&
        <p>Ingame Token: {ingameTokenAmount}</p>
      }
      {ingameTokenAmount > 0 &&
        <Button label='Convert' disabled={!isWalletConnected} onClick={() => convertToken()}/>
      }
      </div>
      <p className="read-the-docs">
        WARNING!! Because there is no backend system yet, the Ingame Token will reset every time the page is refreshed.
      </p>
    </>
  )
}

export default App
