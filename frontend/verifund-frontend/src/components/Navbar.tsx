
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { connect, isConnected, getLocalStorage, disconnect } from '@stacks/connect';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(isConnected());
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [, setBtcAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (isConnected()) {
        console.log('Already connected');
        return;
      }

      const response = await connect();
      if (response) {
        console.log('Connected:', response);
        setAuthenticated(true);
        const userData = getLocalStorage();
        if (userData?.addresses?.stx?.length > 0) {
          setStxAddress(userData.addresses.stx[0].address);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAuthenticated(false);
    setStxAddress(null);
    setBtcAddress(null);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (isConnected()) {
      const userData = getLocalStorage();
      setAuthenticated(true);
      if (userData?.addresses?.stx?.length > 0) {
        setStxAddress(userData.addresses.stx[0].address);
      }
      if (userData?.addresses?.btc?.length > 0) {
        setBtcAddress(userData.addresses.btc[0].address);
      }
    }
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-verifund-sage/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-verifund-sage to-verifund-moss rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-verifund-forest-dark font-['Space_Grotesk']">VeriFund</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/campaigns" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
              Campaigns
            </Link>
            <Link to="/dashboard" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
              Dashboard
            </Link>
            <Link to="/create" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
              Create
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authenticated && stxAddress ? (
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="btn-secondary"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {stxAddress.slice(0, 6) + "..." + stxAddress.slice(-4)}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-verifund-sage/30">
                    <div className="py-1">
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm text-verifund-forest-dark hover:bg-verifund-sage/10 transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" size="sm" className="btn-secondary" onClick={connectWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          <button
            className="md:hidden text-verifund-forest-dark"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-verifund-sage/30">
            <div className="flex flex-col space-y-4">
              <Link to="/campaigns" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
                Campaigns
              </Link>
              <Link to="/dashboard" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
                Dashboard
              </Link>
              <Link to="/create" className="text-verifund-forest-dark hover:text-verifund-sage transition-colors">
                Create
              </Link>
              {authenticated && stxAddress ? (
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="btn-secondary w-fit"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {stxAddress.slice(0, 6) + "..." + stxAddress.slice(-4)}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-verifund-sage/30">
                      <div className="py-1">
                        <button
                          onClick={handleDisconnect}
                          className="block w-full text-left px-4 py-2 text-sm text-verifund-forest-dark hover:bg-verifund-sage/10 transition-colors"
                        >
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="outline" size="sm" className="btn-secondary w-fit" onClick={connectWallet}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
