
'use client';

import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import Lobby from '@/components/games/mafia/Lobby';
import MafiaRoom from '@/components/games/mafia/Room';

const MafiaPageContent = () => {
  const params = useSearchParams();
  const roomId = params?.get('room') ?? params?.get('roomId') ?? undefined;

  if (roomId) {
    return <MafiaRoom roomId={roomId} />;
  }

  return <Lobby />;
};

const MafiaPage = () => {
  return (
    <Suspense fallback={<Lobby />}>
      <MafiaPageContent />
    </Suspense>
  );
};

export default MafiaPage;
