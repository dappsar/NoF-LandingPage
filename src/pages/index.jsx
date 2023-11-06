import React, { useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../sections/Hero'
import useTranslation from '../hooks/useTranslation'

function Home () {
  const book = useRef(null)
  const { language, setLanguage, t } = useTranslation()

  function turnNextPage () {
    book.current.pageFlip().flipNext()
  }

  function turnPrevPage () {
    book.current.pageFlip().flipPrev()
  }

  function goToCollections (number) {
    book.current.pageFlip().flip(number)
  }

  return (
    <div className='home'>
      <Head>
        <title>Number One Fan</title>
        <meta name='description' content='Number One Fan' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        />
        <link rel='icon' href='./favicon.ico' />
      </Head>
      <Navbar
        goToCollections={goToCollections}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      <Hero
        ref={book}
        language={language}
        setLanguage={setLanguage}
        t={t}
        turnNextPage={turnNextPage}
        turnPrevPage={turnPrevPage}
      />
      <Footer turnNextPage={turnNextPage} turnPrevPage={turnPrevPage} />
    </div>
  )
}

export default Home
