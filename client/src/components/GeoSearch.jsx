import React, { useState, useEffect, useRef } from "react";
import { geoSearch } from "../services/Services";

const emptySuggestions = () => ({
  districts: [],
  municipalities: [],
  addresses: [],
});

const CustomAutocomplete = ({
  placeholder,
  onPlaceSelected,
  onQueryChange,
  onKeyDown,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(emptySuggestions());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const latestQuery = useRef(query);
  const rootRef = useRef(null);
  const requestId = useRef(0);

  useEffect(() => {
    latestQuery.current = query;
  }, [query]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(emptySuggestions());
      setLoading(false);
      setSearched(false);
      setOpen(false);
      return;
    }

    const debounceFetch = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      setOpen(true);
      setSearched(false);

      try {
        const data = await geoSearch(latestQuery.current);
        if (id !== requestId.current) return;
        setSuggestions({
          districts: data.districts || [],
          municipalities: data.municipalities || [],
          addresses: data.addresses || [],
        });
        setSearched(true);
        setOpen(true);
      } catch (error) {
        if (id !== requestId.current) return;
        console.error("Error fetching data:", error);
        setSuggestions(emptySuggestions());
        setSearched(true);
        setOpen(true);
      } finally {
        if (id !== requestId.current) return;
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(debounceFetch);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
    if (value.trim().length >= 2) {
      setOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion, type) => {
    let fullAddress = "";

    if (type === "district") {
      fullAddress = suggestion.district;
    } else if (type === "municipality") {
      fullAddress = `${suggestion.municipality}, ${suggestion.district}`;
    } else {
      fullAddress = `${suggestion.parish}, ${suggestion.municipality}, ${suggestion.district}`;
    }

    setQuery(fullAddress);
    setSuggestions(emptySuggestions());
    setOpen(false);
    setSearched(false);
    onPlaceSelected?.(suggestion);
  };

  const hasResults =
    suggestions.districts.length > 0 ||
    suggestions.municipalities.length > 0 ||
    suggestions.addresses.length > 0;

  const showDropdown = open && query.length >= 2 && (loading || searched);

  return (
    <div ref={rootRef} className="geosearch-root" style={{ width: "100%", position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (query.length >= 2 && (hasResults || searched)) {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="border-0 w-100"
        autoComplete="off"
      />
      {showDropdown ? (
        <ul className="geosearch-dropdown">
          {loading && (
            <li className="geosearch-dropdown__status">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </li>
          )}
          {!loading && !hasResults && (
            <li className="geosearch-dropdown__status geosearch-dropdown__empty">
              No matching places — you can still press Search
            </li>
          )}
          {!loading &&
            suggestions.districts.map((suggestion, index) => (
              <li
                key={`district-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion, "district");
                }}
                className="geosearch-dropdown__item border-bottom"
              >
                <strong>{suggestion.district}</strong>
                <div className="geosearch-dropdown__meta">
                  <span>District</span>
                  <span>{suggestion?.propertyCount}</span>
                </div>
              </li>
            ))}
          {!loading &&
            suggestions.municipalities.map((suggestion, index) => (
              <li
                key={`municipality-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion, "municipality");
                }}
                className="geosearch-dropdown__item border-bottom"
              >
                <strong>
                  {suggestion.municipality}, {suggestion.district}
                </strong>
                <div className="geosearch-dropdown__meta">
                  <span>Municipality</span>
                  <span>{suggestion?.propertyCount}</span>
                </div>
              </li>
            ))}
          {!loading &&
            suggestions.addresses.map((suggestion, index) => (
              <li
                key={`address-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion, "addresses");
                }}
                className="geosearch-dropdown__item border-bottom"
              >
                <strong>
                  {suggestion.parish}, {suggestion.municipality},{" "}
                  {suggestion.district}
                </strong>
                <div className="geosearch-dropdown__meta">
                  <span>Address</span>
                  <span>{suggestion?.propertyCount}</span>
                </div>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
};

export default CustomAutocomplete;
