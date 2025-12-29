import { useContext } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { useDevnetWallet } from './devnet-wallet-context';

export function useCurrentAddress(): string | null {
  const { currentWallet } = useDevnetWallet();
  const { network, testnetAddress, mainnetAddress } = useContext(HiroWalletContext);

  switch (network) {
    case 'devnet':
      return currentWallet?.stxAddress || null;
    case 'testnet':
      return testnetAddress;
    case 'mainnet':
      return mainnetAddress;
    default:
      return null;
  }
}