import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

/** Admin page to create and view content types (e.g. Movie, Series, Music Video). */
export function AdminContentTypesPage() {
  const { contentTypes, addContentType } = useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    addContentType({ id: `ct-${Date.now()}`, name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
  };

  return (
    <div>
      <h1>Content Types</h1>
      <ul>
        {contentTypes.map((ct) => (
          <li key={ct.id}>
            <strong>{ct.name}</strong>
            {ct.description ? ` — ${ct.description}` : ''}
          </li>
        ))}
      </ul>
      <h2>Add a Content Type</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Description
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
