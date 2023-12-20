import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'

import { useSettingsContext } from '../hooks'
import { useSetLocale } from '@web3-onboard/react'
import coinbaseModule from '@web3-onboard/coinbase'
import trustModule from '@web3-onboard/trust'
import gnosisModule from '@web3-onboard/gnosis'
import walletConnectModule from '@web3-onboard/walletconnect'
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import { init } from '@web3-onboard/react'

import daiAbi from './abis/TestDAI.v3.sol/NofTestDAIV3.json'
import alphaAbi from './abis/Alpha.v3.sol/NofAlphaV3.json'
import gammaPacksAbi from './abis/GammaPacks.v3.sol/NofGammaPacksV3.json'
import gammaCardsAbi from './abis/GammaCards.v5.sol/NofGammaCardsV5.json'
import gammaOffersAbi from './abis/GammaOffers.v4.sol/NofGammaOffersV4.json'
import { CONTRACTS, NETWORK, WalletConnectProjectId } from '../config'

import brLocales from '../../public/locales/br/web3_onboard.json'
import enLocales from '../../public/locales/en/web3_onboard.json'
import esLocales from '../../public/locales/es/web3_onboard.json'

import { NotificationContext } from './NotificationContext'
import { getAccountAddressText } from '../utils/stringUtils'

//----------------------------------------------------------

const initialState = {
  connectWallet: () => {},
  disconnectWallet: () => {},
  switchOrCreateNetwork: () => {},
}

const Web3Context = createContext(initialState)

