import { SearchIcon } from './AppIcons';

export default function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return (
    <div className="admin-search-input">
      <SearchIcon size={16} className="admin-search-input__icon" />
      <input
        type="text"
        className="admin-search-input__field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
