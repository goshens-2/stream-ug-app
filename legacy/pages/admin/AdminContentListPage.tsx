import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';

/** Admin view of all content, grouped by category, with links to edit. */
export function AdminContentListPage() {
  const { contents, categories } = useAppState();

  return (
    <div>
      <h1>Content</h1>
      <p>
        <Link to="/admin/content/new">+ Upload new content</Link>
      </p>
      {categories.map((category) => {
        const items = contents.filter((c) => c.categoryId === category.id);
        if (items.length === 0) return null;
        return (
          <div key={category.id}>
            <h2>{category.name}</h2>
            <ul>
              {items.map((content) => (
                <li key={content.id}>
                  <Link to={`/admin/content/${content.id}`}>{content.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
