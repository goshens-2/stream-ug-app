import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Admin view of categories: how many content items are grouped under each, plus creation. */
export function AdminCategoriesPage() {
  const { categories, contents, addCategory } = useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addCategory({
      name: trimmedName,
      slug: slugify(trimmedName),
      description: description.trim() || undefined,
    });
    setName('');
    setDescription('');
  };

  return (
    <div>
      <h1>Categories</h1>
      <p>Movies shown to users on the User Panel are grouped by these categories.</p>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <strong>{category.name}</strong> —{' '}
            {contents.filter((c) => c.categoryId === category.id).length} item(s)
          </li>
        ))}
      </ul>
      <h2>Add a Category</h2>
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
