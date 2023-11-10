import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import InfoCard from './InfoCard'
import Swal from 'sweetalert2'

import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import daiAbi from '../../context/abis/TestDAI.v2.sol/NofTestDAIV2.json'
import gammaPacksAbi from '../../context/abis/GammaPacks.v2.sol/NofGammaPacksV2.json'
import gammaCardsAbi from '../../context/abis/GammaCards.v2.sol/NofGammaCardsV2.json'

import InventoryAlbum from './InventoryAlbum'
import GammaAlbum from './GammaAlbum'
import GammaPack from './GammaPack'
import { fetchPackData } from '../../services/backend/gamma'
import { checkPacksByUser, openPack, getPackPrice } from '../../services/contracts/gamma'
import { CONTRACTS, NETWORK } from '../../config'
import { showRules, closeRules } from '../../utils/rules'
import { checkApproved } from '../../services/contracts/dai'
import {useTranslation} from 'next-i18next'

const index = React.forwardRef(() => {
  const {t} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState(null)
  const [noMetamaskError, setNoMetamaskError] = useState('')
  const [, setChainId] = useState(null)
  const [packsContract, setPacksContract] = useState(null)
  const [cardsContract, setCardsContract] = useState(null)
  const [daiContract, setDaiContract] = useState(null)
  const [openPackCardsNumbers, setOpenPackCardsNumbers] = useState([])
  const [numberOfPacks, setNumberOfPacks] = useState('0')
  const [openPackage, setOpenPackage] = useState(false)
  const [cardInfo, setCardInfo] = useState(false)
  const [imageNumber, setImageNumber] = useState(0)
  const [mobile, setMobile] = useState(false)
  const [, setSize] = useState(false)
  const [inventory, setInventory] = useState(true)
  const [packIsOpen, setPackIsOpen] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 600) {
      setMobile(true)
      setSize(true)
    } else {
      setMobile(false)
      setSize(false)
    }
    const updateMedia = () => {
      if (window.innerWidth < 600) {
        setMobile(true)
        setSize(true)
      } else {
        setMobile(false)
        setSize(false)
      }
    }
    window.addEventListener('resize', updateMedia)
    return () => window.removeEventListener('resize', updateMedia)
  }, [])

  const checkNumberOfPacks = async () => {
    try {
      const numberOfPacks = await checkPacksByUser(account, packsContract)
      setNumberOfPacks(numberOfPacks?.length.toString() || '0')
    } catch (e) {
      console.error({ e })
    }
  }

  useEffect(() => {
    checkNumberOfPacks()
  }, [account, packsContract]) //eslint-disable-line react-hooks/exhaustive-deps

  const authorizeDaiContract = async () => {
    const authorization = await daiContract.approve(
      CONTRACTS.gammaPackAddress,
      ethers.constants.MaxUint256,
      { gasLimit: 2500000 }
    )
    await authorization.wait()
    return authorization
  }

  async function requestAccount () {
    const web3Modal = new Web3Modal()
    let provider
    let address
    try {
      const connection = await web3Modal.connect()
      provider = new ethers.providers.Web3Provider(connection)
      address = await provider.getSigner().getAddress()
      setAccount(address)
    } catch (e) {
      console.error({ e })
    }

    if (!provider) return
    const chain = (await provider.getNetwork()).chainId
    setChainId(decToHex(chain))
    switchOrCreateNetwork(
      NETWORK.chainId,
      NETWORK.chainName,
      NETWORK.ChainRpcUrl,
      NETWORK.chainCurrency,
      NETWORK.chainExplorerUrl
    );
    return [provider, address]
  }

  function connectToMetamask () {
    if (window.ethereum !== undefined) {
      setNoMetamaskError('')
      requestAccount().then((data) => {
        const [provider] = data
        const signer = provider.getSigner()
        const gammaPacksContractInstance = new ethers.Contract(
          CONTRACTS.gammaPackAddress,
          gammaPacksAbi.abi,
          signer
        )
        setPacksContract(gammaPacksContractInstance)
        const gammaCardsContractInstance = new ethers.Contract(
          CONTRACTS.gammaCardsAddress,
          gammaCardsAbi.abi,
          signer
        )
        setCardsContract(gammaCardsContractInstance)
        const daiContractInstance = new ethers.Contract(
          CONTRACTS.daiAddress,
          daiAbi.abi,
          signer
        )
        setDaiContract(daiContractInstance)
      })
        .catch(e => {
          console.error({ e })
        })
    } else {
      setNoMetamaskError('Por favor instala Metamask para continuar.')
    }
  }

  function decToHex (number) {
    return `0x${parseInt(number).toString(16)}`
  }

  async function switchOrCreateNetwork (
    chainIdHex,
    chainName,
    rpcUrl,
    currency,
    explorer
  ) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      })
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName,
                rpcUrls: [rpcUrl],
                nativeCurrency: {
                  name: currency,
                  symbol: currency,
                  decimals: 18
                },
                blockExplorerUrls: [explorer]
              }
            ]
          })
        } catch (e) {
          console.error(e.message)
        }
      }
    }
  }

  useEffect(() => {
    if (window && window.ethereum !== undefined) {
      window.ethereum.on('accountsChanged', () => {
        connectToMetamask()
      })

      window.ethereum.on('chainChanged', newChain => {
        setChainId(decToHex(newChain))
        connectToMetamask()
      })
    }
  }, []) //eslint-disable-line react-hooks/exhaustive-deps
  const [loaderPack, setLoaderPack] = useState(false)

  function emitError (message) {
    Swal.fire({
      title: '',
      text: message,
      icon: 'error',
      showConfirmButton: true,
      timer: 5000
    })
  }

  // funcion para abrir uno a uno los sobres disponibles
  const openAvailablePack = async () => {
    try {
      // llama al contrato para ver cantidad de sobres que tiene el usuario
      const packs = await checkPacksByUser(account, packsContract) // llamada al contrato
      setLoaderPack(true)

      if (packs.length == 0) {
        Swal.fire({
          title: '',
          text: t('no_paquetes_para_abrir'),
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        })
      }

      if (packs.length >= 1) {
        const packNumber = ethers.BigNumber.from(packs[0]).toNumber()
        // llama a la api para recibir los numeros de cartas del sobre y la firma
        const data = await fetchPackData(account, packNumber) // llamada al back
        const { packet_data, signature } = data

        setOpenPackCardsNumbers(packet_data)
        // ssetPacksEnable(true)
        // llama al contrato de cartas para abrir el sobre
        const openedPack = await openPack(cardsContract, packNumber, packet_data, signature.signature)
        if (openedPack) {
          await openedPack.wait()
          setOpenPackage(true)
          setLoaderPack(false)
          await checkNumberOfPacks()
          return openedPack
        } else {
          setLoaderPack(false)
        }
      }
    } catch (e) {
      console.error({ e })
    }
  }

  const buyPackscontact = async (numberOfPacks) => {
    /*
    packsContract.on('PacksPurchase', (returnValue, theEvent) => {
      for (let i = 0; i < theEvent.length; i++) {
        const pack_number = ethers.BigNumber.from(theEvent[i]).toNumber()
      }
    })
    */

    try {
      console.log('loading true')
      setLoading(true)
      const approval = await checkApproved(daiContract, account, packsContract.address)
      if (!approval) {
        await authorizeDaiContract()
      }
      /*
      const call = await packsContract.buyPacks(numberOfPacks, { gasLimit: 6000000 })
        await call.wait()
        await checkNumberOfPacks()
        return call
      } else {
        const call = await packsContract.buyPacks(numberOfPacks, { gasLimit: 6000000 })
        await call.wait()
        return call
      }
      */
      const call = await packsContract.buyPacks(numberOfPacks, { gasLimit: 6000000 })
      await call.wait()
      await checkNumberOfPacks()
      console.log('loading false')
      setLoading(false)
      return call
    } catch (e) {
      setLoading(false)
      emitError(t('buy_pack_error'))
      console.error({ e })
    }
  }

  const handleBuyPackClick = async () => {
    const price =  getPackPrice(packsContract)

    const result = await Swal.fire({
      text: `${t('buy_pack_title_1')} (${t('buy_pack_title_2')} ${price || '1'} DAI)`,
      input: 'number',
      inputAttributes: {
        min: 1,
        max: 10,
      },
      inputValidator: (value) => {
        if (value < 1 || value > 10) {
            return `${t('buy_pack_input_validator')}`
        }
      },
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: `${t('buy_pack_button')}`,
      confirmButtonColor: '#005EA3',
      color: 'black',
      background: 'white',
      customClass: {
        image: 'cardalertimg',
        input: 'alertinput'
      }
    })

    if (result.isConfirmed) {
      const packsToBuy = result.value
      await buyPackscontact(packsToBuy)
    }
  }

  return (
    <>
      {!account && <div className='alpha'>
        {loading && (<div className= 'loader_container'>
          <span className='loader' />
        </div>)}
        <div className='main_buttons_container'>
          <button
            className='alpha_button alpha_main_button'
            id='connect_metamask_button'
            onClick={() => connectToMetamask()}>{t('connect_metamask')}
          </button>
          <button
            className='alpha_button alpha_main_button'
            id='show_rules_button'
            onClick={() => showRules('gamma')}
          >
            {t('reglas')}
          </button>
          <span>{noMetamaskError}</span>
        </div>

        <div className='gamma_rules_container'>
          <button
            className='gamma_rules_img_close alpha_modal_close'
            onClick={() => closeRules('gamma')}
          >
            X
          </button>

          <div className='gamma_rules_text_content'>
            <div className='gamma_rules_title'>
              <p>{t('reglas')}</p>
            </div>
            <div className='gamma_rules_text_left'>
              <p>{t('rules_gamma_left_text_1')}</p>
              <p>{t('rules_gamma_left_text_2')}</p>
              <p>{t('rules_gamma_left_text_3')}</p>
              <p>{t('rules_gamma_left_text_4')}</p>
            </div>
            <div className='gamma_rules_text_right'>
              <p>{t('rules_gamma_right_text_1')}</p>
              <p>{t('rules_gamma_right_text_2')}</p>
              <p>{t('rules_gamma_right_text_3')}</p>
              <p>{t('rules_gamma_right_text_4')}</p>
            </div>
          </div>
        </div>

      </div>
      }

      <Navbar
        account={account}
        cardInfo={cardInfo}
        setCardInfo={setCardInfo}
        inventory={inventory}
        setInventory={setInventory}
        // packsContract={packsContract}
        // daiContract={daiContract}
        // authorizeDaiContract={authorizeDaiContract}
        // checkNumberOfPacks={checkNumberOfPacks}
        handleBuyPackClick={handleBuyPackClick}
      />

      {account && <div className='gamma_main'>
        {packIsOpen && <GammaPack
          loaderPack={loaderPack}
          setPackIsOpen={setPackIsOpen}
          cardsNumbers={openPackCardsNumbers}
          setOpenPackage={setOpenPackage}
          openPackage={openPackage}
                       />}
        <Head>
          <title>Number One Fan</title>
          <meta name='description' content='NoF Gamma' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <div className='hero__top'>
          {!mobile && inventory && <img alt='albums' src='/gamma/albums.png' onClick={() => setInventory(false)} className='gammaAlbums' />}
          {!mobile && !inventory && <div onClick={() => setInventory(false)} className='gammaAlbums2' />}
          <div style={inventory ? { backgroundImage: 'url(\'/gamma/InventarioFondo.png\')' } : { backgroundImage: 'url(\'/gamma/GammaFondo.png\')' }} className='hero__top__album'>
            {inventory && !cardInfo && <InventoryAlbum
              account={account}
              cardsContract={cardsContract}
              setImageNumber={setImageNumber}
              setCardInfo={setCardInfo}
              cardInfo={cardInfo}/>}
            {!inventory && <GammaAlbum />}
            {inventory && cardInfo && <InfoCard imageNumber={imageNumber} cardsContract={cardsContract} setLoading={setLoading} />}
          </div>
          {/* {!mobile && packsEnable && <div onClick={() => { setPackIsOpen(true), fetchPackData() }} className="gammaFigures">Buy Pack</div>}
          {!mobile && !packsEnable && <div onClick={() => { setPackIsOpen(true), buypack() }} className="gammaFigures"><h2>Buy Pack</h2></div>} */}
          {!mobile && inventory &&
            <div onClick={() => { setPackIsOpen(true), openAvailablePack() }} className='gammaShop'>
              <h1>{numberOfPacks}</h1>
              <div className='album'>
                <h3>{t('transferir')}</h3>
              </div>
            </div>}

          {!mobile && !inventory &&
            <div className='gammaComplete'>
              <h3>{t('album')}</h3>
              <h3>24/120</h3>
              <h3>{t('completar')}</h3>
            </div>}
        </div>
      </div>}
      <Footer />
    </>
  )
})

export default index
