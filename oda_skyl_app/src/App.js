import { useEffect, useState } from 'react';
import sad from './assets/sad.svg';
import happy from './assets/happy.svg';

const App = () => {
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode') || 'light'));

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.querySelector('body').style.backgroundColor = darkMode
      ? '#070332'
      : '#FFFFFF';
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : null}>
      <div className='h-screen transition-all relative font-inter flex items-center justify-center bg-white dark:bg-darkBlue'>
        <a
          href='http://yildizskylab.com'
          className='absolute p-6 cursor-pointer tracking-[0.25rem] text-xl sm:-rotate-90 left-6 sm:left-2 top-8 sm:top-16 font-bebasNeue text-darkBlue dark:text-white'
        >
          SKY LAB
        </a>
        <div
          onClick={() => setDarkMode(!darkMode)}
          className='p-6 absolute right-6 sm:right-10 lg:right-20 top-7 sm:top-10 cursor-pointer'
        >
          <div className='flex w-16 h-8 ring-1 ring-darkBlue dark:ring-white rounded-[1rem] p-[0.2rem]'>
            <div
              className={`${
                darkMode ? 'translate-x-8' : null
              } transition-all duration-300 h-full aspect-square rounded-[50%] bg-darkBlue dark:bg-white`}
            ></div>
          </div>
        </div>

        <section className='flex flex-col justify-between items-center'>
          <div className='flex flex-col items-center justify-center'>
            <div className='bg-white flex justify-between items-center w-60 sm:w-80 aspect-square overflow-hidden rounded-[50%]'>
              <img src={happy} className='w-full' alt='Skylab Müthiş' />
            </div>
            <h1 className='text-darkBlue dark:text-white mt-6 font-bold text-4xl sm:text-5xl md:text-7xl'>
              Oda şu an dolu :(
            </h1>
            <p className='mt-2 md:mt-6 w-80 md:w-96 font-medium text-sm md:text-base text-center text-darkBlue dark:text-white'>
              En yakın 04.03.2023 tarihinde saat 12.00'de kullanabilirsin
            </p>
          </div>
        </section>
        <a
          href='http://google.com'
          className='absolute bottom-16 sm:bottom-12 py-4 px-20 md:hover:scale-110 transition-transform flex justify-center items-center text-white dark:text-darkBlue bg-darkBlue dark:bg-white'
        >
          Takvime Git
        </a>
      </div>
    </div>
  );
};

export default App;
