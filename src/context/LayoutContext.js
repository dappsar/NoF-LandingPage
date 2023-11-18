import PropTypes from 'prop-types'
import React, { useCallback, createContext, useEffect, useState, useRef } from 'react'

const initialState = {
  windowSize: { size: false, mobile: false },
  bookRef: null
}

const LayoutContext = createContext(initialState)

LayoutProvider.propTypes = {
  children: PropTypes.node.isRequired
}

function LayoutProvider({ children }) {
  const [windowSize, setWindowSize] = useState({
    size: typeof window !== 'undefined' && window.innerWidth < 600,
    mobile: typeof window !== 'undefined' && window.innerWidth < 600
  })
  const [loading, setLoading] = useState(false)
  // const [book, setBook] = useState(null)
  const bookRef  = useRef(null)

  const updateMedia = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 600
      setWindowSize({
        size: isMobile,
        mobile: isMobile
      })
    }
  }

  const startLoading = useCallback(() => {
    setLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const setBookRef = useCallback((_book) => {
    // setBook (_book)
    bookRef.current = _book
    console.log('seted bookRef', _book, bookRef)
  }, [])

  const turnPrevPage = useCallback(() => {
    if (!bookRef.current) return
    bookRef.current.pageFlip().flipPrev()
  }, [])

  const turnNextPage = useCallback(() => {
    if (!bookRef.current) return
    bookRef.current.pageFlip().flipNext()
  }, [])

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMedia)
      return () => {
        window.removeEventListener('resize', updateMedia)
      }
    }
  }, [])

  return (
    <LayoutContext.Provider
      value={{ 
        windowSize,
        loading,
        bookRef,
        startLoading,
        stopLoading,
        setBookRef,
        turnPrevPage,
        turnNextPage
      }}>
      {children}
    </LayoutContext.Provider>
  )
}

export { LayoutProvider, LayoutContext }
