
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Wallet, 
  Bell, 
  Shield, 
  Settings as SettingsIcon,
  ExternalLink,
  LogOut
} from "lucide-react";
import Navbar from "@/components/Navbar";

const Settings = () => {
  const userWallet = "0x1234567890abcdef1234567890abcdef12345678";
  const stacksBalance = 1250.75;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <div className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-verifund-neutral-gray">Manage your account and preferences</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    <a href="#profile" className="flex items-center space-x-3 p-4 text-verifund-light-accent hover:bg-verifund-accent-dark/20 transition-colors">
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </a>
                    <a href="#wallet" className="flex items-center space-x-3 p-4 text-verifund-light-accent hover:bg-verifund-accent-dark/20 transition-colors">
                      <Wallet className="w-5 h-5" />
                      <span>Wallet</span>
                    </a>
                    <a href="#notifications" className="flex items-center space-x-3 p-4 text-verifund-light-accent hover:bg-verifund-accent-dark/20 transition-colors">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </a>
                    <a href="#security" className="flex items-center space-x-3 p-4 text-verifund-light-accent hover:bg-verifund-accent-dark/20 transition-colors">
                      <Shield className="w-5 h-5" />
                      <span>Security</span>
                    </a>
                    <a href="#preferences" className="flex items-center space-x-3 p-4 text-verifund-light-accent hover:bg-verifund-accent-dark/20 transition-colors">
                      <SettingsIcon className="w-5 h-5" />
                      <span>Preferences</span>
                    </a>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Section */}
              <Card id="profile" className="glass-card">
                <CardHeader>
                  <CardTitle className="text-verifund-light-accent flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-verifund-accent-dark to-verifund-mid-tone rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <Button variant="outline" className="btn-secondary">
                        Change Avatar
                      </Button>
                      <p className="text-verifund-neutral-gray text-sm mt-1">
                        Upload a profile picture
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Display Name
                      </label>
                      <Input
                        placeholder="Your display name"
                        className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-verifund-light-accent font-medium mb-2">
                      Bio
                    </label>
                    <Textarea
                      placeholder="Tell others about yourself..."
                      rows={4}
                      className="bg-verifund-primary-dark border-verifund-accent-dark text-verifund-light-accent"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button className="btn-primary">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Section */}
              <Card id="wallet" className="glass-card">
                <CardHeader>
                  <CardTitle className="text-verifund-light-accent flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connected Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-verifund-secondary-dark/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-verifund-neutral-gray">Wallet Address</span>
                      <Button variant="outline" size="sm" className="btn-secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                    <p className="text-verifund-light-accent font-mono text-sm">
                      {userWallet}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-verifund-secondary-dark/50 p-4 rounded-lg">
                      <h4 className="text-verifund-light-accent font-medium mb-2">STX Balance</h4>
                      <p className="text-2xl font-bold text-verifund-light-accent">
                        {stacksBalance.toLocaleString()} STX
                      </p>
                    </div>
                    <div className="bg-verifund-secondary-dark/50 p-4 rounded-lg">
                      <h4 className="text-verifund-light-accent font-medium mb-2">Network</h4>
                      <p className="text-verifund-light-accent">Stacks Mainnet</p>
                    </div>
                  </div>

                  <Separator className="bg-verifund-accent-dark/30" />

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-verifund-light-accent font-medium">Disconnect Wallet</h4>
                      <p className="text-verifund-neutral-gray text-sm">
                        This will disconnect your wallet from VeriFund
                      </p>
                    </div>
                    <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Section */}
              <Card id="notifications" className="glass-card">
                <CardHeader>
                  <CardTitle className="text-verifund-light-accent flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Campaign Updates</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Get notified about campaigns you've backed
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Milestone Voting</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Alerts when milestone voting begins
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">New Campaigns</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Discover newly launched campaigns
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Marketing Emails</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Receive updates about VeriFund features
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Section */}
              <Card id="security" className="glass-card">
                <CardHeader>
                  <CardTitle className="text-verifund-light-accent flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Two-Factor Authentication</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline" className="btn-secondary">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Login Notifications</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Get notified of logins from new devices
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Session Timeout</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Automatically log out after 30 minutes of inactivity
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Separator className="bg-verifund-accent-dark/30" />

                  <div>
                    <h4 className="text-verifund-light-accent font-medium mb-3">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-verifund-secondary-dark/30 rounded-lg">
                        <div>
                          <p className="text-verifund-light-accent font-medium">Current Session</p>
                          <p className="text-verifund-neutral-gray text-sm">Chrome on MacOS • San Francisco, CA</p>
                        </div>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences Section */}
              <Card id="preferences" className="glass-card">
                <CardHeader>
                  <CardTitle className="text-verifund-light-accent flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Dark Mode</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Compact View</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Show more campaigns in less space
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-verifund-light-accent font-medium">Auto-refresh</h4>
                        <p className="text-verifund-neutral-gray text-sm">
                          Automatically update campaign data
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Separator className="bg-verifund-accent-dark/30" />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Default Currency
                      </label>
                      <select className="w-full p-3 bg-verifund-primary-dark border border-verifund-accent-dark rounded-lg text-verifund-light-accent">
                        <option>STX (Stacks)</option>
                        <option>USD</option>
                        <option>BTC (Bitcoin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-verifund-light-accent font-medium mb-2">
                        Time Zone
                      </label>
                      <select className="w-full p-3 bg-verifund-primary-dark border border-verifund-accent-dark rounded-lg text-verifund-light-accent">
                        <option>UTC</option>
                        <option>PST (Pacific)</option>
                        <option>EST (Eastern)</option>
                        <option>GMT (Greenwich)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="btn-primary">Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
