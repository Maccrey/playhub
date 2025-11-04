
import Lobby from '@/components/games/mafia/Lobby';
import MafiaRoom from '@/components/games/mafia/Room';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const MafiaPage = ({searchParams}: PageProps) => {
  const rawRoom = searchParams.room ?? searchParams.roomId;
  const roomId = Array.isArray(rawRoom) ? rawRoom[0] : rawRoom;

  if (roomId) {
    return <MafiaRoom roomId={roomId} />;
  }

  return <Lobby />;
};

export default MafiaPage;