const Web3ContextProvider = ({ children }) => {
  const [web3Onboard, setWeb3Onboard] = useState(null)
  const [web3Error, setWeb3Error] = useState('')
  const [wallets, setWallets] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isValidNetwork, setIsValidNetwork] = useState(false)
  const [chainId, setChainId] = useState(null)
  const [daiContract, setDaiContract] = useState(null)
  const [alphaContract, setAlphaContract] = useState(null)
  const [gammaPacksContract, setGammaPacksContract] = useState(null)
  const [gammaCardsContract, setGammaCardsContract] = useState(null)
  const [gammaOffersContract, setGammaOffersContract] = useState(null)
  const { addNotification } = useContext(NotificationContext)
  const { languageSetted } = useSettingsContext()
  let updateLocale = () => {}
  
  const initWeb3Onboard = useCallback(async () => {
    const wcV1InitOptions = {
      version: 1,
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModalOptions: {
        mobileLinks: ['metamask', 'argent', 'trust']
      },
      connectFirstChainId: true
    }

    const wcV2InitOptions = {
      version: 2,
      projectId: WalletConnectProjectId || ''
    }

    const injected = injectedModule({
      filter: {
        // allow only on non-android mobile
        [ProviderLabel.Detected]: ['Android', 'desktop', 'macOS', 'iOS'],
        displayUnavailable: true
      }
    })

    const walletConnect = walletConnectModule(wcV2InitOptions || wcV1InitOptions)
    const trust = trustModule()
    const coinbase = coinbaseModule()
    const gnosis = gnosisModule({
      whitelistedDomains: []
    })

    const onboard = init({
      wallets: [injected, walletConnect, gnosis, coinbase, trust],
      connect: {
        showSidebar: true,
        disableClose: false,
        autoConnectLastWallet: true,
        autoConnectAllPreviousWallet: true
      },
      accountCenter: {
        desktop: {
          enabled: false,
          minimal: true,
          position: 'bottomRight'
        },
        mobile: {
          enabled: false,
          minimal: true,
          position: 'topRight'
        }
      },
      notify: { enabled: true },
      chains: [
        {
          id: NETWORK.chainId,
          token: NETWORK.chainCurrency,
          label: NETWORK.chainName,
          rpcUrl: NETWORK.ChainRpcUrl
        }
      ],
      i18n: {
        en: enLocales,
        es: esLocales,
        br: brLocales
      },
      appMetadata: {
        name: 'NoF',
        description: 'Number one Fun',
        icon: '/images/common/nof.png',
        recommendedInjectedWallets: [
          {
            name: 'MetaMask',
            url: 'https://metamask.io'
          }
        ]
      }
    })

    setWeb3Onboard(onboard)
  }, [])

  useEffect(() => {
    initWeb3Onboard().then(() => {})
  }, [initWeb3Onboard])

  /*
  useEffect(() => {
    if (web3Onboard) {
      updateLocale = useSetLocale()
      updateLocale(languageSetted || 'en')
    }
  }, [initWeb3Onboard])
  */

  const getProvider = (wlt) => {
    if (wlt) {
      return new ethers.providers.Web3Provider(wlt.provider, 'any')
    } else {
      return new ethers.providers.JsonRpcProvider(
        NETWORK.ChainRpcUrl,
        parseInt(NETWORK.chainId, 10)
      )
    }
  }

  /*
  const connectWallet = useCallback(() => {
    // const updateLocale = useSetLocale()
    // updateLocale(languageSetted || 'en')

    web3Onboard
      .connectWallet()
      .then((wallets) => {
        if (wallets) {
          setWallets(wallets)
          if (wallets[0]) {
            setWalletAddress(wallets[0].accounts[0].address)
            const _chainId = wallets[0]?.chains?.[0].id.toString()
            if (_chainId) {
              const providerNetwork = ethers.providers.getNetwork(parseInt(_chainId, 16))
              const chainIdHex = decToHex(providerNetwork.chainId)
              setChainId(chainIdHex)
              setIsConnected(true)

              if (chainIdHex === NETWORK.chainId) {
                const provider = getProvider(wallets[0])
                const signer = provider.getSigner()
                connectContracts(signer)
                setIsValidNetwork(true)
              } else {
                setIsValidNetwork(false)
                setWeb3Error('account_invalid_network')
                switchOrCreateNetwork()
              }
            }
          }
        }
      })
      .catch((e) => {
        console.error({ e })
      })
  }, [web3Onboard, chainId]) //eslint-disable-line react-hooks/exhaustive-deps
  */

  const connectWallet = useCallback(async () => {
    try {
      if (!web3Onboard) {
        await initWeb3Onboard()
      }

      const wallets = await web3Onboard.connectWallet()

      if (wallets) {
        setWallets(wallets)

        if (wallets[0]) {
          setWalletAddress(wallets[0].accounts[0].address)
          const _chainId = wallets[0]?.chains?.[0].id.toString()

          if (_chainId) {
            const providerNetwork = ethers.providers.getNetwork(parseInt(_chainId, 16))
            const chainIdHex = decToHex(providerNetwork.chainId)
            setChainId(chainIdHex)
            setIsConnected(true)

            if (chainIdHex === NETWORK.chainId) {
              const provider = getProvider(wallets[0])
              const signer = provider.getSigner()
              connectContracts(signer)
              setIsValidNetwork(true)
            } else {
              setIsValidNetwork(false)
              setWeb3Error('account_invalid_network')
              await switchOrCreateNetwork()
            }
          }
        }
      }
    } catch (error) {
      console.error({ error })
    }
  }, [web3Onboard, chainId, wallets, languageSetted]) //eslint-disable-line react-hooks/exhaustive-deps

  function connectContracts(_signer) {
    try {
      const daiContractInstance = new ethers.Contract(CONTRACTS.daiAddress, daiAbi.abi, _signer)

      const alphaContractInstance = new ethers.Contract(
        CONTRACTS.alphaAddress,
        alphaAbi.abi,
        _signer
      )
      const gammaPacksContractInstance = new ethers.Contract(
        CONTRACTS.gammaPackAddress,
        gammaPacksAbi.abi,
        _signer
      )
      const gammaCardsContractInstance = new ethers.Contract(
        CONTRACTS.gammaCardsAddress,
        gammaCardsAbi.abi,
        _signer
      )
      const gammaOffersContractInstance = new ethers.Contract(
        CONTRACTS.gammaOffersAddress,
        gammaOffersAbi.abi,
        _signer
      )

      gammaPacksContractInstance.on('PackTransfer', (from, to, tokenId) => {
        const packNbr = ethers.BigNumber.from(tokenId).toNumber()
        addNotification(to, 'notification_pack_transfer', [
          { item: 'PACK', value: packNbr, valueShort: packNbr },
          { item: 'WALLET', value: from, valueShort: getAccountAddressText(from) }
        ])
      })

      gammaCardsContractInstance.on('ExchangeCardOffer', (from, to, cNFrom, cNTo) => {
        addNotification(to, 'notification_exchange', [
          { item: 'CARD_RECEIVED', value: cNFrom, valueShort: cNFrom },
          { item: 'CARD_SENT', value: cNTo, valueShort: cNTo },
          { item: 'WALLET', value: from, valueShort: getAccountAddressText(from) }
        ])
        addNotification(from, 'notification_exchange', [
          { item: 'CARD_RECEIVED', value: cNTo, valueShort: cNTo },
          { item: 'CARD_SENT', value: cNFrom, valueShort: cNFrom },
          { item: 'WALLET', value: to, valueShort: getAccountAddressText(to) }
        ])
      })

      setDaiContract(daiContractInstance)
      setAlphaContract(alphaContractInstance)
      setGammaPacksContract(gammaPacksContractInstance)
      setGammaCardsContract(gammaCardsContractInstance)
      setGammaOffersContract(gammaOffersContractInstance)
    } catch (e) {
      console.error({ e })
    }
  }

  const disconnectWallet = useCallback(() => {
    if (web3Onboard) {
      web3Onboard.walletReset
    }
    setWallets(null)
    setWalletAddress(null)
    setChainId(null)
    setIsValidNetwork(false)
    setIsConnected(false)
    setWeb3Error('')
  }, [web3Onboard])

  function decToHex(number) {
    return `0x${parseInt(number).toString(16)}`
  }

  const switchOrCreateNetwork = useCallback(async () => {
    if (window && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK.chainId }]
        })
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: NETWORK.chainId,
                  chainName: NETWORK.chainName,
                  rpcUrls: [NETWORK.ChainRpcUrl],
                  nativeCurrency: {
                    name: NETWORK.chainCurrency,
                    symbol: NETWORK.chainCurrency,
                    decimals: 18
                  },
                  blockExplorerUrls: [NETWORK.chainExplorerUrl]
                }
              ]
            })
          } catch (e) {
            console.error(e.message)
          }
        } else {
          console.error('Error switching network', error)
        }
      }
    } else {
      console.error('Metamask or compatible wallet not installed')
    }
  }, [])

  useEffect(() => {
    if (window && typeof window.ethereum === 'undefined') {
      setWeb3Error('account_no_metamask')
      return
    }

    if (window && window.ethereum !== undefined) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts) {
          const address = accounts[0]
          setWalletAddress(address)
        }
      })

      window.ethereum.on('chainChanged', (newChain) => {
        setWeb3Error('account_invalid_network')
        const _chanIdHex = decToHex(newChain)
        setChainId(_chanIdHex)
        setIsValidNetwork(false)
        if (_chanIdHex === NETWORK.chainId) {
          const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
          const signer = provider.getSigner()
          connectContracts(signer)
          setIsValidNetwork(true)
        }
      })
    }
  }, []) //eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    chainId,
    wallets,
    walletAddress,
    daiContract,
    alphaContract,
    gammaPacksContract,
    gammaCardsContract,
    gammaOffersContract,
    web3Error,
    isConnected,
    isValidNetwork,
    connectWallet,
    disconnectWallet,
    switchOrCreateNetwork
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

Web3ContextProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export { Web3ContextProvider, Web3Context }
