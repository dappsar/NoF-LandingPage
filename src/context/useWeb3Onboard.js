import { useEffect, useState } from 'react'
import { init } from '@web3-onboard/react'
import coinbaseModule from '@web3-onboard/coinbase'
import trustModule from '@web3-onboard/trust'
import gnosisModule from '@web3-onboard/gnosis'
import walletConnectModule from '@web3-onboard/walletconnect'
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import { NETWORK, WalletConnectProjectId } from '../config'
import brLocales from '../../public/locales/br/web3_onboard.json'
import enLocales from '../../public/locales/en/web3_onboard.json'
import esLocales from '../../public/locales/es/web3_onboard.json'

const useWeb3Onboard = () => {
  const [web3Onboard, setWeb3Onboard] = useState(null)

  useEffect(() => {
    const initializeWeb3Onboard = async () => {
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
          [ProviderLabel.Detected]: ['Android', 'desktop', 'macOS', 'iOS'],
          displayUnavailable: true
        }
      })

      const walletConnect = walletConnectModule(wcV2InitOptions || wcV1InitOptions)
      const trust = trustModule()
      const coinbase = coinbaseModule()
      const gnosis = gnosisModule({ whitelistedDomains: [] })

      const onboard = await init({
        wallets: [injected, walletConnect, gnosis, coinbase, trust],
        connect: {
          showSidebar: true,
          disableClose: false,
          autoConnectLastWallet: true,
          autoConnectAllPreviousWallet: true
        },
        accountCenter: {
          desktop: { enabled: false, minimal: true, position: 'bottomRight' },
          mobile: { enabled: false, minimal: true, position: 'topRight' }
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
        i18n: { en: enLocales, es: esLocales, br: brLocales },
        appMetadata: {
          name: 'NoF',
          description: 'Number one Fun',
          icon: '/images/common/nof.png',
          recommendedInjectedWallets: [{ name: 'MetaMask', url: 'https://metamask.io' }]
        }
      })

      setWeb3Onboard(onboard)
    }

    initializeWeb3Onboard()
  }, [])

  return { web3Onboard }
}

export default useWeb3Onboard
