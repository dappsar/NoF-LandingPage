import { ethers } from 'ethers'
import { gammaServiceUrl } from '../config'
import { checkApproved, authorizeDaiContract } from './dai'

export const getGammacardsPages = () => {
  const gammaCardsPages = {
    page1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    page2: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    page3: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    page4: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
    page5: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    page6: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
    page7: [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],
    page8: [84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
    page9: [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107],
    page10: [108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119],
    page11: [120, 121],
    user: {}
  }

  for (let i = 0; i < 122; i++) {
    gammaCardsPages.user[i] = {
      name: i.toString(),
      stamped: false,
      offered: false,
      quantity: 0
    }
  }
  return gammaCardsPages
}

export const fetchPackData = async (walletAddress, pack_number) => {
  // llamada a la api para que nos de la data a pasar en la llamada al contrato
  try {
    const body = {
      address: walletAddress, // user address
      packet_number: pack_number // numero de paquete que se esta abriendo
    }
    const response = await fetch(gammaServiceUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return data
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const checkPacksByUser = async (walletAddress, packsContract) => {
  try {
    const packs = await packsContract?.getPacksByUser(walletAddress)
    return packs
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const verifyPackSigner = async (cardsContract, packNumber, packData, signature) => {
  try {
    const signer = await cardsContract.verifyPackSigner(packNumber, packData, signature)
    return signer
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const openPack = async (cardsContract, packNumber, packData, signature) => {
  try {
    const openPackTx = await cardsContract.openPack(packNumber, packData, signature, {
      gasLimit: 6000000
    })
    await openPackTx.wait()
    return openPackTx
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const openPacks = async (
  cardsContract,
  numberOfPacks,
  packsNumber,
  packsData,
  signatures
) => {
  try {
    const openPacksTx = await cardsContract.openPacks(
      numberOfPacks,
      packsNumber,
      packsData,
      signatures,
      {
        gasLimit: 6000000
      }
    )
    await openPacksTx.wait()
    return openPacksTx
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const getMaxPacksAllowedToOpenAtOnce = async (cardsContract) => {
  try {
    const result = await cardsContract.maxPacksToOpenAtOnce()
    return result
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const getCardsByUser = async (cardsContract, walletAddress) => {
  try {
    if (!cardsContract || !walletAddress) return
    const cardData = await cardsContract?.getCardsByUser(walletAddress)
    const cardsPages = getGammacardsPages()
    let cardsObj = { ...cardsPages }

    // Inicializa array
    for (let i = 0; i <= 121; i++) {
      cardsObj.user[i] = {
        name: i.toString(),
        stamped: false,
        offered: false,
        quantity: 0
      }
    }

    // completa array con lo que tiene el usuario
    for (let i = 0; i < cardData[0].length; i++) {
      const cardId = cardData[0][i]
      const quantity = cardData[1][i]
      const offers = cardData[2][i]
      cardsObj.user[cardId] = {
        name: cardId.toString(),
        stamped: quantity > 0,
        offered: offers || false,
        quantity: quantity
      }
    }

    return cardsObj
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const getUserMissingCards = async (cardsContract, walletAddress) => {
  const userCards = await getCardsByUser(cardsContract, walletAddress)
  const cardsQttyZero = Object.values(userCards.user)
    .filter((card) => {
      const cardNumber = parseInt(card.name)
      return cardNumber !== 120 && cardNumber !== 121 && card.quantity === 0
    })
    .map((card) => parseInt(card.name))
  return cardsQttyZero
}

export const getUserMissingCardsQtty = async (cardsContract, walletAddress) => {
  const userMissingCards = await getUserMissingCards(cardsContract, walletAddress)
  return (await userMissingCards).length
}

export const hasCard = async (cardsContract, walletAddress, cardNumber) => {
  try {
    if (!cardsContract || !walletAddress) return
    const result = await cardsContract.hasCard(walletAddress, cardNumber)
    return result
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const getPackPrice = async (cardsContract) => {
  try {
    if (!cardsContract) return
    const price = await cardsContract.packPrice()
    const result = ethers.utils.formatUnits(price, 18)
    return result
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const getUserAlbums120Qtty = async (cardsContract, walletAddress) => {
  try {
    if (!cardsContract || !walletAddress) return
    const userHasAlbum = await cardsContract.cardsByUser(walletAddress, 120)
    return userHasAlbum
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const finishAlbum = async (cardsContract, daiContract, walletAddress) => {
  try {
    if (!cardsContract || !walletAddress) return
    const result = await allowedToFinishAlbum120(cardsContract, daiContract, walletAddress)
    if (result) {
      const transaction = await cardsContract.finishAlbum()
      await transaction.wait()
      return true
    } else {
      return false
    }
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const confirmOfferExchange = async (
  offersContract,
  addressFrom,
  cardNumberFrom,
  addressTo,
  cardNumberTo
) => {
  try {
    const transaction = await offersContract.confirmOfferExchange(
      addressFrom,
      cardNumberFrom,
      addressTo,
      cardNumberTo
    )
    await transaction.wait()
    return true
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const burnCards = async (cardsContract, daiContract, walletAddress, cardsToBurn) => {
  try {
    if (!cardsContract || !walletAddress) return

    const currentBurnedUserCards = await cardsContract.getBurnedCardQttyByUser(walletAddress)
    const currentBurnedUserFmt = ethers.BigNumber.from(currentBurnedUserCards).toNumber()
    const cardsToBurnQtty = cardsToBurn.length

    console.log(
      'burnCards',
      walletAddress,
      currentBurnedUserCards,
      currentBurnedUserFmt,
      cardsToBurnQtty
    )

    if (currentBurnedUserFmt + cardsToBurnQtty >= 60) {
      console.log('burn cards need to validate')
      const meetConditions = await allowedToFinishAlbum60(cardsContract, daiContract, walletAddress)
      console.log('burn cards need to validate', meetConditions)
      if (meetConditions.result) {
        console.log('burn cards need to validate', meetConditions.result)
        // uint256 userAllowance = erc20Token.allowance(msg.sender, address(this));
        // require(userAllowance >= secondaryAlbumPrize, "Insufficient allowance to transfer prize for burning cards.");
        const approval = await checkApproved(
          daiContract,
          walletAddress,
          cardsContract.address,
          meetConditions.amountRequired
        )
        if (!approval) {
          await authorizeDaiContract(
            daiContract,
            cardsContract.address,
            meetConditions.amountRequired
          )
        }
        const transaction = await cardsContract.burnCards(cardsToBurn)
        await transaction.wait
        return true
      } else {
        console.log('burn cards need to validate', meetConditions.result)
        return false
      }
    } else {
      console.log('burn cards NO necesita validate')
      const transaction = await cardsContract.burnCards(cardsToBurn)
      await transaction.wait
      return true
    }
  } catch (e) {
    console.error({ e })
    throw e
  }
}

export const allowedToFinishAlbum60 = async (cardsContract, daiContract, walletAddress) => {
  const userHasAlbum = await cardsContract.cardsByUser(walletAddress, 121)
  const prizesBalance = await cardsContract.prizesBalance()
  const secondaryAlbumPrize = await cardsContract.secondaryAlbumPrize()
  const gammaContractBalance = await verifyDAIBalance(daiContract, cardsContract.address)
  const prizeBalanceFormatted = ethers.utils.formatUnits(prizesBalance, 18)
  const secondaryAlbumPrizeFormatted = ethers.utils.formatUnits(secondaryAlbumPrize, 18)
  const gammaContractBalanceFormatted = ethers.utils.formatUnits(gammaContractBalance, 18)

  // require(prizesBalance >= secondaryAlbumPrize, "Insufficient funds (burnCards balance).");
  const prizesBalanzGTSecondaryAlbumPrice =
    parseInt(prizeBalanceFormatted) >= parseInt(secondaryAlbumPrizeFormatted)

  // uint256 contractBalance = erc20Token.balanceOf(address(this));
  // require(contractBalance >= secondaryAlbumPrize, "Insufficient funds (contract).");
  const contractBalanzGTAlSecondarybumPrice =
    parseInt(gammaContractBalanceFormatted) >= parseInt(secondaryAlbumPrizeFormatted)

  const result =
    userHasAlbum && prizesBalanzGTSecondaryAlbumPrice && contractBalanzGTAlSecondarybumPrice

  console.log('allowedToFinishAlbum60', {
    userHasAlbum,
    prizeBalanceFormatted,
    secondaryAlbumPrizeFormatted,
    gammaContractBalanceFormatted,
    prizesBalanzGTSecondaryAlbumPrice,
    contractBalanzGTAlSecondarybumPrice,
    result
  })

  return { result: result, amountRequired: secondaryAlbumPrize }
}

export const allowedToFinishAlbum120 = async (cardsContract, daiContract, walletAddress) => {
  // Hay 4 condicione sen el contrato para poder completarlo:
  // 1. Que el usuario tengan un álbum: require(cardsByUser[msg.sender][120] > 0, "No tienes ningun album");
  // 2. Que haya un balance mayor a lo que se paga de premio: require(prizesBalance >= mainAlbumPrize, "Fondos insuficientes");
  // 3. Que el usuario tenga todas las cartas.
  // 4. Que el contrato tenga un balance superior al precio del premio (mainAlbumPrize)
  // Las 4 se validan en el contrato y aquí (para evitar la llamada al contrato)

  // require(cardsByUser[msg.sender][120] > 0, "No tienes ningun album");
  if (!cardsContract || !walletAddress) return
  const userHasAlbum = await cardsContract.cardsByUser(walletAddress, 120)
  const prizesBalance = await cardsContract.prizesBalance()
  const mainAlbumPrize = await cardsContract.mainAlbumPrize()
  const gammaContractBalance = await verifyDAIBalance(daiContract, cardsContract.address)
  const prizeBalanceFormatted = ethers.utils.formatUnits(prizesBalance, 18)
  const albumPrizeFormatted = ethers.utils.formatUnits(mainAlbumPrize, 18)
  const gammaContractBalanceFormatted = ethers.utils.formatUnits(gammaContractBalance, 18)

  // require(prizesBalance >= mainAlbumPrize, "Fondos insuficientes");
  const prizesBalanzGTAlbumPrice = parseInt(prizeBalanceFormatted) >= parseInt(albumPrizeFormatted)

  // require gammaCardContractBalance >= mainAlbumPrize
  const contractBalanzGTAlbumPrice =
    parseInt(gammaContractBalanceFormatted) >= parseInt(albumPrizeFormatted)

  const result = userHasAlbum && prizesBalanzGTAlbumPrice && contractBalanzGTAlbumPrice

  console.log('prizesBalanzGTAlbumPrice', {
    userHasAlbum,
    prizeBalanceFormatted,
    albumPrizeFormatted,
    gammaContractBalanceFormatted,
    prizesBalanzGTAlbumPrice,
    contractBalanzGTAlbumPrice,
    result
  })

  return result
}

const verifyDAIBalance = async (daiContract, address) => {
  try {
    const result = await daiContract.balanceOf(address)
    return result
  } catch (e) {
    console.error({ e })
    throw e
  }
}
