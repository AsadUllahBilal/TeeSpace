'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Removed Select-based UI in favor of list-style picker with search
import { Input } from '@/components/ui/input';

interface State {
  name: string;
  state_code: string;
}

interface Country {
  name: string;
  iso2: string;
  states: State[];
}

interface CountrySelectorProps {
  countries: Country[];
  onCountryChange: (countryCode: string) => void;
  onStateChange: (stateCode: string) => void;
}

export function CountrySelector({ 
  countries, 
  onCountryChange, 
  onStateChange 
}: CountrySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [stateSearch, setStateSearch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [isCountryOpen, setIsCountryOpen] = useState<boolean>(false);
  const [isStateOpen, setIsStateOpen] = useState<boolean>(false);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    const term = countrySearch.toLowerCase();
    return countries.filter(country => country.name.toLowerCase().includes(term));
  }, [countries, countrySearch]);

  const selectedStates = useMemo(() => {
    const states = countries.find((c) => c.iso2 === selectedCountry)?.states || [];
    const term = stateSearch.toLowerCase();
    if (!term) return states;
    return states.filter((s) => s.name.toLowerCase().includes(term));
  }, [countries, selectedCountry, stateSearch]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedState('');
    setStateSearch('');
    onCountryChange(value);
    setIsCountryOpen(false);
  };

  const selectedCountryName = useMemo(() => {
    return countries.find((c) => c.iso2 === selectedCountry)?.name || '';
  }, [countries, selectedCountry]);

  const selectedStateName = useMemo(() => {
    const s = (countries.find((c) => c.iso2 === selectedCountry)?.states || []).find(
      (st) => st.state_code === selectedState || st.name === selectedState
    );
    return s?.name || '';
  }, [countries, selectedCountry, selectedState]);

  return (
    <div className="space-y-6">
      {/* Country Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Country</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsCountryOpen((o) => !o)}
        >
          {selectedCountryName || 'Select a country'}
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
        {isCountryOpen && (
        <div className="rounded-md border p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map((country) => {
              const isActive = selectedCountry === country.iso2;
              return (
                <button
                  key={country.iso2}
                  type="button"
                  className={`w-full text-left px-2 py-2 rounded hover:bg-accent transition-colors ${isActive ? 'bg-accent' : ''}`}
                  onClick={() => handleCountryChange(country.iso2)}
                >
                  {country.name}
                </button>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="text-sm text-muted-foreground px-2">No countries found</div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* State Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">State/Province</label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsStateOpen((o) => !o)}
          disabled={!selectedCountry}
        >
          {selectedStateName || (selectedCountry ? 'Select a state' : 'Select a country first')}
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
        {isStateOpen && (
        <div className="rounded-md border p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={selectedCountry ? 'Search states...' : 'Select a country first'}
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="pl-8"
              disabled={!selectedCountry || (countries.find((c) => c.iso2 === selectedCountry)?.states?.length === 0)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {selectedCountry && selectedStates.length > 0 ? (
              selectedStates.map((state, idx) => {
                const value = state.state_code || state.name;
                const isActive = selectedState === value;
                return (
                  <button
                    key={`${value}-${idx}`}
                    type="button"
                    className={`w-full text-left px-2 py-2 rounded hover:bg-accent transition-colors ${isActive ? 'bg-accent' : ''}`}
                    onClick={() => { setSelectedState(value); onStateChange(value); setIsStateOpen(false); }}
                  >
                    {state.name}
                  </button>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground px-2">
                {selectedCountry ? 'No states available' : 'Please select a country'}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
