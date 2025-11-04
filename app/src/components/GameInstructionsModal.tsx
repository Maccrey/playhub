'use client';

import {useTranslations} from 'next-intl';

interface GameInstructionsModalProps {
  translationKey: string;
  open: boolean;
  onClose: () => void;
  values?: Record<string, string | number>;
}

const GameInstructionsModal: React.FC<GameInstructionsModalProps> = ({
  translationKey,
  open,
  onClose,
  values
}) => {
  const t = useTranslations('GameInstructions');

  if (!open) return null;

  let title: string | undefined;
  let body: string | undefined;

  try {
    title = t(`${translationKey}.title`, values);
  } catch {
    title = '';
  }

  try {
    body = t(`${translationKey}.body`, values);
  } catch {
    body = '';
  }

  if (!title) {
    title = translationKey;
  }

  if (!body) {
    body = '';
  }

  const confirmLabel = (() => {
    try {
      return t('confirm');
    } catch {
      return 'OK';
    }
  })();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="mb-4 whitespace-pre-line">{body}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default GameInstructionsModal;
