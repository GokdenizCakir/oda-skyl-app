import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom';
//import sad from './assets/sad.svg';
import happy from './assets/happy.svg';
import './index.css';
import axios from 'axios';

const App = () => {
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ isEmpty: true, eventName: null, endTime: null });
  const [nextEvents, setNextEvents] = useState([]);
  //const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode') || 'light'));
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode ? JSON.parse(storedMode) : null;
  });
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.querySelector('body').style.backgroundColor = darkMode
      ? '#070332'
      : '#FFFFFF';
  }, [darkMode]
  );


  useEffect(() => {
    const fetchOngoingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ongoingevents');
        setOngoingEvents(response.data.ongoing_events || []);
      } catch (error) {
        console.error('Error fetching ongoing events:', error);
      }
    };

    const fetchNextEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/nextevents');
        const allNextEvents = response.data.next_events || [];

        // Filter out ongoing events and events not on the current day
        const filteredNextEvents = allNextEvents.filter((event) => {
          const eventDate = new Date(event.start.dateTime).toLocaleDateString();
          const currentDate = new Date().toLocaleDateString();
          const isEventOngoing =
            new Date(event.start.dateTime) <= new Date() && new Date() <= new Date(event.end.dateTime);
          return !isEventOngoing && eventDate === currentDate;
        });

        setNextEvents(filteredNextEvents);
      } catch (error) {
        console.error('Error fetching next events:', error);
      }
    };

    fetchOngoingEvents();
    fetchNextEvents();
  }, []);

  useEffect(() => {
    if (ongoingEvents.length > 0) {
      const nextEvent = ongoingEvents[0];
      setRoomStatus({
        isEmpty: false,
        eventName: nextEvent.summary,
        endTime: nextEvent.end.dateTime,
      });
    } else {
      setRoomStatus({
        isEmpty: true,
        eventName: null,
        endTime: null,
      });
    }
  }, [ongoingEvents]);
  

  const isEventOngoing = (event) => {
    const currentDateTime = new Date();
    const eventStartDateTime = new Date(event.start.dateTime);
    const eventEndDateTime = new Date(event.end.dateTime);
    return eventStartDateTime <= currentDateTime && currentDateTime <= eventEndDateTime;
  };

  const renderEventCard = (event) => (
    <div key={event.id} className="bg-white rounded shadow p-4">
      <p className="font-bold text-xl mb-2">{event.summary}</p>
      <p className="text-gray-600">
        <span className="font-bold">Start Time:</span>{' '}
        {new Date(event.start.dateTime).toLocaleTimeString()}
      </p>
      <p className="text-gray-600">
        <span className="font-bold">End Time:</span>{' '}
        {new Date(event.end.dateTime).toLocaleTimeString()}
      </p>
    </div>
  );

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
              className={`${darkMode ? 'translate-x-8' : null
                } transition-all duration-300 h-full aspect-square rounded-[50%] bg-darkBlue dark:bg-white`}
            ></div>
          </div>
        </div>
              
        <section className='flex flex-col justify-between items-center'>
          <div className='flex flex-col items-center justify-center'>
            <div className='bg-white flex justify-between items-center w-60 sm:w-80 aspect-square overflow-hidden rounded-[50%]'>
              <img src={happy} className='w-full' alt='Skylab Müthiş' />
            </div>
            {roomStatus.isEmpty ? (
            <h1 className='text-darkBlue dark:text-white mt-6 font-bold text-4xl sm:text-5xl md:text-7xl'>
              Oda şu an boş.
            </h1> 
            ) : (
            <p className='mt-2 md:mt-6 w-80 md:w-96 font-medium text-lg md:text-xl text-center text-darkBlue dark:text-white'>
              Şu anda: {roomStatus.eventName} etkinliği mevcut, {' '} En yakın {new Date(roomStatus.endTime).toLocaleTimeString()}'de kullanılabilir.
            </p>
            )}
          </div>
        </section>
        <a
          href="https://calendar.google.com/calendar/embed?src=bc6edfd480bce7cd796fdc737fb81ea97053ac5d51208e1cff1f04bb46168f1b%40group.calendar.google.com&ctz=Europe%2FIstanbul"          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-16 sm:bottom-12 py-4 px-20 md:hover:scale-110 transition-transform flex justify-center items-center text-white dark:text-darkBlue bg-darkBlue dark:bg-white"
        >
          Takvime Git
        </a>

      </div>
    </div>
  );
};

export default App;

const root = createRoot(document.getElementById('root'));
root.render(<App />);
