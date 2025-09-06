"use client";
import { useEffect, useState } from 'react';
import { CountrySelector } from '@/components/country-selector';

interface State {
  name: string;
  state_code: string;
}

interface Country {
  name: string;
  iso2: string;
  states: State[];
}

interface Props {
  onCountryChange?: (countryCode: string) => void;
  onStateChange?: (stateCode: string) => void;
  showTitle?: boolean;
}

export default function CountrySelectorPage({ onCountryChange, onStateChange, showTitle = true }: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/countries');
        if (!res.ok) throw new Error('Failed to load countries');
        const data = await res.json();
        if (isMounted) setCountries(data);
      } catch (e) {
        console.error(e);
        if (isMounted) setError('Failed to load countries');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);
  const handleCountryChange = (countryCode: string) => {
    onCountryChange?.(countryCode);
  };

  const handleStateChange = (stateCode: string) => {
    onStateChange?.(stateCode);
  };

  return (
    <div className="container mx-auto p-0">
      {showTitle && <h1 className="text-2xl font-bold mb-6">Select Country and State</h1>}
      {error && <div className="text-red-600">Failed to load countries.</div>}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <CountrySelector 
          countries={countries} 
          onCountryChange={handleCountryChange}
          onStateChange={handleStateChange}
        />
      )}
    </div>
  );
}