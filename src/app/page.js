'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const isInitialRender = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [roomStatus, setRoomStatus] = useState({
    isEmpty: null,
    eventName: null,
    endTime: null,
  });
  const [nextEvents, setNextEvents] = useState([]);

  useEffect(() => {
    const fetchOngoingEvents = async () => {
      try {
        const response = await axios.get(
          'https://oda-skyl-app.vercel.app/api/ongoingevents'
        );
        setOngoingEvents(response.data.ongoing_events || []);
      } catch (error) {
        console.error('Error fetching ongoing events:', error);
      }
    };

    const fetchNextEvents = async () => {
      try {
        const response = await axios.get(
          'https://oda-skyl-app.vercel.app/api/nextevents'
        );
        const allNextEvents = response.data.next_events || [];

        // Filter out ongoing events and events not on the current day
        const filteredNextEvents = allNextEvents.filter((event) => {
          const eventDate = new Date(event.start.dateTime).toLocaleDateString();
          const currentDate = new Date().toLocaleDateString();
          const isEventOngoing =
            new Date(event.start.dateTime) <= new Date() &&
            new Date() <= new Date(event.end.dateTime);
          return !isEventOngoing && eventDate === currentDate;
        });

        setNextEvents(filteredNextEvents);
      } catch (error) {
        console.error('Error fetching next events:', error);
      }
    };

    fetchOngoingEvents();
    fetchNextEvents();

    isInitialRender.current = false;
  }, []);

  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [ongoingEvents]);

  useEffect(() => {
    if (!isInitialRender.current) {
      setIsLoading(false);
    }
  }, roomStatus);

  const isEventOngoing = (event) => {
    const currentDateTime = new Date();
    const eventStartDateTime = new Date(event.start.dateTime);
    const eventEndDateTime = new Date(event.end.dateTime);
    return (
      eventStartDateTime <= currentDateTime &&
      currentDateTime <= eventEndDateTime
    );
  };

  const renderEventCard = (event) => (
    <div key={event.id} className='bg-white rounded shadow p-4'>
      <p className='font-bold text-xl mb-2'>{event.summary}</p>
      <p className='text-gray-600'>
        <span className='font-bold'>Start Time:</span>{' '}
        {new Date(event.start.dateTime).toLocaleTimeString()}
      </p>
      <p className='text-gray-600'>
        <span className='font-bold'>End Time:</span>{' '}
        {new Date(event.end.dateTime).toLocaleTimeString()}
      </p>
    </div>
  );

  return (
    <div>
      <div className='h-[100dvh] transition-all relative font-inter flex items-center justify-center bg-white'>
        <a
          href='http://yildizskylab.com'
          className='absolute p-6 cursor-pointer tracking-[0.25rem] text-xl sm:-rotate-90 left-6 sm:left-2 top-8 sm:top-16 font-bebasNeue text-darkBlue'
        >
          SKY LAB
        </a>

        <section className='flex flex-col justify-between items-center'>
          <div className='flex flex-col items-center justify-center'>
            {roomStatus.isEmpty == null && (
              <>
                <span className='loader'></span>
                <h1 className='text-darkBlue mt-6 font-bold text-4xl sm:text-5xl md:text-7xl'>
                  Yükleniyor...
                </h1>
              </>
            )}
            {roomStatus.isEmpty != null && (
              <div className='bg-white flex justify-between items-center w-60 sm:w-80 aspect-square overflow-hidden rounded-[50%]'>
                <img
                  src={`/${roomStatus.isEmpty ? 'happy' : 'sad'}.svg`}
                  alt='Skylab'
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            )}
            {roomStatus.isEmpty == true && (
              <h1 className='text-darkBlue mt-6 font-bold text-4xl sm:text-5xl md:text-7xl'>
                Oda şu an boş.
              </h1>
            )}
            {roomStatus.isEmpty == false && (
              <p className='mt-2 md:mt-6 w-80 md:w-96 font-medium text-lg md:text-xl text-center text-darkBlue'>
                Şu anda: {roomStatus.eventName} etkinliği mevcut. En yakın{' '}
                {new Date(roomStatus.endTime).toLocaleTimeString()} saatinde
                kullanılabilir.
              </p>
            )}
          </div>
        </section>
        <a
          href='https://calendar.google.com/calendar/embed?src=bc6edfd480bce7cd796fdc737fb81ea97053ac5d51208e1cff1f04bb46168f1b%40group.calendar.google.com&ctz=Europe%2FIstanbul'
          target='_blank'
          rel='noopener noreferrer'
          className='absolute bottom-16 sm:bottom-12 py-4 px-20 md:hover:scale-110 transition-transform flex justify-center items-center text-white bg-darkBlue'
        >
          Takvime Git
        </a>
      </div>
    </div>
  );
}
