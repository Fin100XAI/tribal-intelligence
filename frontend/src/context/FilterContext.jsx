import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const FilterContext = createContext(null);

const DEFAULTS = {
  district: 'all',
  division: 'all',
  department: 'all',
  scheme: 'all',
  gender: 'All',
  ageGroup: 'all',
  tribalGroup: 'all',
  vulnerability: 'all',
  risk: 'all',
  status: 'all',
  dateFrom: '2026-04-01',
  dateTo: '2026-06-01',
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULTS);
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState(false);

  useEffect(() => {
    api
      .filters()
      .then((res) => setOptions(res.filters))
      .catch(() => setOptionsError(true));
  }, []);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const resetFilters = () => setFilters(DEFAULTS);

  // Every filter is forwarded so each one affects the data the backend returns.
  const queryParams = useMemo(
    () => ({
      district: filters.district,
      division: filters.division,
      department: filters.department,
      scheme: filters.scheme,
      gender: filters.gender,
      age: filters.ageGroup,
      tribal: filters.tribalGroup,
      vulnerability: filters.vulnerability,
      risk: filters.risk,
      status: filters.status,
      from: filters.dateFrom,
      to: filters.dateTo,
    }),
    [filters],
  );

  const value = { filters, setFilter, setFilters, resetFilters, options, optionsError, queryParams };
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
}
