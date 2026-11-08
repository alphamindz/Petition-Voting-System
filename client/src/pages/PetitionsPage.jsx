import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { petitionService } from '../services/petitionService';
import PetitionCard from '../components/PetitionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Community',
  'Environment',
  'Human Rights',
  'Education',
  'Healthcare',
  'Animal Welfare',
  'Technology',
  'Other'
];

const PetitionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const categoryParam = searchParams.get('category') || 'All';
  const statusParam = searchParams.get('status') || 'All';
  const sortParam = searchParams.get('sort') || 'popular';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (!val || val === 'All' || (key === 'page' && val === 1)) {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated);
  };

  useEffect(() => {
    const fetchPetitions = async () => {
      setLoading(true);
      try {
        const data = await petitionService.getPetitions({
          page: pageParam,
          limit: 9,
          category: categoryParam !== 'All' ? categoryParam : undefined,
          status: statusParam !== 'All' ? statusParam : undefined,
          sort: sortParam,
          search: searchParam || undefined
        });

        setPetitions(data.petitions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching petitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
  }, [categoryParam, statusParam, sortParam, searchParam, pageParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '', page: 1 });
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Explore Civic Petitions
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Discover and support grassroots campaigns driving social and policy change.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="filter-search-row">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by keywords, titles, or causes..."
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
            Search
          </button>
        </form>

        {/* Categories Bar */}
        <div className="filter-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${categoryParam === cat ? 'active' : ''}`}
              onClick={() => updateFilters({ category: cat, page: 1 })}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bottom Sorting Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: '0.75rem',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            Showing <strong>{petitions.length}</strong> of <strong>{total}</strong> petitions
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label htmlFor="statusSelect" style={{ fontWeight: 600 }}>Status:</label>
              <select
                id="statusSelect"
                value={statusParam}
                onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="successful">Successful / Won</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label htmlFor="sortSelect" style={{ fontWeight: 600 }}>Sort By:</label>
              <select
                id="sortSelect"
                value={sortParam}
                onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="target">Smallest Goal First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Petitions Grid */}
      {loading ? (
        <LoadingSpinner fullScreen text="Loading petitions..." />
      ) : petitions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}
        >
          <SlidersHorizontal size={40} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No petitions match your criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Try resetting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            }}
            className="btn btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="petitions-grid">
            {petitions.map((petition) => (
              <PetitionCard key={petition._id} petition={petition} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '3rem'
              }}
            >
              <button
                className="btn btn-secondary"
                disabled={pageParam <= 1}
                onClick={() => updateFilters({ page: pageParam - 1 })}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span style={{ margin: '0 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Page {pageParam} of {totalPages}
              </span>

              <button
                className="btn btn-secondary"
                disabled={pageParam >= totalPages}
                onClick={() => updateFilters({ page: pageParam + 1 })}
                style={{ padding: '0.5rem 0.85rem' }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PetitionsPage;
