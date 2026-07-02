import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    brand_name: 'AURA',
    hero_title: 'Elevate Your Style',
    hero_subtitle: 'Discover our latest premium collection. Designed for the modern trendsetter.',
    footer_text: 'Premium fashion for the modern individual. Designed with elegance in mind.',
    contact_email: 'support@aura.com',
    contact_phone: '1-800-AURA'
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching settings:", error.message);
      } else if (data) {
        setSettings({
          brand_name: data.brand_name || 'AURA',
          hero_title: data.hero_title || 'Elevate Your Style',
          hero_subtitle: data.hero_subtitle || 'Discover our latest premium collection.',
          footer_text: data.footer_text || 'Premium fashion for the modern individual.',
          contact_email: data.contact_email || 'support@aura.com',
          contact_phone: data.contact_phone || '1-800-AURA'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loadingSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
