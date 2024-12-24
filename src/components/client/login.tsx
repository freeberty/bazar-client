import { useStore } from '@nanostores/react';
import { userPubkey, checkAndSetPubkey, unsetPubkey } from '../../stores/user';
import { useEffect, useState } from 'react';
import { shortenPubkey } from '../../utils/helpers';

export const Login = () => {
  const $userPubkey = useStore(userPubkey);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    await checkAndSetPubkey();
  };

  if (!isClient) {
    return <div className="login-container">Loading...</div>;
  }

  return (
    <div className="login-container">
      {$userPubkey ? (
        <div className="flex-row">
          <div className="user-info">
            <div className="pubkey-display">
              {shortenPubkey({ pubkey: $userPubkey })}
            </div>
          </div>
          <button onClick={unsetPubkey} className="logout-button">
            Logout  
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="login-button">
          Login with Nostr
        </button>
      )}
    </div>
  );
};
