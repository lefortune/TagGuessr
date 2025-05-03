import React, { useState, useEffect, useRef } from 'react';

const TagSearchInput = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Debounce API call
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch(`/api/autofill?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setShowDropdown(true);
          setActiveIndex(-1);
        })
        .catch(err => {
          console.error('Autofill fetch error:', err);
          setSuggestions([]);
        });
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  const handleSelect = (tag) => {
    setQuery(tag.name);
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    if (onSelect) onSelect(tag.name); // Pass selected tag to parent
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(suggestions[activeIndex]);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        className="w-full border px-3 py-2 rounded shadow"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder="Type a tag..."
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border mt-1 max-h-60 overflow-y-auto rounded shadow">
          {suggestions.map((tag, index) => (
            <li
              key={tag.name}
              className={`px-3 py-2 cursor-pointer ${
                index === activeIndex ? 'bg-blue-100' : ''
              }`}
              onMouseDown={() => handleSelect(tag)}
            >
              <span className="font-medium">{tag.name}</span>
              <span className="text-sm text-gray-500 ml-2">{tag.postCount.toLocaleString()} posts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagSearchInput;
