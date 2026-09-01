import { useAppState } from '../../context/AppStateContext';

/** Admin view of categories and how many content items are grouped under each. */
export function AdminCategoriesPage() {
  const { categories, contents } = useAppState();

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
    </div>
  );
}
