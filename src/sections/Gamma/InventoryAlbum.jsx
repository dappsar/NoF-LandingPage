import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { FcCheckmark } from 'react-icons/fc'
import pagination from '../../utils/placeholders'
import { getUserCards } from '../../services/contracts/gamma'

const InventoryAlbum = React.forwardRef((props, book) => {
  const { account, cardsContract, setImageNumber, setCardInfo } = props
  const [size, setSize] = useState(false)
  const [paginationObj, setPaginationObj] = useState({})

  useEffect(() => {
    windowSize()
  }, [])

  useEffect(() => {
    const fetchCardsData = async () => {
      const userCards = await getUserCards(cardsContract, account, pagination)
      setPaginationObj(userCards)
    }
    fetchCardsData()
  }, [account, cardsContract])

  const windowSize = () => {
    if (window.innerWidth < 600) {
      setSize(true)
    } else {
      setSize(false)
    }
    const updateMedia = () => {
      if (window.innerWidth < 600) {
        setSize(true)
      } else {
        setSize(false)
      }
    }
    window.addEventListener('resize', updateMedia)
    return () => window.removeEventListener('resize', updateMedia)
  }

  return paginationObj && paginationObj.page1
    ? (
      <HTMLFlipBook
        id='Book'
        size='stretch'
        width={360}
        height={500}
        minWidth={300}
        maxWidth={800}
        minHeight={350}
        maxHeight={800}
        autoSize
        drawShadow={false}
        usePortrait={size}
        ref={book}
        className='hero__top__album__book'
      >
        <div
          className='hero__top__album__book__page'
          data-density='hard'
          number='1'
        >
          <div className='hero__top__album__book__page__page-content'>
            <div className='grid-wrapper'>
              {paginationObj && paginationObj.page1.map((item, index) => (
                <div
                  onClick={() => { setCardInfo(true), setImageNumber(item) }}
                  style={(paginationObj.user[item]?.quantity == 0 || !paginationObj.user[item]?.quantity) ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'
                >
                  <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                  {paginationObj.user[item]?.stamped && <FcCheckmark />}
                  <div className='number'>{paginationObj.user[item]?.name}</div>
                  {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                    <div className='quantity'>X:{paginationObj?.user[item]?.quantity}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className='hero__top__album__book__page0'
          data-density='hard'
          number='2'
        >
          <div className='grid-wrapperright'>
            {paginationObj && paginationObj.page2.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page'
          data-density='hard'
          number='3'
        >
          <div className='grid-wrapper'>
            {paginationObj && paginationObj.page3.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page0'
          data-density='hard'
          number='4'
        >
          <div className='grid-wrapperright'>
            {paginationObj && paginationObj.page4.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page'
          data-density='hard'
          number='5'
        >
          <div className='grid-wrapper'>
            {paginationObj && paginationObj.page5.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page0'
          data-density='hard'
          number='6'
        >
          <div className='grid-wrapperright'>
            {paginationObj && paginationObj.page6.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page'
          data-density='hard'
          number='7'
        >
          <div className='grid-wrapper'>
            {paginationObj && paginationObj.page7.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page0'
          data-density='hard'
          number='8'
        >
          <div className='grid-wrapperright'>
            {paginationObj && paginationObj.page8.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page'
          data-density='hard'
          number='9'
        >
          <div className='grid-wrapper'>
            {paginationObj && paginationObj.page9.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        <div
          className='hero__top__album__book__page0'
          data-density='hard'
          number='10'
        >
          <div className='grid-wrapperright'>
            {paginationObj && paginationObj.page10.map((item, index) => (
              <div style={pagination.user[item].quantity == 0 ? { filter: 'grayscale(1)' } : {}} key={index} className='grid-item'>
                <img src={`https://storage.googleapis.com/nof-gamma/T1/${item}.png`} alt='img' />
                {paginationObj.user[item]?.stamped && <FcCheckmark />}
                <div className='number'>{paginationObj.user[item]?.name}</div>
                {paginationObj.user[item]?.quantity != 0 && paginationObj.user[item]?.quantity != 1 &&
                  <div className='quantity'>X:{paginationObj.user[item]?.quantity}</div>}
              </div>
            ))}
          </div>
        </div>
        {/* <div
                className="hero__top__album__book__page"
                data-density="hard"
                number="3"
            >
                <div className="hero__top__album__book__page__page-content">
                    Prueba3
                </div>
            </div> */}
      </HTMLFlipBook>
      ) : null
})

InventoryAlbum.propTypes = {
  account: PropTypes.string,
  cardsContract: PropTypes.object,
  setImageNumber: PropTypes.func,
  setCardInfo: PropTypes.func

}

export default InventoryAlbum