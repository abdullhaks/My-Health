import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface ILocation {
  type: "Point";
  coordinates: [number, number];
  text: string;
}

interface IGeoapifySuggestion {
  lat: number;
  lon: number;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  formatted?: string;
}

interface GeoapifyCustomAutocompleteProps {
  value: string;
  onChange: (value: ILocation) => void;
  setError?: (error: string | undefined) => void;
  className?: string;
  onCoordinatesChange?: (lat: number, lon: number) => void;
}

const GeoapifyAutocomplete = ({
  value,
  onChange,
  setError,
  className,
  onCoordinatesChange,
}: GeoapifyCustomAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<IGeoapifySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value); // Local state for input value
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
        params: {
          text,
          apiKey: geoapifyApiKey,
          filter: "countrycode:in",
          type: "city",
          format: "json",
          limit: 5,
          lang: "en",
        },
      });

      setSuggestions(response.data.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error("Geoapify error:", error);
      setSuggestions([]);
      if (setError) setError("Failed to fetch location suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange({
      type: "Point",
      coordinates: [NaN, NaN],
      text: val,
    });

    if (setError) setError(undefined);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: IGeoapifySuggestion) => {
    const place = [
      suggestion.city,
      suggestion.county,
      suggestion.state,
      suggestion.country,
    ]
      .filter(Boolean)
      .join(", ");

    const selectedLocation: ILocation = {
      type: "Point",
      coordinates: [suggestion.lon, suggestion.lat],
      text: place,
    };

    setInputValue(place); // Update local input value
    onChange(selectedLocation);
    if (onCoordinatesChange) onCoordinatesChange(suggestion.lat, suggestion.lon);
    setSuggestions([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.focus(); // Retain focus on input
  };

  // Sync inputValue with prop value when it changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Increased delay
        placeholder="Enter city in India..."
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${className}`}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => {
            const place = [
              suggestion.city,
              suggestion.county,
              suggestion.state,
              suggestion.country,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={idx}
                onMouseDown={() => handleSelectSuggestion(suggestion)} // Use onMouseDown instead of onClick
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {place}
              </li>
            );
          })}
        </ul>
      )}
      {loading && (
        <div className="absolute right-3 top-2.5 text-sm text-gray-400">Loading...</div>
      )}
    </div>
  );
};

export default GeoapifyAutocomplete;